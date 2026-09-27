// Package metadata that decides whether a company can adopt Kineto.
//
// GitHub (licensee) and npm read the license from LICENSE and package.json.
// Until 0.13 the LICENSE held the MIT text with a stale copyright holder and a
// trailing third-party paragraph, which GitHub reported as "Other
// (NOASSERTION)" while README and package.json said MIT. This test keeps the
// three in agreement:
//   - LICENSE is the verbatim MIT text (SPDX template) with the owner's line;
//   - the MCP package ships the identical LICENSE;
//   - both package.json files say MIT with the same author object;
//   - the package description does not carry a module count that can go stale.
// Run: node tests/license.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const HOLDER = 'dongri (https://dongri.me)';

// The SPDX MIT template, word for word. Do not reflow: licensee compares text.
const MIT = `MIT License

Copyright (c) <year> ${HOLDER}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const license = read('LICENSE');
assert.equal(license.replace(/Copyright \(c\) \d{4}(?:-\d{4})? /, 'Copyright (c) <year> '), MIT,
  'LICENSE must be exactly the MIT text with the owner line (extra paragraphs make GitHub report NOASSERTION)');
assert.equal(read('packages/kineto-mcp/LICENSE'), license, 'the MCP package must ship the same LICENSE');

const main = JSON.parse(read('package.json'));
const mcp = JSON.parse(read('packages/kineto-mcp/package.json'));
for (const pkg of [main, mcp]) {
  assert.equal(pkg.license, 'MIT', `${pkg.name} must declare license MIT`);
  assert.deepEqual(pkg.author, { name: 'dongri', email: 'official@dongri.me', url: 'https://dongri.me' }, `${pkg.name} must use the shared author`);
  assert.equal(pkg.repository?.url?.includes('github.com/catgarret/kineto') ?? true, true, `${pkg.name} repository must be catgarret/kineto`);
}
assert.doesNotMatch(main.description, /\b\d+\s+modules\b/i, 'the npm description must not hard-code a module count (it went stale at 53)');
assert.match(read('README.md'), /## License\n\nMIT © \[dongri\.me\]/, 'README must state the same license');

console.log('license OK — LICENSE is verbatim MIT, both packages agree on license and author.');
