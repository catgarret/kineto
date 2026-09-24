// Draws the eight frames the demo's Scroll Sequence card scrubs through.
//
// WHY A GENERATOR: the frames are shown with `fit: cover`, and the stage they
// are shown in is landscape on a desktop but tall and narrow on a phone — a
// 1200×700 frame covered into a 9:16 box keeps only its middle ~390 units. The
// old frames put the label at x=60 and the moving shapes at the far edges, so
// the demo read "equence 01" with half its motion cropped away. Everything here
// lives inside a centred SAFE ZONE that survives that crop, and the numbers
// that decide it are written down once instead of in eight hand-edited files.
//
//   node scripts/generate-demo-sequence.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'demo/assets/sequence');

const FRAMES = 8;
const WIDTH = 1200;
const HEIGHT = 700;
const CENTER_X = WIDTH / 2;
// Half-width of what a 9:16 cover crop keeps of a 1200×700 frame (≈195 units),
// less a margin: nothing is drawn further than this from the centre line.
const SAFE_HALF_WIDTH = 180;
const ORBIT = { cy: 330, radius: SAFE_HALF_WIDTH - 12, dot: 24 };
// The background drifts through twelve degrees of hue per frame, as before.
const HUE = { start: 210, step: 12, span: 50 };

function frame(index) {
  const number = String(index + 1).padStart(2, '0');
  const hue = HUE.start + index * HUE.step;
  // One full turn over the sequence, starting at twelve o'clock, so scrubbing
  // reads as rotation whichever way it is scrolled.
  const angle = (-90 + (360 / FRAMES) * index) * (Math.PI / 180);
  const dotX = (CENTER_X + Math.cos(angle) * ORBIT.radius).toFixed(1);
  const dotY = (ORBIT.cy + Math.sin(angle) * ORBIT.radius).toFixed(1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 80% 18%)"/><stop offset="1" stop-color="hsl(${hue + HUE.span} 75% 45%)"/></linearGradient></defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/>
<circle cx="${CENTER_X}" cy="${ORBIT.cy}" r="${ORBIT.radius}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/>
<circle cx="${dotX}" cy="${dotY}" r="${ORBIT.dot}" fill="rgba(255,255,255,.92)"/>
<text x="${CENTER_X}" y="${ORBIT.cy + 58}" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="170" font-weight="800">${number}</text>
<text x="${CENTER_X}" y="${ORBIT.cy + ORBIT.radius + 86}" text-anchor="middle" fill="rgba(255,255,255,.78)" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="7">SCROLL SEQUENCE</text>
</svg>
`;
}

fs.mkdirSync(out, { recursive: true });
for (let index = 0; index < FRAMES; index += 1) {
  fs.writeFileSync(path.join(out, `frame-${String(index + 1).padStart(2, '0')}.svg`), frame(index));
}
console.log(`Wrote ${FRAMES} scroll-sequence frames to demo/assets/sequence (safe zone ±${SAFE_HALF_WIDTH} units).`);
