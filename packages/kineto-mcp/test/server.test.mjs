// End-to-end test: spawn the real binary over stdio with the MCP client SDK
// and exercise every tool, resource and prompt the way an agent would.
// Run: npm test   (inside packages/kineto-mcp) or `npm run test:mcp` at the root.
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { loadContracts } from '../src/contracts.mjs';
import { describeEcosystem, listModules, mapFigmaLayers, renderSnippet, suggestIntents, validate } from '../src/tools.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const contracts = loadContracts();

// ---------------------------------------------------------------- pure logic
{
  const all = listModules(contracts);
  assert.equal(all.count, contracts.features.moduleCount, 'every module is listed');
  assert.ok(all.modules.every((module) => module.attribute.startsWith('data-kt-') && module.variants.length >= 1));
  assert.ok(all.modules.find((module) => module.name === 'tilt').performance, 'module metadata is merged in');
  assert.equal(listModules(contracts, { query: 'hangul' }).modules.map((module) => module.name).join(), 'textReveal', 'variant filter');

  const hero = suggestIntents(contracts, { query: 'Hero headline for the launch page', ecosystem: 'shadcn', framework: 'react', component: 'CardTitle' });
  assert.equal(hero.results[0].intent, 'hero-headline');
  assert.match(hero.results[0].recipes[0].attributes, /^data-kt-text-reveal="stream" data-kt-speed="30"$/);
  assert.match(hero.results[0].recipes[0].snippet, /<CardTitle data-kt-text-reveal="stream"/, 'react snippet uses the requested component');
  assert.match(hero.ecosystemNotes.title, /^shadcn\/ui/);

  const korean = suggestIntents(contracts, { query: '카드 호버' });
  assert.equal(korean.results[0].intent, 'card-hover', 'Korean keywords rank the same intent');

  const tooltip = suggestIntents(contracts, { query: 'tooltip', ecosystem: 'bootstrap' });
  assert.equal(tooltip.results[0].decision, 'prefer-library', 'Bootstrap already provides tooltips');
  assert.ok(tooltip.results[0].libraryEquivalent, 'the library equivalent is named');

  const snippet = renderSnippet(contracts, { module: 'lazy', variant: 'skeleton', options: { skeletonVariant: 'shimmer', once: true }, framework: 'html' });
  assert.equal(snippet.validation.ok, true);
  assert.equal(snippet.attributes, 'data-kt-lazy="skeleton" data-kt-skeleton-variant="shimmer" data-kt-once');
  assert.match(snippet.snippet, /^<img data-kt-lazy="skeleton"/);

  const invalid = validate(contracts, { module: 'reveal', options: { durations: 1, preset: 'fade-upp' } });
  assert.equal(invalid.ok, false);
  assert.deepEqual(invalid.unknown, ['durations']);
  assert.deepEqual(invalid.didYouMean.durations, ['duration']);
  assert.match(invalid.variantHint, /preset must be one of/);

  const unknown = validate(contracts, { module: 'tiltt', options: {} });
  assert.deepEqual(unknown.suggestions, ['tilt'], 'unknown module names get a did-you-mean');

  const layers = mapFigmaLayers(contracts, {
    layers: [
      { name: 'Hero / KV title', type: 'TEXT', fontSize: 64 },
      { name: 'Frame 12', type: 'TEXT', text: '12,800' },
      { name: 'Frame 13', type: 'RECTANGLE', imageFill: true },
      { name: 'Frame 14', type: 'FRAME' }
    ],
    ecosystem: 'mui'
  });
  assert.deepEqual(layers.layers.map((layer) => layer.intent), ['hero-headline', 'kpi-number', 'image-loading', null]);
  assert.ok(layers.layers[0].recipe.attributes.startsWith('data-kt-text-reveal'));

  // Tool input is untrusted: an id that names an Object built-in is simply
  // unknown, never Object's own machinery dressed up as an ecosystem.
  for (const id of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
    const answer = describeEcosystem(contracts, { id });
    assert.match(String(answer.error), /unknown ecosystem/, `ecosystem id "${id}" must be unknown`);
  }
}

// --------------------------------------------------------------- stdio round trip
const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(here, '../bin/kineto-mcp.mjs')], stderr: 'pipe' });
const client = new Client({ name: 'kineto-mcp-test', version: '0.0.0' });
try {
  await client.connect(transport);
  const info = client.getServerVersion();
  assert.equal(info.name, 'kineto-mcp');
  assert.equal(info.version, contracts.pkg.version);
  assert.match(client.getInstructions() || '', /kineto_suggest/);

  const tools = (await client.listTools()).tools.map((tool) => tool.name).sort();
  assert.deepEqual(tools, ['kineto_ecosystem', 'kineto_figma_layers', 'kineto_list_modules', 'kineto_module', 'kineto_snippet', 'kineto_suggest', 'kineto_validate_options']);

  const called = await client.callTool({ name: 'kineto_module', arguments: { name: 'counter' } });
  assert.equal(called.isError, false);
  assert.equal(called.structuredContent.attribute, 'data-kt-counter');
  assert.ok(called.structuredContent.publicOptions.includes('to'));
  assert.deepEqual(JSON.parse(called.content[0].text).variants, called.structuredContent.variants, 'text and structured content agree');

  const suggested = await client.callTool({ name: 'kineto_suggest', arguments: { query: 'loading spinner', ecosystem: 'antd', limit: 2 } });
  assert.equal(suggested.structuredContent.results.length, 2);
  assert.equal(suggested.structuredContent.results[0].intent, 'loading-state');

  // Input validation failures come back as tool errors (or a thrown McpError
  // on older SDKs); either way the logic never runs on hostile input.
  const rejectedText = async (request) => {
    const result = await client.callTool(request).catch((error) => ({ isError: true, content: [{ type: 'text', text: error.message }] }));
    assert.equal(result.isError, true, `${request.name} must reject ${JSON.stringify(request.arguments)}`);
    return result.content[0].text;
  };
  assert.match(await rejectedText({ name: 'kineto_validate_options', arguments: { module: '../../etc/passwd', options: {} } }), /Input validation error/, 'path-like module names are rejected by the schema');
  assert.match(await rejectedText({ name: 'kineto_snippet', arguments: { module: 'tilt', options: { 'max; rm -rf': 1 } } }), /Input validation error/, 'option keys are restricted to identifiers');
  assert.match(await rejectedText({ name: 'kineto_suggest', arguments: { query: 'x'.repeat(401) } }), /Input validation error/, 'query length is bounded');

  const unknownModule = await client.callTool({ name: 'kineto_module', arguments: { name: 'nope' } });
  assert.equal(unknownModule.isError, true, 'unknown modules are tool errors, not crashes');

  const ecosystem = await client.callTool({ name: 'kineto_ecosystem', arguments: { id: 'bootstrap' } });
  assert.ok(ecosystem.structuredContent.conflicts.length >= 3);
  assert.ok(ecosystem.structuredContent.examples?.[0]?.path.startsWith('examples/'));

  const figma = await client.callTool({ name: 'kineto_figma_layers', arguments: { layers: [{ name: 'CTA / Button', type: 'INSTANCE' }], ecosystem: 'shadcn', framework: 'react' } });
  assert.equal(figma.structuredContent.layers[0].intent, 'cta-button');

  const resources = (await client.listResources()).resources.map((resource) => resource.uri).sort();
  assert.deepEqual(resources, ['kineto://features', 'kineto://integrations', 'kineto://meta', 'kineto://rules']);
  const rules = await client.readResource({ uri: 'kineto://rules' });
  assert.equal(rules.contents[0].text, contracts.rules);
  const meta = JSON.parse((await client.readResource({ uri: 'kineto://meta' })).contents[0].text);
  assert.equal(meta.kinetoVersion, contracts.meta.kinetoVersion);

  const prompts = (await client.listPrompts()).prompts.map((prompt) => prompt.name);
  assert.deepEqual(prompts, ['kineto_apply_motion']);
  const prompt = await client.getPrompt({ name: 'kineto_apply_motion', arguments: { target: 'pricing page', ecosystem: 'shadcn' } });
  assert.match(prompt.messages[0].content.text, /kineto_ecosystem\("shadcn"\)/);
} finally {
  await client.close();
}

console.log(`kineto-mcp OK — ${contracts.meta.moduleCount} modules, ${contracts.meta.intentCount} intents served over stdio: 7 tools, 4 resources, 1 prompt verified against Kineto ${contracts.meta.kinetoVersion}.`);
