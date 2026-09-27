// Shared by measure.mjs (Vite) and measure-rolldown.mjs (Rolldown): turning a
// bundler's chunks into numbers, the markdown table, and the check that
// docs/consumer-bundle-size.md still describes what the bundlers produce.
//
// Why "initial" vs "on demand": the `auto` entry is the core plus one import()
// per module. What a page downloads first is the entry chunk and its STATIC
// imports; module chunks are fetched only when markup uses them. Summing every
// chunk would report the whole library for an entry that never loads it.
import zlib from 'node:zlib';

export const kb = (bytes) => bytes / 1024;
const gzipSize = (code) => zlib.gzipSync(code, { level: 9 }).length;

/**
 * @param {{ fileName: string, code: string, isEntry: boolean, imports: string[] }[]} chunks
 * @returns {{ files: number, raw: number, gzip: number, lazyFiles: number, lazyGzip: number }} KB
 */
export function sizeChunks(chunks) {
  const byName = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
  const initial = new Set();
  const visit = (name) => {
    if (initial.has(name) || !byName.has(name)) return;
    initial.add(name);
    byName.get(name).imports.forEach(visit);
  };
  chunks.filter((chunk) => chunk.isEntry).forEach((chunk) => visit(chunk.fileName));
  const first = chunks.filter((chunk) => initial.has(chunk.fileName));
  const later = chunks.filter((chunk) => !initial.has(chunk.fileName));
  return {
    files: first.length,
    raw: kb(first.reduce((total, chunk) => total + Buffer.byteLength(chunk.code), 0)),
    gzip: kb(first.reduce((total, chunk) => total + gzipSize(chunk.code), 0)),
    lazyFiles: later.length,
    lazyGzip: kb(later.reduce((total, chunk) => total + gzipSize(chunk.code), 0))
  };
}

const budgetCell = (row) => `≤ ${row.budget} KB${row.variance ? ` (+${row.variance} KB runner variance)` : ''}`;
const lazyCell = (row) => (row.lazyFiles ? `${row.lazyFiles} (${row.lazyGzip.toFixed(1)} KB)` : '—');

export function formatTable(rows, label) {
  return [
    `| ${label} | JS files | Raw | Gzip | On-demand chunks | Budget (gzip) |`,
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...rows.map((row) => `| ${row.name} | ${row.files} | ${row.raw.toFixed(1)} KB | ${row.gzip.toFixed(1)} KB | ${lazyCell(row)} | ${budgetCell(row)} |`)
  ].join('\n');
}

/**
 * Compare a committed table with fresh measurements. Entry names and budgets
 * must match exactly (they come from fixture-config.mjs); a recorded gzip may
 * differ from the measurement by at most the row's runner variance + 0.5 KB,
 * so a report left behind by a size change fails while runner noise does not.
 */
export function checkReportTable(markdown, rows, label) {
  const lines = markdown.split('\n').filter((line) => line.startsWith(`| `) && !line.startsWith(`| ${label}`) && !line.startsWith('| ---'));
  const recorded = new Map(lines.map((line) => {
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    return [cells[0], { gzip: Number.parseFloat(cells[3]), budget: cells[5] }];
  }));
  const problems = [];
  const names = rows.map((row) => row.name);
  const extra = [...recorded.keys()].filter((name) => !names.includes(name));
  if (extra.length) problems.push(`rows not in the fixture matrix: ${extra.join(', ')}`);
  rows.forEach((row) => {
    const entry = recorded.get(row.name);
    if (!entry) { problems.push(`missing row ${row.name}`); return; }
    if (entry.budget !== budgetCell(row)) problems.push(`${row.name}: budget "${entry.budget}" ≠ "${budgetCell(row)}"`);
    const tolerance = (row.variance || 0) + 0.5;
    if (!(Math.abs(entry.gzip - row.gzip) <= tolerance)) problems.push(`${row.name}: recorded ${entry.gzip} KB, measured ${row.gzip.toFixed(1)} KB (tolerance ${tolerance} KB)`);
  });
  return problems;
}
