#!/usr/bin/env node
// Entry point for `npx @dong-gri/kineto-mcp`: serves the Kineto MCP server
// over stdio (the transport every MCP client — Claude Code, Cursor, Codex,
// Claude Desktop — speaks). No ports, no network.
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createKinetoServer } from '../src/server.mjs';

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  const { loadContracts } = await import('../src/contracts.mjs');
  const { pkg, meta } = loadContracts();
  console.log(`${pkg.name} ${pkg.version} (Kineto ${meta.kinetoVersion}, feature contract ${meta.featureContractVersion}, integrations ${meta.integrationsVersion})`);
  process.exit(0);
}

const server = createKinetoServer();
const transport = new StdioServerTransport();
await server.connect(transport);
// stdout belongs to the protocol; status goes to stderr.
console.error('kineto-mcp ready (stdio)');
