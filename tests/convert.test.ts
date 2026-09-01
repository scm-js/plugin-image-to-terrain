import { describe, expect, it } from "vitest";
import {
  adjustSamples, bandByBrightness, boxBlur, cellsByTerrain, chroma, chromaticity, colorDistance, countCells, DEFAULT_ADJUSTMENTS, diamondTerrain, fitRect, fromHex,
  isNeutral, luminance, majorityFilter, makeMatcher, matchTerrains, nearestByColor, oklab, pack, paintOrder, removeSmallRegions, sampleStats, toHex, unpack,
} from "../convert";

/** A width × height RGBA picture from a function of (x, y). */
function picture(width: number, height: number, at: (x: number, y: number) => [number, number, number, number?]): Uint8ClampedArray {
  const out = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a = 255] = at(x, y);
      out.set([r, g, b, a], (y * width + x) * 4);
    }
  }
  return out;
}

const GRASS = { id: 5, color: pack(40, 120, 40) };
const WATER = { id: 7, color: pack(30, 60, 160) };
const DIRT = { id: 2, color: pack(120, 90, 50) };
const exact = { mode: "exact" as const, smooth: 0 };

describe("colour helpers", () => {
  it("pack, unpack and hex round-trip and luma is ordered", () => {
    expect(unpack(pack(1, 2, 3))).toEqual([1, 2, 3]);
    expect(toHex(0x0a0b0c)).toBe("#0a0b0c");
    expect(fromHex("#0A0B0C")).toBe(0x0a0b0c);
    expect(fromHex("abc")).toBe(0xaabbcc);
    expect(fromHex("nope")).toBeNull();
    expect(luminance(255, 255, 255)).toBeCloseTo(255);
    expect(luminance(0, 0, 0)).toBe(0);
    expect(luminance(0, 255, 0)).toBeGreaterThan(luminance(0, 0, 255));
    expect(colorDistance(10, 10, 10, 10, 10, 10)).toBe(0);
    expect(chromaticity(0, 0, 0)).toEqual([1 / 3, 1 / 3]);
  });

  it("converts to OKLab: white is L 1, greys have no chroma, red sits on +a", () => {
    expect(oklab(255, 255, 255)[0]).toBeCloseTo(1, 2);
    expect(oklab(0, 0, 0)[0]).toBeCloseTo(0, 3);
    const [, ga, gb] = oklab(128, 128, 128);
    expect(chroma(ga, gb)).toBeLessThan(0.002);
    expect(oklab(255, 0, 0)[1]).toBeGreaterThan(0.15);
    expect(oklab(0, 0, 255)[2]).toBeLessThan(-0.2);
  });

  it("finds the nearest terrain by colour and the band by brightness", () => {
    expect(nearestByColor(35, 110, 45, [GRASS, WATER, DIRT])).toBe(0);
    expect(nearestByColor(20, 50, 170, [GRASS, WATER, DIRT])).toBe(1);
    expect(nearestByColor(0, 0, 0, [])).toBe(-1);
    expect(bandByBrightness(0, 3)).toBe(0);
    expect(bandByBrightness(127, 3)).toBe(1);
    expect(bandByBrightness(255, 3)).toBe(2);
    expect(bandByBrightness(100, 0)).toBe(-1);
    // Bands span a given range: 100 is the bottom band of 100..200 and the top band of 0..100.
    expect(bandByBrightness(100, 2, [100, 200])).toBe(0);
    expect(bandByBrightness(100, 2, [0, 100])).toBe(1);
  });
});

describe("adaptive matching against real (dark) tileset averages", () => {
  // Jungle's actual atlas averages: every terrain is a murky brown, water a grey-blue.
  const JUNGLE = [
    { id: 5, color: 0x26273a }, // Water
    { id: 2, color: 0x33291a }, // Dirt
    { id: 4, color: 0x231f1a }, // Mud
    { id: 6, color: 0x21260b }, // Jungle
    { id: 12, color: 0x3b393b }, // Temple
    { id: 3, color: 0x4c402e }, // High Dirt
  ];
  const BLUE: [number, number, number] = [32, 58, 144], BLACK: [number, number, number] = [16, 16, 16], GREEN: [number, number, number] = [42, 90, 32], TAN: [number, number, number] = [200, 170, 120];
  const swatchPicture = picture(4, 1, (x) => [BLUE, BLACK, GREEN, TAN][x]);
  const stats = sampleStats(swatchPicture, 4, 1);

  it("sends a saturated blue to Water, a lush green to Jungle and a black band to the darkest ground", () => {
    const nearest = makeMatcher(JUNGLE, "adaptive", stats);
    expect(JUNGLE[nearest(...BLUE)].id).toBe(5);
    expect(JUNGLE[nearest(...GREEN)].id).toBe(6);
    expect(JUNGLE[nearest(...BLACK)].id).toBe(4);
    expect(JUNGLE[nearest(...TAN)].id).toBe(3); // the brightest, warm cell → the brightest warm swatch
    expect(makeMatcher([], "adaptive", stats)(1, 2, 3)).toBe(-1);
  });

  it("uses relative brightness so a flat image still resolves, and a grey picture is not hue-amplified", () => {
    const flat = sampleStats(picture(2, 1, () => [100, 100, 100]), 2, 1);
    expect(flat.lRange[0]).toBe(flat.lRange[1]);
    expect(makeMatcher(JUNGLE, "adaptive", flat)(100, 100, 100)).toBeGreaterThanOrEqual(0);
    // A grey picture with faint noise: adaptive must not blow the noise up into hue and scatter the cells.
    const greys = picture(8, 1, (x) => [120 + (x % 2), 120, 120 - (x % 2)]);
    const nearest = makeMatcher(JUNGLE, "adaptive", sampleStats(greys, 8, 1));
    const ids = new Set<number>();
    for (let x = 0; x < 8; x++) ids.add(nearest(greys[x * 4], greys[x * 4 + 1], greys[x * 4 + 2]));
    expect(ids.size).toBe(1);
  });

  it("weighs brightness against hue by the balance", () => {
    // Bright but blue-ish: hue says Water (dark), brightness says High Dirt (bright).
    const cell: [number, number, number] = [150, 160, 210];
    const st = sampleStats(picture(3, 1, (x) => [cell, BLACK, TAN][x]), 3, 1);
    expect(JUNGLE[makeMatcher(JUNGLE, "adaptive", st, 1)(...cell)].id).toBe(5);
    expect(JUNGLE[makeMatcher(JUNGLE, "adaptive", st, 0)(...cell)].id).toBe(3);
  });

  it("exact mode is plain distance to the key colours", () => {
    const nearest = makeMatcher([GRASS, WATER, DIRT], "exact", stats);
    expect(nearest(40, 120, 40)).toBe(0);
    expect(nearest(30, 60, 160)).toBe(1);
    expect(nearest(120, 90, 50)).toBe(2);
  });
});

describe("adjustments", () => {
  const rgba = picture(3, 1, (x) => [[40, 80, 120], [200, 100, 50], [128, 128, 128]][x]);

  it("are a no-op when neutral and otherwise return a new buffer with alpha kept", () => {
    expect(isNeutral(DEFAULT_ADJUSTMENTS)).toBe(true);
    expect(adjustSamples(rgba, DEFAULT_ADJUSTMENTS)).toBe(rgba);
    const out = adjustSamples(rgba, { ...DEFAULT_ADJUSTMENTS, brightness: 10 });
    expect(out).not.toBe(rgba);
    expect(out[3]).toBe(255);
  });

  it("brighten, invert, desaturate and stretch levels", () => {
    const bright = adjustSamples(rgba, { ...DEFAULT_ADJUSTMENTS, brightness: 100 });
    expect(bright[0]).toBe(255);
    const inverted = adjustSamples(rgba, { ...DEFAULT_ADJUSTMENTS, invert: true });
    expect(Array.from(inverted.slice(0, 3))).toEqual([215, 175, 135]);
    const grey = adjustSamples(rgba, { ...DEFAULT_ADJUSTMENTS, saturation: -100 });
    expect(grey[0]).toBe(grey[1]);
    expect(grey[1]).toBe(grey[2]);
    const dark = picture(2, 1, (x) => [100 + x * 20, 100 + x * 20, 100 + x * 20]);
    const levelled = adjustSamples(dark, { ...DEFAULT_ADJUSTMENTS, autoLevels: true });
    expect(levelled[0]).toBe(0);
    expect(levelled[4]).toBe(255);
    const contrasty = adjustSamples(rgba, { ...DEFAULT_ADJUSTMENTS, contrast: 60 });
    expect(contrasty[0]).toBeLessThan(40);
    expect(contrasty[4]).toBeGreaterThan(200);
    const lighter = adjustSamples(rgba, { ...DEFAULT_ADJUSTMENTS, gamma: 2 });
    expect(lighter[0]).toBeGreaterThan(40);
    expect(adjustSamples(rgba, { ...DEFAULT_ADJUSTMENTS, gamma: 0.5 })[0]).toBeLessThan(40);
  });

  it("rotate hue: red turned 120° is green-ish", () => {
    const red = picture(1, 1, () => [200, 30, 30]);
    const out = adjustSamples(red, { ...DEFAULT_ADJUSTMENTS, hue: 120 });
    expect(out[1]).toBeGreaterThan(out[0]);
    expect(out[1]).toBeGreaterThan(out[2]);
  });
});

describe("matching", () => {
  it("assigns every opaque cell the nearest colour and skips transparent ones", () => {
    const rgba = picture(4, 2, (x, y) => (y === 0 ? [40, 120, 40] : x === 3 ? [0, 0, 0, 0] : [30, 60, 160]));
    const grid = matchTerrains(rgba, 4, 2, { terrains: [GRASS, WATER, DIRT], ...exact });
    expect([...grid]).toEqual([5, 5, 5, 5, 7, 7, 7, -1]);
    expect(countCells(grid, [GRASS, WATER, DIRT])).toEqual([4, 3, 0]);
  });

  it("maps brightness bands in list order, dark to light, over the picture's own range", () => {
    const rgba = picture(3, 1, (x) => [60 + x * 60, 60 + x * 60, 60 + x * 60]);
    const grid = matchTerrains(rgba, 3, 1, { terrains: [WATER, DIRT, GRASS], mode: "brightness", smooth: 0 });
    expect([...grid]).toEqual([7, 2, 5]);
  });

  it("returns -1 everywhere with no terrains", () => {
    const grid = matchTerrains(picture(2, 2, () => [1, 2, 3]), 2, 2, { terrains: [], ...exact });
    expect([...grid]).toEqual([-1, -1, -1, -1]);
  });

  it("blur removes an isolated speck", () => {
    const rgba = picture(5, 5, (x, y) => (x === 2 && y === 2 ? [30, 60, 160] : [40, 120, 40]));
    const sharp = matchTerrains(rgba, 5, 5, { terrains: [GRASS, WATER], ...exact });
    const soft = matchTerrains(rgba, 5, 5, { terrains: [GRASS, WATER], mode: "exact", smooth: 1 });
    expect(sharp[12]).toBe(7);
    expect(soft[12]).toBe(5);
    expect(boxBlur(rgba, 5, 5, 0)).toBe(rgba);
    const blurred = boxBlur(rgba, 5, 5, 1);
    expect(blurred[12 * 4]).toBeGreaterThan(30);
    expect(blurred[0]).toBe(40); // corners of a flat field stay flat
  });

  it("applies the adjustments before matching", () => {
    const rgba = picture(1, 1, () => [30, 60, 160]);
    expect(matchTerrains(rgba, 1, 1, { terrains: [GRASS, WATER], ...exact })[0]).toBe(7);
    // Rotate blue towards green and the same cell becomes Grass.
    expect(matchTerrains(rgba, 1, 1, { terrains: [GRASS, WATER], ...exact, adjust: { ...DEFAULT_ADJUSTMENTS, hue: 150 } })[0]).toBe(5);
  });
});

describe("cleanup", () => {
  it("the majority filter removes a speck, keeps ties, and never touches -1 cells", () => {
    const grid = new Int32Array([
      5, 5, 5, 5,
      5, 7, 5, -1,
      5, 5, 5, 5,
    ]);
    const once = majorityFilter(grid, 4, 3, 1);
    expect(once[5]).toBe(5);
    expect(once[7]).toBe(-1);
    expect(majorityFilter(grid, 4, 3, 0)).toBe(grid);
    // A 2-wide stripe survives: each stripe cell sees 6 of its own kind against 3.
    const stripes = new Int32Array([5, 5, 7, 7, 5, 5, 7, 7, 5, 5, 7, 7]);
    expect([...majorityFilter(stripes, 4, 3, 1)]).toEqual([...stripes]);
  });

  it("small regions join their commonest neighbour, smallest first", () => {
    const grid = new Int32Array([
      5, 5, 5, 5, 5,
      5, 7, 7, 5, 5,
      5, 5, 5, 5, 2,
      5, 5, 5, -1, 2,
    ]);
    const out = removeSmallRegions(grid, 5, 4, 3);
    expect(out[6]).toBe(5);
    expect(out[7]).toBe(5);
    expect(out[14]).toBe(5); // the two-cell 2 column too
    expect(out[18]).toBe(-1); // transparent cells stay
    expect(removeSmallRegions(grid, 5, 4, 1)).toBe(grid);
    // A region of exactly minSize is kept.
    expect(removeSmallRegions(grid, 5, 4, 2)[6]).toBe(7);
  });

  it("matchTerrains runs despeckle and region cleanup after matching", () => {
    const rgba = picture(6, 6, (x, y) => ((x === 2 && y === 2) || (x === 4 && y === 4) ? [30, 60, 160] : [40, 120, 40]));
    const plain = matchTerrains(rgba, 6, 6, { terrains: [GRASS, WATER], ...exact });
    expect(plain[14]).toBe(7);
    expect(matchTerrains(rgba, 6, 6, { terrains: [GRASS, WATER], ...exact, despeckle: 1 })[14]).toBe(5);
    expect(matchTerrains(rgba, 6, 6, { terrains: [GRASS, WATER], ...exact, minRegion: 2 })[14]).toBe(5);
  });
});

describe("painting helpers", () => {
  it("groups cells by terrain with the rect origin applied", () => {
    const grid = new Int32Array([5, 7, -1, 5]);
    const groups = cellsByTerrain(grid, 2, 2, 3, 1, 10);
    expect([...groups.get(5)!]).toEqual([1 * 10 + 3, 2 * 10 + 4]);
    expect([...groups.get(7)!]).toEqual([1 * 10 + 4]);
    expect(groups.has(-1)).toBe(false);
  });

  it("a diamond takes the commonest of the four cells around its centre, top-left winning ties", () => {
    const grid = new Int32Array([
      5, 7, 7,
      2, 7, 5,
      2, 2, 5,
    ]);
    expect(diamondTerrain(grid, 3, 3, 1, 1)).toBe(7); // 5,7 / 2,7 → 7 twice
    expect(diamondTerrain(grid, 3, 3, 2, 2)).toBe(5); // (1,1)=7,(2,1)=5,(1,2)=2,(2,2)=5 → 5 twice
    expect(diamondTerrain(grid, 3, 3, 1, 2)).toBe(2); // (0,1)=2,(1,1)=7,(0,2)=2,(1,2)=2
    expect(diamondTerrain(grid, 3, 3, 0, 0)).toBe(5); // only (0,0) is in bounds
    expect(diamondTerrain(grid, 3, 3, 3, 3)).toBe(5); // only (2,2)
    expect(diamondTerrain(new Int32Array([-1, -1, -1, -1]), 2, 2, 1, 1)).toBe(-1);
    expect(diamondTerrain(new Int32Array([5, 7, 7, 5]), 2, 2, 1, 1)).toBe(5); // 2:2 tie → top-left
  });

  it("paints low ground first and, at one height, the commonest first", () => {
    const heights = new Map([[2, 0], [3, 1], [5, 0], [9, 2]]);
    const counts = new Map([[2, 10], [3, 40], [5, 30], [9, 1]]);
    expect(paintOrder([9, 3, 2, 5], (id) => heights.get(id) ?? null, counts)).toEqual([5, 2, 3, 9]);
  });

  it("places a picture over the grid by fit", () => {
    expect(fitRect(200, 100, 50, 50, "stretch")).toEqual({ dx: 0, dy: 0, dw: 50, dh: 50 });
    expect(fitRect(200, 100, 50, 50, "contain")).toEqual({ dx: 0, dy: 13, dw: 50, dh: 25 });
    expect(fitRect(200, 100, 50, 50, "cover")).toEqual({ dx: -25, dy: 0, dw: 100, dh: 50 });
    expect(fitRect(0, 0, 8, 8, "contain")).toEqual({ dx: 0, dy: 0, dw: 8, dh: 8 });
  });
});
