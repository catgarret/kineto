/** @typedef {'text-frame'|'multiline-frame'|'matrix-frame'|'marquee-frame'|'cursor-frame'|'compound-frame'} TerminalFrameRenderer */

/**
 * @typedef {object} TerminalFramePreset
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {TerminalFrameRenderer} renderer
 * @property {string[]} frames
 * @property {number} [defaultInterval]
 * @property {string[]} supportedOptions
 * @property {boolean} [fixedWidth]
 * @property {string[]} [fallbackFrames]
 * @property {string} [accessibilityLabel]
 * @property {string[]} [legacyAliases]
 * @property {object} [compound]
 */

// `direction` and `transformOrigin` were in COMMON, so EVERY preset advertised
// them. Neither means anything to a static glyph cycle: `direction` only reads as
// something when the frames trace a path (the sprite tracks, the marquee, the quad
// dots), and `transformOrigin` only matters when something actually rotates. The
// drawer was therefore offering two dead controls on 20-odd presets, one of them
// permanently blank.
const COMMON = Object.freeze([
  'frameInterval', 'color', 'highlightColor', 'textSize', 'fontFamily',
  'fontWeight', 'letterSpacing', 'lineHeight', 'fixedWidth', 'asciiOnly', 'glow', 'glowColor',
  'frames', 'ariaLabel'
]);
// Presets whose frames trace a path across a track, so reversing them is visible.
const DIRECTED = Object.freeze([...COMMON, 'direction']);

const MOVING = Object.freeze([...DIRECTED, 'viewportWidth', 'motionDuration']);

// These tracks used to be hand-typed frame arrays, which meant uneven widths
// and half-finished cycles — the sprite jumped instead of travelling. Building
// them removes both classes of bug: every frame is exactly `width` cells and
// the loop closes cleanly.
const TRACK = 10;
function cell(width, draw) {
  const row = new Array(width).fill(' ');
  draw(row);
  return row.join('');
}
/** Sprite slides right, then back, never repeating either end frame. */
function bounceTrack(sprite, { width = TRACK, open = '[', close = ']' } = {}) {
  const span = width - sprite.length;
  const frames = [];
  const paint = (offset) => frames.push(
    `${open} ${cell(width, (row) => { for (let i = 0; i < sprite.length; i += 1) row[offset + i] = sprite[i]; })} ${close}`
  );
  for (let offset = 0; offset <= span; offset += 1) paint(offset);
  for (let offset = span - 1; offset >= 1; offset -= 1) paint(offset);
  return frames;
}
/** Sprite wraps around the track, so the cycle closes without a jump. */
function wrapTrack(sprite, { width = TRACK, open = '[', close = ']' } = {}) {
  const frames = [];
  for (let offset = 0; offset < width; offset += 1) {
    frames.push(`${open} ${cell(width, (row) => {
      for (let i = 0; i < sprite.length; i += 1) row[(offset + i) % width] = sprite[i];
    })} ${close}`);
  }
  return frames;
}
/** Beam grows from the left edge to the far wall, then starts over. */
function sweepTrack({ width = TRACK, head = '>', tail = '=' } = {}) {
  const frames = [];
  for (let length = 1; length <= width; length += 1) {
    frames.push(`[ ${cell(width, (row) => {
      for (let i = 0; i < length - 1; i += 1) row[i] = tail;
      row[length - 1] = head;
    })} ]`);
  }
  return frames;
}
// Scanner is generated at runtime (see buildScannerFrames), so it exposes the
// track length, the two glyphs and the determinate progress on top of MOVING.
const SCANNER_OPTS = Object.freeze([...MOVING, 'dotCount', 'fillChar', 'emptyChar', 'progress', 'indeterminate']);
const CURSOR_OPTS = Object.freeze([...COMMON, 'text', 'label', 'cursorChar']);
const MATRIX_OPTS = Object.freeze([
  'direction', 'color', 'dotSize', 'dotGap', 'motionDuration', 'frameInterval',
  'dotShape', 'highlightColor', 'baseColor', 'ariaLabel', 'asciiOnly', 'transformOrigin'
]);
const COMPOUND_OPTS = Object.freeze([
  ...COMMON, 'text', 'label', 'progress', 'motionDuration', 'highlightColor'
]);

/** @type {TerminalFramePreset[]} */
const CATALOG = [
  { id: 'line-slash', name: 'Line', description: 'The classic CLI spinner — four slashes cycling in place.', renderer: 'text-frame', frames: ['|', '/', '-', '\\'], defaultInterval: 80, fixedWidth: true, supportedOptions: COMMON, fallbackFrames: ['|', '/', '-', '\\'], legacyAliases: ['ascii'] },
  { id: 'dots', name: 'Dots', description: 'Ellipsis that grows one dot at a time, on a fixed width.', renderer: 'multiline-frame', frames: ['.', '..\n ', '...\n ', '....\n '], defaultInterval: 280, fixedWidth: true, supportedOptions: COMMON, legacyAliases: ['pulse'] },
  { id: 'braille', name: 'Braille', description: 'Braille dots rotate around the cell for a smooth, tiny spin.', renderer: 'text-frame', frames: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'.split(''), defaultInterval: 80, fixedWidth: true, supportedOptions: COMMON, fallbackFrames: ['|', '/', '-', '\\'] },
  { id: 'braille-pulse', name: 'Braille Pulse', description: 'Braille blocks fill from the bottom, then drain back down.', renderer: 'text-frame', frames: [...'⡀⡄⡆⡇⣇⣧⣷⣿', ...'⣷⣧⣇⡇⡆⡄'], defaultInterval: 72, fixedWidth: true, supportedOptions: COMMON, fallbackFrames: ['|', '/', '-', '\\'] },
  { id: 'quarter-circle', name: 'Quarter Circle', description: 'One quarter of a disc sweeps around the circle.', renderer: 'text-frame', frames: ['◐', '◓', '◑', '◒'], defaultInterval: 100, fixedWidth: true, supportedOptions: COMMON, fallbackFrames: ['o', 'O', 'o', '.'], legacyAliases: ['quadrant'] },
  { id: 'circle', name: 'Circle', description: 'A clock-face glyph steps through four quarter turns.', renderer: 'text-frame', frames: ['◴', '◷', '◶', '◵'], defaultInterval: 100, fixedWidth: true, supportedOptions: COMMON, fallbackFrames: ['o', 'O', 'o', '.'] },
  { id: 'clock', name: 'Clock', description: 'The same quarter sweep, running anticlockwise.', renderer: 'text-frame', frames: ['◷', '◶', '◵', '◴'], defaultInterval: 100, fixedWidth: true, supportedOptions: COMMON, fallbackFrames: ['o', 'O', 'o', '.'] },
  { id: 'arrow-orbit', name: 'Arrow Orbit', description: 'An arrow points around all eight compass directions.', renderer: 'text-frame', frames: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'], defaultInterval: 90, fixedWidth: true, supportedOptions: COMMON, legacyAliases: ['arrow'] },
  { id: 'triangle', name: 'Triangle', description: 'Solid corner triangles rotate through the four quadrants.', renderer: 'text-frame', frames: ['◢', '◣', '◤', '◥'], defaultInterval: 100, fixedWidth: true, supportedOptions: COMMON },
  { id: 'box-corners', name: 'Box Corners', description: 'A quarter block hops around the corners of the cell.', renderer: 'text-frame', frames: ['▖', '▘', '▝', '▗'], defaultInterval: 100, fixedWidth: true, supportedOptions: COMMON, fallbackFrames: ['|', '/', '-', '\\'], legacyAliases: ['squares'] },
  { id: 'block-shade', name: 'Block Shade', description: 'Shade blocks step from light to solid and back.', renderer: 'text-frame', frames: ['░', '▒', '▓', '█', '▓', '▒'], defaultInterval: 90, fixedWidth: true, supportedOptions: COMMON },
  { id: 'growing-blocks', name: 'Growing Blocks', description: 'A bar grows to full height, then shrinks away.', renderer: 'text-frame', frames: '▁▂▃▄▅▆▇█▇▆▅▄▃▂'.split(''), defaultInterval: 72, fixedWidth: true, supportedOptions: COMMON, legacyAliases: ['line'] },
  { id: 'moon', name: 'Moon', description: 'Moon phases cycle through the four quarters.', renderer: 'text-frame', frames: ['◑', '◒', '◐', '◓'], defaultInterval: 100, fixedWidth: true, supportedOptions: COMMON, legacyAliases: ['corners'] },
  { id: 'diamond', name: 'Diamond', description: 'A diamond fills from outline to solid and back.', renderer: 'text-frame', frames: ['◇', '◈', '◆', '◈'], defaultInterval: 100, fixedWidth: true, supportedOptions: COMMON, fallbackFrames: ['.', '*', '#', '*'] },
  { id: 'pulse-dot', name: 'Pulse Dot', description: 'A dot swells from hairline to solid.', renderer: 'text-frame', frames: ['·', '•', '●', '•'], defaultInterval: 120, fixedWidth: true, supportedOptions: COMMON },
  { id: 'spark', name: 'Spark', description: 'A sparkle grows and fades on the spot.', renderer: 'text-frame', frames: ['·', '✧', '✦', '✧'], defaultInterval: 100, fixedWidth: true, supportedOptions: COMMON },
  { id: 'binary', name: 'Binary', description: 'A fixed-width four-bit counter ticking up from 0000.', renderer: 'text-frame', frames: Array.from({ length: 16 }, (_, n) => n.toString(2).padStart(4, '0')), defaultInterval: 140, fixedWidth: true, supportedOptions: COMMON },
  { id: 'toggle-blocks', name: 'Toggle Blocks', description: 'A square toggles between empty, half and filled.', renderer: 'multiline-frame', frames: ['□', '▣', '■', '▣'], defaultInterval: 180, fixedWidth: true, supportedOptions: COMMON, legacyAliases: ['boxes'] },
  { id: 'cross', name: 'Cross', description: 'A plus and a multiply sign alternate.', renderer: 'text-frame', frames: ['+', '×', '+', '×'], defaultInterval: 140, fixedWidth: true, supportedOptions: COMMON },
  { id: 'asterisk', name: 'Asterisk', description: 'Plus, multiply and asterisk in rotation.', renderer: 'text-frame', frames: ['+', '×', '✳', '×'], defaultInterval: 140, fixedWidth: true, supportedOptions: COMMON },
  { id: 'quad-dot-chase', name: 'Quad Dot Chase', description: 'Four corner dots hand a bright head around a 2×2 square, each trailing dot a step dimmer.', renderer: 'matrix-frame', frames: [], defaultInterval: 200, supportedOptions: MATRIX_OPTS, accessibilityLabel: 'Loading' },
  // The reference recording also breathes: the whole 2x2 cluster dims and
  // brightens while the head goes round, which reads as a slower, calmer
  // sibling of the plain chase. Kept as its own preset so both looks are
  // reachable rather than hidden behind an option nobody finds.
  { id: 'quad-dot-pulse', name: 'Quad Dot Pulse', description: 'The 2x2 dot chase with the whole cluster breathing as the head goes round.', renderer: 'matrix-frame', frames: [], defaultInterval: 200, supportedOptions: MATRIX_OPTS, accessibilityLabel: 'Loading' },
  { id: 'bouncing-ball', name: 'Bouncing Ball', description: 'A ball travels the track and bounces off both walls.', renderer: 'marquee-frame', frames: bounceTrack('●'), defaultInterval: 90, fixedWidth: true, supportedOptions: MOVING },
  { id: 'bouncing-bar', name: 'Bouncing Bar', description: 'A three-cell bar slides the track and rebounds.', renderer: 'marquee-frame', frames: bounceTrack('==='), defaultInterval: 90, fixedWidth: true, supportedOptions: MOVING },
  { id: 'scanner', name: 'Scanner', description: 'A beam grows from one wall to the far end, then restarts. Reverse mirrors the arrowhead; a numeric progress fills it like a bar.', renderer: 'marquee-frame', frames: sweepTrack(), defaultInterval: 90, fixedWidth: true, supportedOptions: SCANNER_OPTS },
  { id: 'snake', name: 'Snake', description: 'A three-cell body wraps around the track without a jump.', renderer: 'marquee-frame', frames: wrapTrack('■■■'), defaultInterval: 90, fixedWidth: true, supportedOptions: MOVING },
  { id: 'marquee', name: 'Marquee', description: 'Your text scrolls continuously through a fixed viewport.', renderer: 'marquee-frame', frames: [], defaultInterval: 120, fixedWidth: true, supportedOptions: [...MOVING, 'text', 'textEffect'] },
  { id: 'typing-cursor', name: 'Typing Cursor', description: 'A label with an underscore caret blinking after it.', renderer: 'cursor-frame', frames: [], defaultInterval: 480, fixedWidth: false, supportedOptions: CURSOR_OPTS },
  { id: 'ellipsis-typing', name: 'Ellipsis Typing', description: 'Three dots appear one by one, reserved up front so nothing shifts.', renderer: 'cursor-frame', frames: [], defaultInterval: 400, fixedWidth: false, supportedOptions: CURSOR_OPTS },
  { id: 'block-cursor', name: 'Block Cursor', description: 'A label followed by a solid block caret.', renderer: 'cursor-frame', frames: [], defaultInterval: 480, fixedWidth: false, supportedOptions: CURSOR_OPTS },
  { id: 'command-prompt', name: 'Command Prompt', description: 'A shell prompt with a blinking caret after the command.', renderer: 'cursor-frame', frames: [], defaultInterval: 480, fixedWidth: false, supportedOptions: CURSOR_OPTS },
  { id: 'dot-cursor', name: 'Dot Cursor', description: 'A label with a small middot caret blinking after it.', renderer: 'cursor-frame', frames: [], defaultInterval: 480, fixedWidth: false, supportedOptions: CURSOR_OPTS },
  { id: 'spinner-label', name: 'Spinner + Label', description: 'A braille spinner beside a text label.', renderer: 'compound-frame', frames: [], defaultInterval: 80, fixedWidth: true, supportedOptions: COMPOUND_OPTS, compound: { spinner: 'braille', showLabel: true } },
  { id: 'quad-dots-label', name: 'Quad Dots + Label', description: 'The 2x2 dot chase beside a text label.', renderer: 'compound-frame', frames: [], defaultInterval: 250, fixedWidth: true, supportedOptions: COMPOUND_OPTS, compound: { spinner: 'quad-dot-chase', showLabel: true } },
  { id: 'spinner-elapsed', name: 'Spinner + Elapsed Time', description: 'A spinner with a running clock, plus a percentage when given one.', renderer: 'compound-frame', frames: [], defaultInterval: 80, fixedWidth: true, supportedOptions: COMPOUND_OPTS, compound: { spinner: 'braille', showLabel: true, showElapsed: true } },
  { id: 'spinner-step', name: 'Spinner + Step', description: 'A spinner with a step counter such as 3/8.', renderer: 'compound-frame', frames: [], defaultInterval: 80, fixedWidth: true, supportedOptions: COMPOUND_OPTS, compound: { spinner: 'braille', showLabel: true, showStep: true, stepTotal: 8 } },
  { id: 'spinner-meter', name: 'Spinner + Meter', description: 'A spinner with an ASCII progress bar and a percentage.', renderer: 'compound-frame', frames: [], defaultInterval: 80, fixedWidth: true, supportedOptions: COMPOUND_OPTS, compound: { spinner: 'braille', showLabel: true, showMeter: true, meterCount: 8 } }
];

const BY_ID = Object.freeze(Object.fromEntries(CATALOG.map((preset) => [preset.id, preset])));
const LEGACY = Object.freeze(Object.fromEntries(
  CATALOG.flatMap((preset) => (preset.legacyAliases || []).map((alias) => [alias, preset.id]))
));

export const TERMINAL_FRAME_PRESET_IDS = Object.freeze(CATALOG.map((p) => p.id));

export function resolveTerminalFramePreset(styleId) {
  const key = String(styleId || '').trim();
  if (!key) return null;
  if (BY_ID[key]) return BY_ID[key];
  const mapped = LEGACY[key];
  return mapped ? BY_ID[mapped] : null;
}

export function isTerminalFramePreset(styleId) {
  return resolveTerminalFramePreset(styleId) != null;
}

export function getTerminalFramePreset(styleId) {
  return resolveTerminalFramePreset(styleId);
}

export function listTerminalFramePresets() {
  return CATALOG.slice();
}

export const TERMINAL_FRAME_LEGACY_PRESETS = Object.freeze({
  ascii: '|/-\\',
  pulse: '.oO°Oo',
  quadrant: '◐◓◑◒',
  braille: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏',
  arrow: '←↖↑↗→↘↓↙',
  line: '▁▃▅▆▇█▇▆▅▃',
  circle: '◴◷◶◵',
  corners: '◜◝◞◟',
  squares: '▖▘▝▗',
  boxes: '◰◳◲◱'
});

export function presetSupportsOption(preset, optionName) {
  if (!preset?.supportedOptions) return COMMON.includes(optionName);
  return preset.supportedOptions.includes(optionName);
}
