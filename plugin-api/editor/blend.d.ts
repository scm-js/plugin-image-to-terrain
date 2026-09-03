/**
 * The Blend brush: given one tile on the map, which tiles in the tileset would join it
 * seamlessly on each side?
 *
 * The game data has no such table. The CV5 edge links only say which cliff pieces the
 * isometric brush pairs with which, and say nothing about doodad tiles, the odd slots
 * of an edge set, or the hand-blends mappers make between two tilesets' worth of
 * ground. So this reads the pixels instead: each megatile's four outermost pixel
 * rows/columns are lifted straight out of the VR4 (`edgeTable`, cached per tileset),
 * and a candidate for a side scores by the mean per-channel difference between the
 * anchor's edge and the candidate's *opposite* edge — the anchor's right column against
 * the candidate's left column, and so on. 0 is a pixel-identical seam, a few units is a
 * seam the eye will not find, and flat ground against a cliff face is 50 and up.
 *
 * Everything here is pure and canvas-free so it runs in tests against the real files.
 */
import type { Scenario } from "../formats/chk/scenario";
import { type Tileset } from "../formats/tileset/decode";
import { type TileChange } from "./terrain";
export type Side = "left" | "top" | "right" | "bottom";
export declare const SIDES: readonly Side[];
/** The side of a neighbour that touches `side` of the anchor. */
export declare const OPPOSITE: Record<Side, Side>;
/** Pixels along one megatile edge. */
export declare const EDGE_PX = 32;
export interface EdgeTable {
    count: number;
    /**
     * `megatile * 384 + side * 96 + pixel * 3` → R, G, B. Left/right strips run top to
     * bottom, top/bottom strips left to right.
     */
    data: Uint8Array;
}
/** The outermost pixel strips of every megatile, built once per tileset. */
export declare function edgeTable(tileset: Tileset): EdgeTable;
/** Mean absolute per-channel difference, 0..255, between two edge strips. */
export declare function edgeDistance(edges: EdgeTable, a: number, sideA: Side, b: number, sideB: Side): number;
export interface BlendCandidate {
    /** MTXM tile id to place. */
    id: number;
    megatile: number;
    /** `edgeDistance` between the anchor's side and this tile's opposite side. */
    distance: number;
}
export interface BlendOptions {
    /** Largest distance still listed. */
    maxDistance: number;
    /** Most candidates listed per side. */
    limit: number;
    /** Optional filter over tile ids (the palette's group-kind dropdown). */
    include?: (id: number) => boolean;
}
/**
 * Designed left/right pairs measure 0.2–8 across the eight tilesets and the 5th percentile
 * of all tiles is 6–18, so 16 keeps the lists to seams the eye accepts; the palette lets
 * the user raise it.
 */
export declare const DEFAULT_BLEND_OPTIONS: BlendOptions;
/**
 * Every tile id that draws something, one per megatile — several ids can share a
 * megatile (a doodad group re-using ground art), and listing the same picture twice
 * helps nobody, so the lowest id wins.
 */
export declare function drawableTiles(tileset: Tileset): Uint32Array;
/** Tiles that would sit against `side` of `anchorId`, best seam first. */
export declare function blendCandidates(tileset: Tileset, anchorId: number, side: Side, options?: BlendOptions): BlendCandidate[];
/** All four sides at once. */
export declare function blendSides(tileset: Tileset, anchorId: number, options?: BlendOptions): Record<Side, BlendCandidate[]>;
export interface TilePos {
    x: number;
    y: number;
}
export declare function neighbourOf(at: TilePos, side: Side): TilePos;
export declare function inMap(scn: Pick<Scenario, "width" | "height">, at: TilePos): boolean;
/**
 * The change that puts `id` on the `side` neighbour of `anchor`, or null when that cell
 * is off the map. Empty when the tile is already there.
 */
export declare function placeBlend(scn: Scenario, anchor: TilePos, side: Side, id: number): TileChange[] | null;
