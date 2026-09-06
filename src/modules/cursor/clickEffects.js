// Click media is kept separate from the cursor renderer so pointer and touch
// devices use exactly the same spawn, lifetime, and cleanup path.

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const GIF_LOOP_IDS = new Set(['NETSCAPE2.0', 'ANIMEXTS1.0']);

const crcTable = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  crcTable[index] = value >>> 0;
}

function bytesOf(input) {
  if (input instanceof Uint8Array) return input.slice();
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength).slice();
  }
  return new Uint8Array(input).slice();
}

function ascii(bytes, start, length) {
  let value = '';
  for (let index = 0; index < length; index += 1) value += String.fromCharCode(bytes[start + index]);
  return value;
}

function crc32(bytes, start, end) {
  let value = 0xffffffff;
  for (let index = start; index < end; index += 1) value = crcTable[(value ^ bytes[index]) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function isPng(bytes) {
  return bytes.length >= PNG_SIGNATURE.length
    && PNG_SIGNATURE.every((value, index) => bytes[index] === value);
}

function normalizeApng(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = PNG_SIGNATURE.length;
  let animated = false;
  let duration = 0;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset, false);
    const end = offset + 12 + length;
    if (end > bytes.length) break;
    const type = ascii(bytes, offset + 4, 4);
    if (type === 'acTL' && length === 8) {
      // acTL = num_frames (4 bytes) + num_plays (4 bytes). A nonzero
      // num_plays is the total play count, so 1 means one complete pass.
      view.setUint32(offset + 12, 1, false);
      view.setUint32(offset + 8 + length, crc32(bytes, offset + 4, offset + 8 + length), false);
      animated = true;
    } else if (type === 'fcTL' && length === 26) {
      const delay = view.getUint16(offset + 28, false) / (view.getUint16(offset + 30, false) || 100) * 1000;
      duration += delay > 10 ? delay : 100;
    }
    if (type === 'IEND' || (type === 'IDAT' && !animated)) break;
    offset = end;
  }
  return { bytes, format: animated ? 'apng' : 'png', animated, normalized: animated, duration };
}

function isWebp(bytes) {
  return bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP';
}

function normalizeWebp(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  let animated = false;
  let duration = 0;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const length = view.getUint32(offset + 4, true);
    const end = offset + 8 + length;
    if (end > bytes.length) break;
    if (type === 'ANIM' && length >= 6) {
      // ANIM stores BGRA (4 bytes) followed by a little-endian uint16 loop
      // count. Zero means infinite and one means one total iteration.
      view.setUint16(offset + 12, 1, true);
      animated = true;
    } else if (type === 'ANMF' && length >= 16) {
      const delay = bytes[offset + 20] | (bytes[offset + 21] << 8) | (bytes[offset + 22] << 16);
      duration += delay > 10 ? delay : 100;
    }
    offset = end + (length & 1);
  }
  return { bytes, format: 'webp', animated, normalized: animated, duration };
}

function isGif(bytes) {
  const header = bytes.length >= 6 ? ascii(bytes, 0, 6) : '';
  return header === 'GIF87a' || header === 'GIF89a';
}

function subBlocksEnd(bytes, start) {
  let offset = start;
  while (offset < bytes.length) {
    const length = bytes[offset];
    offset += 1;
    if (length === 0) return offset;
    if (offset + length > bytes.length) return -1;
    offset += length;
  }
  return -1;
}

function normalizeGif(bytes) {
  if (bytes.length < 13) return { bytes, format: 'gif', animated: false, normalized: false };
  const ranges = [];
  let frameCount = 0;
  let duration = 0;
  let frameDelay = 100;
  let offset = 13;
  const globalTable = bytes[10] & 0x80;
  if (globalTable) offset += 3 * (2 ** ((bytes[10] & 0x07) + 1));

  while (offset < bytes.length) {
    const marker = bytes[offset];
    if (marker === 0x3b) break;
    if (marker === 0x2c) {
      // Image Descriptor, optional local colour table, LZW code size, data.
      if (offset + 10 > bytes.length) break;
      frameCount += 1;
      duration += frameDelay;
      frameDelay = 100;
      const packed = bytes[offset + 9];
      offset += 10;
      if (packed & 0x80) offset += 3 * (2 ** ((packed & 0x07) + 1));
      if (offset >= bytes.length) break;
      offset = subBlocksEnd(bytes, offset + 1);
      if (offset < 0) break;
      continue;
    }
    if (marker === 0x21) {
      if (offset + 3 > bytes.length) break;
      const start = offset;
      const label = bytes[offset + 1];
      const blockSizeOffset = offset + 2;
      const firstSize = bytes[blockSizeOffset];
      if (label === 0xf9 && firstSize === 4 && offset + 8 <= bytes.length) {
        const delay = (bytes[offset + 4] | (bytes[offset + 5] << 8)) * 10;
        frameDelay = delay > 10 ? delay : 100;
      }
      const identifier = label === 0xff && firstSize === 11 && blockSizeOffset + 12 <= bytes.length
        ? ascii(bytes, blockSizeOffset + 1, 11)
        : '';
      offset = subBlocksEnd(bytes, blockSizeOffset);
      if (offset < 0) break;
      // GIF89a has no native animation-loop field. Browsers loop through these
      // de-facto application extensions, so removing the whole extension lets
      // the normal multi-image stream stop after its last image.
      if (GIF_LOOP_IDS.has(identifier)) ranges.push([start, offset]);
      continue;
    }
    // Do not risk rewriting malformed or unfamiliar data.
    return { bytes, format: 'gif', animated: frameCount > 1, normalized: false, duration };
  }

  if (!ranges.length) {
    return { bytes, format: 'gif', animated: frameCount > 1, normalized: false, duration };
  }
  const output = new Uint8Array(bytes.length - ranges.reduce((sum, [start, end]) => sum + end - start, 0));
  let sourceOffset = 0;
  let targetOffset = 0;
  for (const [start, end] of ranges) {
    output.set(bytes.subarray(sourceOffset, start), targetOffset);
    targetOffset += start - sourceOffset;
    sourceOffset = end;
  }
  output.set(bytes.subarray(sourceOffset), targetOffset);
  return { bytes: output, format: 'gif', animated: frameCount > 1, normalized: true, duration };
}

/**
 * Rewrite supported animated-image loop metadata to one total play.
 * Static images and unknown formats are returned untouched.
 */
export function normalizeClickImageLoop(input) {
  const bytes = bytesOf(input);
  if (isPng(bytes)) return normalizeApng(bytes);
  if (isWebp(bytes)) return normalizeWebp(bytes);
  if (isGif(bytes)) return normalizeGif(bytes);
  return { bytes, format: null, animated: false, normalized: false };
}

function cacheBustedSource(source, sequence) {
  if (/^(?:data|blob):/i.test(source)) return source;
  const hashAt = source.indexOf('#');
  const base = hashAt < 0 ? source : source.slice(0, hashAt);
  const hash = hashAt < 0 ? '' : source.slice(hashAt);
  return `${base}${base.includes('?') ? '&' : '?'}kt-click=${Date.now()}-${sequence}${hash}`;
}

const spriteMetaStore = new WeakMap();
function ensureSpriteMeta(opts, doc) {
  if (!opts.clickSprite) return null;
  let meta = spriteMetaStore.get(opts);
  if (!meta) {
    meta = {};
    spriteMetaStore.set(opts, meta);
    const ImageConstructor = doc.defaultView?.Image || globalThis.Image;
    if (!ImageConstructor) return meta;
    const probe = new ImageConstructor();
    probe.onload = () => {
      const frameHeight = probe.naturalHeight || 96;
      const frames = Math.max(1, Math.round(probe.naturalWidth / Math.max(1, frameHeight)));
      Object.assign(meta, { width: probe.naturalWidth / frames, height: frameHeight, frames });
    };
    probe.src = opts.clickSprite;
  }
  return meta;
}

async function fetchClickImage(source, doc, controller) {
  const fetcher = doc.defaultView?.fetch || globalThis.fetch;
  if (typeof fetcher !== 'function') return null;
  const timerHost = doc.defaultView || globalThis;
  const signal = controller?.signal;
  let deadline;
  let onAbort;
  const cancelled = new Promise((resolve) => {
    onAbort = () => resolve(null);
    signal?.addEventListener('abort', onAbort, { once: true });
    deadline = timerHost.setTimeout(() => { controller?.abort(); resolve(null); }, 15000);
    if (signal?.aborted) resolve(null);
  });
  const load = async () => {
    const response = await fetcher(source, { mode: 'cors', credentials: 'same-origin', signal });
    if (!response.ok) return null;
    const normalized = normalizeClickImageLoop(await response.arrayBuffer());
    if (!normalized.format) return null;
    const formatMime = { apng: 'image/png', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }[normalized.format];
    // CDNs and object stores commonly serve images as application/octet-stream.
    // Use the verified byte signature even when the server has a wrong image MIME.
    const BlobConstructor = doc.defaultView?.Blob || globalThis.Blob;
    return {
      ...normalized,
      blob: new BlobConstructor([normalized.bytes], { type: formatMime })
    };
  };
  try {
    return await Promise.race([load(), cancelled]);
  } catch (_error) {
    // Cross-origin images without CORS permission can still render in <img>,
    // but JavaScript cannot read their bytes to change loop metadata.
    return null;
  } finally {
    timerHost.clearTimeout(deadline);
    signal?.removeEventListener('abort', onAbort);
  }
}

/** Shared click-effect runtime used by full pointer cursors and touch-only mode. */
export function createCursorClickEffects(opts, container, zIndex = 2147483000) {
  const doc = container?.ownerDocument || globalThis.document;
  if (!doc || (!opts.clickSprite && !opts.clickImage)) {
    return { spawn() {}, destroy() {} };
  }
  const timerHost = doc.defaultView || globalThis;
  const urlHost = doc.defaultView?.URL || globalThis.URL;
  const AbortControllerConstructor = doc.defaultView?.AbortController || globalThis.AbortController;
  const abortController = AbortControllerConstructor ? new AbortControllerConstructor() : null;
  const nodes = new Set();
  const timers = new Map();
  const objectUrls = new Map();
  let clickStyle = null;
  let destroyed = false;
  let sequence = 0;
  const imageSource = opts.clickImage ? String(opts.clickImage) : '';
  const imageAsset = imageSource && !opts.clickSprite
    ? fetchClickImage(imageSource, doc, abortController)
    : Promise.resolve(null);

  const removeNode = (node) => {
    const timer = timers.get(node);
    if (timer != null) timerHost.clearTimeout(timer);
    timers.delete(node);
    const objectUrl = objectUrls.get(node);
    if (objectUrl) urlHost?.revokeObjectURL?.(objectUrl);
    objectUrls.delete(node);
    nodes.delete(node);
    node.onload = null;
    node.onerror = null;
    node.remove();
  };
  const expire = (node, duration) => {
    const previous = timers.get(node);
    if (previous != null) timerHost.clearTimeout(previous);
    timers.set(node, timerHost.setTimeout(() => removeNode(node), duration));
  };

  const spawnSprite = (x, y) => {
    const meta = ensureSpriteMeta(opts, doc) || {};
    const frameWidth = Math.max(8, Number(opts.clickSpriteWidth ?? meta.width ?? 96));
    const frameHeight = Math.max(8, Number(opts.clickSpriteHeight ?? meta.height ?? frameWidth));
    const frames = Math.max(1, Math.round(Number(opts.clickSpriteFrames ?? meta.frames ?? 8)));
    const duration = Math.max(80, Number(opts.clickSpriteDuration ?? 480));
    const timing = frames > 1 ? `steps(${frames}, jump-none)` : 'steps(1)';
    const signature = `${frameWidth}x${frames}`;
    if (!clickStyle) {
      const uid = `kt-cur-spr-${Math.random().toString(36).slice(2, 7)}`;
      clickStyle = doc.createElement('style');
      clickStyle.dataset.uid = uid;
      doc.head.appendChild(clickStyle);
    }
    if (clickStyle.dataset.signature !== signature) {
      clickStyle.dataset.signature = signature;
      clickStyle.textContent = `@keyframes ${clickStyle.dataset.uid} { to { background-position: -${frameWidth * (frames - 1)}px 0; } }`;
    }
    const node = doc.createElement('span');
    node.className = 'kt-cursor-click-sprite';
    node.setAttribute('aria-hidden', 'true');
    const background = JSON.stringify(String(opts.clickSprite));
    node.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${frameWidth}px;height:${frameHeight}px;transform:translate(-50%,-50%);pointer-events:none;z-index:${zIndex + 1};background-image:url(${background});background-position:0 0;background-size:auto ${frameHeight}px;background-repeat:no-repeat;animation:${clickStyle.dataset.uid} ${duration}ms ${timing} forwards;`;
    container.appendChild(node);
    nodes.add(node);
    expire(node, duration + 40);
    return node;
  };

  const spawnImage = async (x, y) => {
    const current = ++sequence;
    const asset = await imageAsset;
    if (destroyed) return null;
    const size = Math.max(8, Number(opts.clickImageSize ?? 96));
    const requestedDuration = Number(opts.clickImageDuration ?? 0);
    const duration = Number.isFinite(requestedDuration) && requestedDuration > 0
      ? Math.max(80, requestedDuration)
      : Math.max(700, (asset?.duration || 0) + 80);
    const node = doc.createElement('img');
    node.className = 'kt-cursor-click-image';
    node.alt = '';
    node.setAttribute('aria-hidden', 'true');
    node.onload = () => expire(node, duration);
    node.onerror = () => removeNode(node);
    node.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:auto;transform:translate(-50%,-50%);pointer-events:none;z-index:${zIndex + 1};`;
    let objectUrl = null;
    if (asset?.blob && typeof urlHost?.createObjectURL === 'function') {
      try { objectUrl = urlHost.createObjectURL(asset.blob); } catch (_error) { objectUrl = null; }
    }
    const fallback = cacheBustedSource(imageSource, current);
    if (objectUrl) {
      objectUrls.set(node, objectUrl);
      node.dataset.ktClickImageFormat = asset.format;
      node.dataset.ktClickImageLoop = 'one';
      node.onerror = () => {
        const failed = objectUrls.get(node);
        if (failed) urlHost?.revokeObjectURL?.(failed);
        objectUrls.delete(node);
        node.dataset.ktClickImageLoop = 'duration-fallback';
        node.onerror = () => removeNode(node);
        node.src = fallback;
      };
      node.src = objectUrl;
    } else {
      node.dataset.ktClickImageLoop = 'duration-fallback';
      node.src = fallback;
    }
    container.appendChild(node);
    nodes.add(node);
    // Playback lifetime begins after decoding, not while a fallback image is
    // still downloading. Bound a stalled load separately so it cannot leak.
    expire(node, 15000);
    return node;
  };

  return {
    spawn(x, y) {
      if (destroyed) return null;
      return opts.clickSprite ? spawnSprite(x, y) : spawnImage(x, y);
    },
    destroy() {
      destroyed = true;
      abortController?.abort();
      [...nodes].forEach(removeNode);
      clickStyle?.remove();
      clickStyle = null;
    }
  };
}
