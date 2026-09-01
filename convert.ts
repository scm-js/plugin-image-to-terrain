/**
 * The pure half of Terrain from Image: given one RGBA sample per target cell, decide
 * which terrain each cell becomes. No DOM, no canvas — `tests/terrain-from-image.test.ts`
 * runs this in Node; `plugin.ts` does the resampling and the painting.
 *
 * The pipeline, in order: `adjustSamples` (auto-levels, brightness, contrast, gamma,
 * saturation, hue, invert) → `boxBlur` → per-cell matching in OKLab (`makeMatcher`:
 * adaptive, exact or brightness bands) → `majorityFilter` (despeckle) →
 * `removeSmallRegions` (islands). `matchTerrains` runs the whole thing.
 */

export interface TerrainChoice {
  /** ISOM terrain id (CV5 pair index). */
  id: number;
  /** The key colour this terrain matches in the picture, packed `0xRRGGBB` (by default the tile average). */
  color: number;
}

/**
 * `adaptive`: hue is compared after each side's chroma is scaled to the other's range and
 * brightness only relative to each side's own range, so a saturated blue still finds a
 * murky Water swatch and a black band the darkest ground. `exact`: plain OKLab distance
 * to the key colours — what you want once you have set them by hand. `brightness`: the
 * terrains in list order become equal bands from the picture's darkest to its brightest
 * cell (a heightmap: low → high in the order the list gives).
 */
export type MatchMode = "adaptive" | "exact" | "brightness";

export interface Adjustments {
  /** -100 … 100. */
  brightness: number;
  /** -100 … 100. */
  contrast: number;
  /** -100 (grey) … 100 (double). */
  saturation: number;
  /** Degrees, -180 … 180. */
  hue: number;
  /** 0.2 … 5; 1 is neutral. Above 1 lightens the midtones, below 1 darkens them (the Levels-dialog convention). */
  gamma: number;
  invert: boolean;
  /** Stretch the picture's luma range to 0 … 255 first. */
  autoLevels: boolean;
}

export const DEFAULT_ADJUSTMENTS: Adjustments = { brightness: 0, contrast: 0, saturation: 0, hue: 0, gamma: 1, invert: false, autoLevels: false };

export interface ConvertOptions {
  terrains: readonly TerrainChoice[];
  mode: MatchMode;
  /** 0 = brightness only … 1 = hue only; 0.5 weighs them as OKLab does. Ignored by `brightness`. */
  balance?: number;
  /** Box-blur radius in cells (0 = none) applied to the samples before matching, to calm noise and dithering. */
  smooth: number;
  /** Majority-filter passes over the matched grid (0 = none): each cell takes its 3×3 neighbourhood's commonest terrain. */
  despeckle?: number;
  /** Regions (4-connected) smaller than this many cells are merged into their commonest neighbour (0 / 1 = keep all). */
  minRegion?: number;
  adjust?: Adjustments;
}

export const unpack = (color: number): [number, number, number] => [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];
export const pack = (r: number, g: number, b: number): number => ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
export const toHex = (color: number): string => `#${(color & 0xffffff).toString(16).padStart(6, "0")}`;
/** `#rgb` / `#rrggbb` (hash optional) → packed, or null. */
export function fromHex(text: string): number | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return parseInt(h, 16);
}

/** Rec. 601 luma, 0..255. */
export const luminance = (r: number, g: number, b: number): number => 0.299 * r + 0.587 * g + 0.114 * b;

/**
 * "Redmean" colour distance: a cheap approximation of perceptual distance that weights
 * the channels by where the colour sits on the red axis.
 */
export function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const rm = (r1 + r2) / 2;
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

/** Index of the nearest choice by (redmean) colour, or -1 with no choices. */
export function nearestByColor(r: number, g: number, b: number, terrains: readonly TerrainChoice[]): number {
  let best = -1, bestD = Infinity;
  for (let i = 0; i < terrains.length; i++) {
    const [tr, tg, tb] = unpack(terrains[i].color);
    const d = colorDistance(r, g, b, tr, tg, tb);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/* ── OKLab ──────────────────────────────────────────────── */

const LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) { const c = i / 255; LINEAR[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }

/** sRGB bytes → OKLab (`L` 0..1, `a` / `b` about ±0.3). Björn Ottosson's matrices. */
export function oklab(r: number, g: number, b: number): [number, number, number] {
  const lr = LINEAR[r & 0xff], lg = LINEAR[g & 0xff], lb = LINEAR[b & 0xff];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** Chroma (saturation) of an OKLab colour. */
export const chroma = (a: number, b: number): number => Math.hypot(a, b);

/** What a matcher needs to know about the picture as a whole. */
export interface SampleStats {
  /** OKLab L of the darkest / brightest opaque cell. */
  lRange: [number, number];
  /** The most saturated opaque cell's chroma. */
  maxChroma: number;
  /** Rec. 601 luma range of the opaque cells, 0..255. */
  lumaRange: [number, number];
}

export function sampleStats(rgba: Uint8ClampedArray, width: number, height: number): SampleStats {
  let lo = 1, hi = 0, maxC = 0, llo = 255, lhi = 0, any = false;
  for (let i = 0; i < width * height; i++) {
    if (rgba[i * 4 + 3] < 8) continue;
    any = true;
    const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2];
    const [L, a, bb] = oklab(r, g, b);
    if (L < lo) lo = L;
    if (L > hi) hi = L;
    const c = chroma(a, bb);
    if (c > maxC) maxC = c;
    const l = luminance(r, g, b);
    if (l < llo) llo = l;
    if (l > lhi) lhi = l;
  }
  return any ? { lRange: [lo, hi], maxChroma: maxC, lumaRange: [llo, lhi] } : { lRange: [0, 1], maxChroma: 0, lumaRange: [0, 255] };
}

/** Below this chroma a picture counts as grey and the adaptive matcher stops amplifying its hue noise. */
const GREY_CHROMA = 0.03;
/** The most the adaptive matcher stretches the picture's lightness or chroma range. */
const MAX_GAIN = 3;

/**
 * Build the per-cell matcher for `mode`. Returns the index into `terrains` (or -1).
 *
 * `adaptive` lifts both sides into a common frame: the picture's L range is mapped onto
 * the swatches' L range (so its darkest cell is as dark as the darkest terrain, its
 * brightest as bright as the brightest — auto-levels against the palette), and the
 * picture's chroma is scaled so its most saturated cell matches the most saturated
 * swatch — that is what lets a pure blue lake reach a grey-blue Water average and a
 * lush green reach a brownish Jungle. `exact` is OKLab distance as-is. Both weigh L
 * against a/b by `balance`.
 */
export function makeMatcher(terrains: readonly TerrainChoice[], mode: MatchMode, stats: SampleStats, balance = 0.5): (r: number, g: number, b: number) => number {
  if (terrains.length === 0) return () => -1;
  if (mode === "brightness") {
    const [lo, hi] = stats.lumaRange;
    return (r, g, b) => bandByBrightness(luminance(r, g, b), terrains.length, [lo, hi]);
  }
  const swatches = terrains.map((t) => oklab(...unpack(t.color)));
  const wL = 2 * (1 - Math.min(1, Math.max(0, balance)));
  const wC = 2 * Math.min(1, Math.max(0, balance));
  let mapL = (L: number) => L;
  let scaleC = 1;
  if (mode === "adaptive") {
    const sLo = Math.min(...swatches.map((s) => s[0])), sHi = Math.max(...swatches.map((s) => s[0]));
    const [iLo, iHi] = stats.lRange;
    // Fit the picture's L range onto the swatches' about their midpoints — but never amplify it more
    // than MAX_GAIN, or a nearly flat picture's noise would be stretched across every terrain.
    const gain = iHi > iLo ? Math.min(MAX_GAIN, (sHi - sLo) / (iHi - iLo)) : 0;
    const sMid = (sLo + sHi) / 2, iMid = (iLo + iHi) / 2;
    mapL = (L: number) => sMid + (L - iMid) * gain;
    const sMaxC = Math.max(...swatches.map((s) => chroma(s[1], s[2])));
    if (stats.maxChroma > GREY_CHROMA && sMaxC > 0) scaleC = Math.min(MAX_GAIN, sMaxC / stats.maxChroma);
    // Tile averages are all murky: their hues differ by a few hundredths while their lightness spans
    // tenths, so plain OKLab would let brightness decide everything. Stretch chroma — on both sides —
    // until the palette's hue spread counts as much as its lightness spread; `balance` tunes from there.
    const k = sHi > sLo && sMaxC > 0 ? Math.min(6, Math.max(1, (sHi - sLo) / sMaxC)) : 1;
    for (const s of swatches) { s[1] *= k; s[2] *= k; }
    scaleC *= k;
  }
  return (r, g, b) => {
    const [L0, a0, b0] = oklab(r, g, b);
    const L = mapL(L0), a = a0 * scaleC, bb = b0 * scaleC;
    let best = -1, bestD = Infinity;
    for (let i = 0; i < swatches.length; i++) {
      const s = swatches[i];
      const dL = L - s[0], da = a - s[1], db = bb - s[2];
      const d = wL * dL * dL + wC * (da * da + db * db);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };
}

/**
 * Chromaticity — each channel's share of the total — which is what survives when a
 * picture's saturated colours are compared with a tileset's murky averages.
 */
export function chromaticity(r: number, g: number, b: number): [number, number] {
  const s = r + g + b;
  return s === 0 ? [1 / 3, 1 / 3] : [r / s, g / s];
}

/** Which of `count` equal brightness bands (0 = darkest) a luma value falls in, over `range` (default 0..255). */
export function bandByBrightness(luma: number, count: number, range: [number, number] = [0, 255]): number {
  if (count <= 0) return -1;
  const [lo, hi] = range;
  const t = hi > lo ? (luma - lo) / (hi - lo + 1e-6) : 0.5;
  return Math.min(count - 1, Math.max(0, Math.floor(t * count)));
}

/* ── Adjustments ────────────────────────────────────────── */

export function isNeutral(adj: Adjustments): boolean {
  return adj.brightness === 0 && adj.contrast === 0 && adj.saturation === 0 && adj.hue === 0 && adj.gamma === 1 && !adj.invert && !adj.autoLevels;
}

/**
 * Apply the colour adjustments to RGBA samples (alpha untouched). Order: auto-levels,
 * brightness, contrast, gamma, saturation, hue, invert. Returns the input itself when
 * every adjustment is neutral.
 */
export function adjustSamples(rgba: Uint8ClampedArray, adj: Adjustments): Uint8ClampedArray {
  if (isNeutral(adj)) return rgba;
  const n = rgba.length / 4;
  const out = new Uint8ClampedArray(rgba.length);
  let lo = 0, hi = 255;
  if (adj.autoLevels) {
    lo = 255; hi = 0;
    for (let i = 0; i < n; i++) {
      if (rgba[i * 4 + 3] < 8) continue;
      const l = luminance(rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]);
      if (l < lo) lo = l;
      if (l > hi) hi = l;
    }
    if (hi <= lo) { lo = 0; hi = 255; }
  }
  const levels = 255 / (hi - lo);
  const bright = (adj.brightness / 100) * 255;
  const contrast = Math.tan(((Math.min(99, Math.max(-99, adj.contrast)) + 100) / 200) * (Math.PI / 2));
  const gamma = 1 / Math.max(0.05, adj.gamma);
  const sat = 1 + adj.saturation / 100;
  // Hue rotation in YIQ: cheap and good enough for a knob. Negated so that + turns red → yellow → green, as a colour wheel reads.
  const rad = (-adj.hue * Math.PI) / 180, cosH = Math.cos(rad), sinH = Math.sin(rad);
  const rotate = adj.hue !== 0;
  const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
  for (let i = 0; i < n; i++) {
    let r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2];
    if (adj.autoLevels) { r = (r - lo) * levels; g = (g - lo) * levels; b = (b - lo) * levels; }
    if (bright !== 0) { r += bright; g += bright; b += bright; }
    if (contrast !== 1) { r = (r - 128) * contrast + 128; g = (g - 128) * contrast + 128; b = (b - 128) * contrast + 128; }
    if (gamma !== 1) { r = 255 * (clamp(r) / 255) ** gamma; g = 255 * (clamp(g) / 255) ** gamma; b = 255 * (clamp(b) / 255) ** gamma; }
    if (sat !== 1) { const l = luminance(r, g, b); r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat; }
    if (rotate) {
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      const iq = 0.596 * r - 0.274 * g - 0.322 * b;
      const q = 0.211 * r - 0.523 * g + 0.312 * b;
      const i2 = iq * cosH - q * sinH, q2 = iq * sinH + q * cosH;
      r = y + 0.956 * i2 + 0.621 * q2;
      g = y - 0.272 * i2 - 0.647 * q2;
      b = y - 1.106 * i2 + 1.703 * q2;
    }
    if (adj.invert) { r = 255 - r; g = 255 - g; b = 255 - b; }
    out[i * 4] = clamp(r); out[i * 4 + 1] = clamp(g); out[i * 4 + 2] = clamp(b); out[i * 4 + 3] = rgba[i * 4 + 3];
  }
  return out;
}

/* ── Filters ────────────────────────────────────────────── */

/** Separable box blur over RGBA samples; edge cells reuse the nearest sample. */
export function boxBlur(rgba: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  if (radius <= 0 || width === 0 || height === 0) return rgba;
  const r = Math.floor(radius);
  const tmp = new Float32Array(width * height * 4);
  const out = new Uint8ClampedArray(width * height * 4);
  const span = 2 * r + 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let a0 = 0, a1 = 0, a2 = 0, a3 = 0;
      for (let k = -r; k <= r; k++) {
        const sx = Math.min(width - 1, Math.max(0, x + k));
        const i = (y * width + sx) * 4;
        a0 += rgba[i]; a1 += rgba[i + 1]; a2 += rgba[i + 2]; a3 += rgba[i + 3];
      }
      const o = (y * width + x) * 4;
      tmp[o] = a0 / span; tmp[o + 1] = a1 / span; tmp[o + 2] = a2 / span; tmp[o + 3] = a3 / span;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let a0 = 0, a1 = 0, a2 = 0, a3 = 0;
      for (let k = -r; k <= r; k++) {
        const sy = Math.min(height - 1, Math.max(0, y + k));
        const i = (sy * width + x) * 4;
        a0 += tmp[i]; a1 += tmp[i + 1]; a2 += tmp[i + 2]; a3 += tmp[i + 3];
      }
      const o = (y * width + x) * 4;
      out[o] = Math.round(a0 / span); out[o + 1] = Math.round(a1 / span); out[o + 2] = Math.round(a2 / span); out[o + 3] = Math.round(a3 / span);
    }
  }
  return out;
}

/**
 * Majority filter over a terrain grid: each cell takes the commonest id in its 3×3
 * neighbourhood (its own id wins ties; -1 cells are skipped and never counted). One pass
 * kills isolated specks and 1-cell notches; more passes round off larger bumps.
 */
export function majorityFilter(grid: Int32Array, width: number, height: number, passes: number): Int32Array {
  let cur = grid;
  for (let p = 0; p < passes; p++) {
    const next = new Int32Array(cur);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const self = cur[y * width + x];
        if (self < 0) continue;
        const counts = new Map<number, number>();
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= height) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= width) continue;
            const id = cur[yy * width + xx];
            if (id >= 0) counts.set(id, (counts.get(id) ?? 0) + 1);
          }
        }
        let best = self, bestN = counts.get(self) ?? 0;
        for (const [id, n] of counts) if (n > bestN) { best = id; bestN = n; }
        next[y * width + x] = best;
      }
    }
    cur = next;
  }
  return cur;
}

/**
 * Merge every 4-connected region smaller than `minSize` cells into the terrain that
 * borders it most. Regions are visited smallest first, so a speck inside a slightly
 * larger blob joins the blob and the blob is then judged on its own. -1 cells are their
 * own regions and never change.
 */
export function removeSmallRegions(grid: Int32Array, width: number, height: number, minSize: number): Int32Array {
  if (minSize <= 1) return grid;
  const out = new Int32Array(grid);
  const label = new Int32Array(width * height).fill(-1);
  const regions: { cells: number[]; id: number }[] = [];
  const stack: number[] = [];
  for (let start = 0; start < width * height; start++) {
    if (label[start] >= 0 || out[start] < 0) continue;
    const id = out[start];
    const cells: number[] = [];
    const rid = regions.length;
    label[start] = rid;
    stack.push(start);
    while (stack.length > 0) {
      const at = stack.pop()!;
      cells.push(at);
      const x = at % width, y = (at - x) / width;
      const tryCell = (n: number) => { if (label[n] < 0 && out[n] === id) { label[n] = rid; stack.push(n); } };
      if (x > 0) tryCell(at - 1);
      if (x < width - 1) tryCell(at + 1);
      if (y > 0) tryCell(at - width);
      if (y < height - 1) tryCell(at + width);
    }
    regions.push({ cells, id });
  }
  const small = regions.filter((r) => r.cells.length < minSize).sort((a, b) => a.cells.length - b.cells.length);
  for (const region of small) {
    const border = new Map<number, number>();
    for (const at of region.cells) {
      const x = at % width, y = (at - x) / width;
      const look = (n: number) => { const id = out[n]; if (id >= 0 && id !== region.id) border.set(id, (border.get(id) ?? 0) + 1); };
      if (x > 0) look(at - 1);
      if (x < width - 1) look(at + 1);
      if (y > 0) look(at - width);
      if (y < height - 1) look(at + width);
    }
    let best = -1, bestN = 0;
    for (const [id, n] of border) if (n > bestN) { best = id; bestN = n; }
    if (best >= 0) for (const at of region.cells) out[at] = best;
  }
  return out;
}

/* ── The pipeline ───────────────────────────────────────── */

/**
 * One terrain id per cell (-1 where the image is transparent or no terrain was chosen),
 * row-major over `width × height`.
 */
export function matchTerrains(rgba: Uint8ClampedArray, width: number, height: number, opts: ConvertOptions): Int32Array {
  const out = new Int32Array(width * height).fill(-1);
  if (opts.terrains.length === 0) return out;
  const adjusted = adjustSamples(rgba, opts.adjust ?? DEFAULT_ADJUSTMENTS);
  const samples = boxBlur(adjusted, width, height, opts.smooth);
  const nearest = makeMatcher(opts.terrains, opts.mode, sampleStats(samples, width, height), opts.balance ?? 0.5);
  for (let i = 0; i < width * height; i++) {
    const r = samples[i * 4], g = samples[i * 4 + 1], b = samples[i * 4 + 2], a = samples[i * 4 + 3];
    if (a < 8) continue;
    const idx = nearest(r, g, b);
    if (idx >= 0) out[i] = opts.terrains[idx].id;
  }
  let grid = majorityFilter(out, width, height, opts.despeckle ?? 0);
  grid = removeSmallRegions(grid, width, height, opts.minRegion ?? 0);
  return grid;
}

/** How many cells each terrain got, in `terrains` order — the dialog's summary line. */
export function countCells(grid: Int32Array, terrains: readonly TerrainChoice[]): number[] {
  const counts = Array.from({ length: terrains.length }, () => 0);
  const at = new Map(terrains.map((t, i) => [t.id, i]));
  for (const id of grid) {
    const i = at.get(id);
    if (i !== undefined) counts[i]++;
  }
  return counts;
}

/** The cells of `grid` (offset into the map by the rect origin) grouped by terrain id. */
export function cellsByTerrain(grid: Int32Array, gridWidth: number, gridHeight: number, originX: number, originY: number, mapWidth: number): Map<number, number[]> {
  const out = new Map<number, number[]>();
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const id = grid[y * gridWidth + x];
      if (id < 0) continue;
      let list = out.get(id);
      if (!list) { list = []; out.set(id, list); }
      list.push((originY + y) * mapWidth + originX + x);
    }
  }
  return out;
}

/* ── Isometric painting ─────────────────────────────────── */

/**
 * The terrain for a lattice diamond whose centre sits on the corner between grid
 * columns `cx - 1 | cx` and rows `cy - 1 | cy`: the commonest of the (up to) four cells
 * around it, the top-left one winning ties; -1 when all four are unpainted.
 */
export function diamondTerrain(grid: Int32Array, width: number, height: number, cx: number, cy: number): number {
  const counts = new Map<number, number>(); // insertion order = first appearance, which breaks ties
  for (const [x, y] of [[cx - 1, cy - 1], [cx, cy - 1], [cx - 1, cy], [cx, cy]]) {
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const id = grid[y * width + x];
    if (id >= 0) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  let best = -1, bestN = 0;
  for (const [id, n] of counts) if (n > bestN) { best = id; bestN = n; }
  return best;
}

/**
 * The order to paint terrains with the isometric brush: low ground first, then by
 * cell count, most common first — so the last brush to touch a boundary belongs to the
 * rarer, higher feature, which keeps thin ridges and small plateaus their size while
 * the brush's one-diamond bleed eats into the common ground instead.
 */
export function paintOrder(ids: readonly number[], heightOf: (id: number) => number | null, counts: ReadonlyMap<number, number>): number[] {
  return [...ids].sort((a, b) => {
    const ha = heightOf(a) ?? 0, hb = heightOf(b) ?? 0;
    if (ha !== hb) return ha - hb;
    return (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
  });
}

/* ── Placing the picture ────────────────────────────────── */

export type Fit = "stretch" | "contain" | "cover";

export interface Placement { dx: number; dy: number; dw: number; dh: number }

/**
 * Where a `w × h` picture lands in a `gw × gh` cell grid: stretched to fill, fitted
 * inside (letterboxed, centred — the uncovered cells stay transparent and are left as
 * they are), or covering it (centred, the overflow cropped).
 */
export function fitRect(w: number, h: number, gw: number, gh: number, fit: Fit): Placement {
  if (fit === "stretch" || w <= 0 || h <= 0) return { dx: 0, dy: 0, dw: gw, dh: gh };
  const scale = fit === "contain" ? Math.min(gw / w, gh / h) : Math.max(gw / w, gh / h);
  const dw = Math.max(1, Math.round(w * scale)), dh = Math.max(1, Math.round(h * scale));
  return { dx: Math.round((gw - dw) / 2), dy: Math.round((gh - dh) / 2), dw, dh };
}
