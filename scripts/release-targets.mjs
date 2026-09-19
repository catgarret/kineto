// The repository ships two npm packages from one `main` branch, each released
// by its own annotated tag:
//
//   v1.2.3      → @dong-gri/kineto      (root package,  .github/workflows/release.yml)
//   mcp-v1.2.3  → @dong-gri/kineto-mcp  (packages/kineto-mcp, .github/workflows/release-mcp.yml)
//
// `npm run release:ship -- <tag>` and the tag-validation scripts look the tag
// up here, so adding a third package means adding one entry, not a new script.
export const RELEASE_TARGETS = Object.freeze([
  Object.freeze({
    id: 'kineto',
    label: 'Kineto',
    tagPattern: /^v(\d+\.\d+\.\d+)$/,
    tagExample: 'v0.11.0',
    packageDir: '.',
    checkScript: 'scripts/check-release.mjs',
    workflow: '.github/workflows/release.yml'
  }),
  Object.freeze({
    id: 'kineto-mcp',
    label: 'Kineto MCP',
    tagPattern: /^mcp-v(\d+\.\d+\.\d+)$/,
    tagExample: 'mcp-v0.1.0',
    packageDir: 'packages/kineto-mcp',
    checkScript: 'scripts/check-mcp-release.mjs',
    workflow: '.github/workflows/release-mcp.yml'
  })
]);

/** Resolve a tag to its release target, or null when no package owns it. */
export function resolveReleaseTarget(tag) {
  for (const target of RELEASE_TARGETS) {
    const match = target.tagPattern.exec(tag || '');
    if (match) return { ...target, tag, version: match[1] };
  }
  return null;
}
