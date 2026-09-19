// MCP wiring: registers the Kineto tools/resources on an McpServer.
//
// Security posture (keep when extending):
//   - stdio only — the server never opens a port and never makes a request;
//   - every tool input passes a bounded zod schema before touching the logic;
//   - answers are computed from the bundled contracts, so no user input is
//     ever evaluated, templated into a shell, or used as a file path;
//   - stdout is the protocol channel: log to stderr only.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { loadContracts } from './contracts.mjs';
import { FRAMEWORKS, describeEcosystem, describeModule, listModules, mapFigmaLayers, renderSnippet, suggestIntents, validate } from './tools.mjs';

const MAX_QUERY = 400;
const identifier = z.string().min(1).max(64).regex(/^[a-zA-Z][a-zA-Z0-9-]*$/, 'letters, digits and dashes only');
const optionValue = z.union([z.string().max(500), z.number(), z.boolean()]);
const optionsSchema = z.record(z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/), optionValue).refine((value) => Object.keys(value).length <= 60, 'at most 60 options');
const frameworkSchema = z.enum(FRAMEWORKS).default('html').describe('Snippet flavour: html (data-kt-* attributes), react (JSX + useKineto), vue (attrs + v-motion) or js (Kineto.create).');
const ecosystemSchema = z.string().max(32).regex(/^[a-z0-9-]+$/).optional().describe('Ecosystem id from kineto_ecosystem (shadcn, tailwind, bootstrap, mui, mantine, chakra, antd, daisyui, nuxt-ui, primevue, vuetify, vanilla). Adds library-vs-Kineto decisions and conflict notes.');

/** Wrap a plain result as an MCP tool result (text JSON + structured copy). */
function reply(result) {
  const isError = Boolean(result && result.error);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], structuredContent: result, isError };
}

export function createKinetoServer(contracts = loadContracts()) {
  const server = new McpServer(
    { name: 'kineto-mcp', version: contracts.pkg.version },
    {
      instructions: [
        `Kineto ${contracts.meta.kinetoVersion} motion/media library assistant (${contracts.meta.moduleCount} modules, ${contracts.meta.intentCount} design intents).`,
        'Workflow: kineto_suggest (or kineto_figma_layers for a Figma frame) → pick a recipe → kineto_snippet for the exact markup → kineto_validate_options before writing custom options.',
        'Rules of thumb: the host UI library (shadcn, Bootstrap, MUI …) owns behaviour and accessibility; Kineto adds motion through data-kt-* attributes on the same element; call Kineto.observe() once per app so dynamically rendered elements are picked up. Read kineto://rules for the full guidance.'
      ].join(' ')
    }
  );

  server.registerTool('kineto_list_modules', {
    title: 'List Kineto modules',
    description: 'Every Kineto module with its data-kt-* attribute, variants, accessibility/performance/reduced-motion status and the design intents that use it. Optional free-text filter.',
    inputSchema: { query: z.string().max(MAX_QUERY).optional().describe('Filter on module name, attribute, variant or intent id.') }
  }, async ({ query }) => reply(listModules(contracts, { query: query || '' })));

  server.registerTool('kineto_module', {
    title: 'Describe a Kineto module',
    description: 'Full public contract of one module: attribute grammar, variant key, variants, public options with defaults, JS API and snippets in every flavour.',
    inputSchema: { name: identifier.describe('Module name, camelCase (e.g. textReveal, cardGlow, lazy).') }
  }, async ({ name }) => reply(describeModule(contracts, { name })));

  server.registerTool('kineto_suggest', {
    title: 'Suggest Kineto modules for a design intent',
    description: 'Rank design intents for a free-text description, a component name or a Figma layer name (English or Korean) and return their recipes with ready attributes and snippets. Pass ecosystem to learn whether the UI library already provides the behaviour.',
    inputSchema: {
      query: z.string().min(1).max(MAX_QUERY).describe('What the element is or should do: "hero headline", "KPI number", "카드 호버", "Frame/Card/Thumbnail" …'),
      ecosystem: ecosystemSchema,
      framework: frameworkSchema,
      component: z.string().max(64).regex(/^[A-Za-z][A-Za-z0-9.]*$/).optional().describe('Component tag to use in react/vue snippets, e.g. Card or Button.'),
      limit: z.number().int().min(1).max(20).default(5)
    }
  }, async (input) => reply(suggestIntents(contracts, input)));

  server.registerTool('kineto_snippet', {
    title: 'Render a Kineto snippet',
    description: 'Exact markup/code for a module + variant + options in html, react, vue or js form. Options are validated against the public contract first; unknown keys come back with "did you mean" hints.',
    inputSchema: {
      module: identifier.describe('Module name (camelCase) or the core primitives presence / states.'),
      variant: z.string().max(64).optional(),
      options: optionsSchema.optional().describe('Public options in camelCase (duration, delay, stagger, once …). Booleans become bare attributes.'),
      framework: frameworkSchema,
      component: z.string().max(64).regex(/^[A-Za-z][A-Za-z0-9.]*$/).optional()
    }
  }, async (input) => reply(renderSnippet(contracts, input)));

  server.registerTool('kineto_validate_options', {
    title: 'Validate Kineto options',
    description: 'Check an options object against a module\'s public option list and variant set. Never throws: returns unknown keys, closest matches and the data-kt-* attribute form of each valid key.',
    inputSchema: { module: identifier, options: optionsSchema }
  }, async (input) => reply(validate(contracts, input)));

  server.registerTool('kineto_ecosystem', {
    title: 'Describe an ecosystem integration',
    description: 'How to attach Kineto next to one UI library or design system: attach pattern, setup, what the library already provides, conflicts to avoid, per-intent decisions and example pages.',
    inputSchema: { id: z.string().max(32).regex(/^[a-z0-9-]+$/).describe('shadcn, tailwind, bootstrap, mui, mantine, chakra, antd, daisyui, nuxt-ui, primevue, vuetify or vanilla') }
  }, async ({ id }) => reply(describeEcosystem(contracts, { id })));

  server.registerTool('kineto_figma_layers', {
    title: 'Map Figma layers to Kineto intents',
    description: 'Given layer names (plus optional node type, font size, image fill, text) read through the Figma MCP, return the matching intent, the library-vs-Kineto decision and a ready attribute list per layer.',
    inputSchema: {
      layers: z.array(z.object({
        name: z.string().min(1).max(200),
        type: z.string().max(32).optional().describe('Figma node type: TEXT, FRAME, INSTANCE, RECTANGLE, IMAGE …'),
        fontSize: z.number().min(0).max(1000).optional(),
        imageFill: z.boolean().optional(),
        text: z.string().max(500).optional().describe('Text content of a TEXT node; digits-only text maps to kpi-number.')
      })).min(1).max(200),
      ecosystem: ecosystemSchema,
      framework: frameworkSchema
    }
  }, async (input) => reply(mapFigmaLayers(contracts, input)));

  const resources = [
    ['rules', 'kineto://rules', 'text/markdown', 'Rules for coding agents: principles, attachment grammar, intent → module table, per-library notes.', () => contracts.rules],
    ['integrations', 'kineto://integrations', 'application/json', 'The integration map (ecosystems, intents, Figma hints) as JSON.', () => JSON.stringify(contracts.integrations, null, 2)],
    ['features', 'kineto://features', 'application/json', 'The feature contract: every module, variant, public option and default.', () => JSON.stringify(contracts.features, null, 2)],
    ['meta', 'kineto://meta', 'application/json', 'Which Kineto version and contract versions this server answers from.', () => JSON.stringify(contracts.meta, null, 2)]
  ];
  for (const [name, uri, mimeType, description, text] of resources) {
    server.registerResource(name, uri, { title: `Kineto ${name}`, description, mimeType }, async (target) => ({ contents: [{ uri: target.href, mimeType, text: text() }] }));
  }

  server.registerPrompt('kineto_apply_motion', {
    title: 'Add Kineto motion to a component or Figma frame',
    description: 'A prompt that walks an agent through choosing and applying Kineto modules next to the project\'s UI library.',
    argsSchema: { target: z.string().max(MAX_QUERY).describe('The component, page or Figma frame to animate.'), ecosystem: z.string().max(32).optional() }
  }, ({ target, ecosystem }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: [
          `Add Kineto motion to: ${target}.`,
          ecosystem ? `The project uses the "${ecosystem}" ecosystem — call kineto_ecosystem("${ecosystem}") first and respect its conflicts.` : 'Detect the UI library in use and call kineto_ecosystem for it first.',
          'Then: call kineto_suggest for each element that should move, keep library-provided behaviour (dialogs, tooltips, tabs …) untouched, add the recipe attributes from kineto_snippet, validate custom options with kineto_validate_options, and make sure Kineto.observe() runs once at app start.',
          'Prefer one entrance per section, respect prefers-reduced-motion (Kineto handles it) and never set layout properties from motion code.'
        ].join('\n')
      }
    }]
  }));

  return server;
}
