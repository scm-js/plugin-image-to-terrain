/**
 * Symmetry for the brushes: every cell a stroke touches is mirrored across the map's
 * axes (or rotated about its centre) before the brush runs, so the Rect, Tile and Fog
 * brushes lay the same thing down on both sides at once. The mirroring works on *sets
 * of cells*, not on strokes — `stampTerrain` then derives left/right pairs from column
 * parity as usual, so a mirrored Rect footprint still comes out as valid pairs whatever
 * the map's width. Objects go through the continuous versions (`mirrorPixel`,
 * `mirrorBox`, `mirrorTileRect`): a unit's centre, a location's box, a doodad's
 * footprint. The isometric brush mirrors the *point* it paints at (the diamond under each
 * image), so a cliff drawn on one side is drawn on the other by the same brush; only Blend
 * stays out, since it places from a picked anchor rather than a point.
 */
import type { Rect } from "./terrain";
export type SymmetryMode = "none" | "h" | "v" | "hv" | "rot180" | "rot90" | "diag" | "adiag";
export interface SymmetryModeInfo {
    id: SymmetryMode;
    label: string;
    hint: string;
    /** Only meaningful when the map is square. */
    square?: boolean;
}
export declare const SYMMETRY_MODES: readonly SymmetryModeInfo[];
export declare const requiresSquare: (mode: SymmetryMode) => boolean;
/** Whether the mode can run on a map of these dimensions. */
export declare function symmetryAvailable(mode: SymmetryMode, width: number, height: number): boolean;
export declare function symmetryLabel(mode: SymmetryMode): string;
export interface Point {
    x: number;
    y: number;
}
/**
 * The tile (x, y) and its images under `mode`, the original first, duplicates (a cell on
 * an axis, the centre of a rotation) dropped. Modes that need a square map fall back to
 * the original alone on a map that is not.
 */
export declare function mirrorPoints(mode: SymmetryMode, x: number, y: number, width: number, height: number): Point[];
/** Whether a mode's images keep a `rw` × `rh` box's shape (a quarter turn or a diagonal swaps the sides). */
export declare function keepsShape(mode: SymmetryMode, rw: number, rh: number): boolean;
/**
 * A pixel position and its images — the continuous version of `mirrorPoints`, for
 * anything placed by pixel rather than by tile (a unit's centre). `width`/`height` are
 * in tiles; the map is `width * 32` pixels wide.
 */
export declare function mirrorPixel(mode: SymmetryMode, px: number, py: number, width: number, height: number): Point[];
export interface Box {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
/**
 * A pixel box and its images, normalised — a location's bounds. A quarter turn of a box
 * is still a box, so every mode applies. `width`/`height` in tiles.
 */
export declare function mirrorBox(mode: SymmetryMode, box: Box, width: number, height: number): Box[];
/**
 * The top-left tiles of a `rw` × `rh` footprint's images — a doodad's. An image that
 * would turn the footprint on its side is dropped (`keepsShape`), since the doodad cannot
 * be turned.
 */
export declare function mirrorTileRect(mode: SymmetryMode, x: number, y: number, rw: number, rh: number, width: number, height: number): Point[];
/** Flat tile indices of a brush footprint and all its images, each cell once. */
export declare function mirrorRect(mode: SymmetryMode, rect: Rect, width: number, height: number): Set<number>;
/** The same for an arbitrary set of cells (a flood-fill region). */
export declare function mirrorIndices(mode: SymmetryMode, indices: Iterable<number>, width: number, height: number): Set<number>;
export interface AxisLine {
    /** Endpoints in tile units (may be fractional: the centre of a map of odd width is x = w / 2). */
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}
export interface SymmetryAxes {
    lines: AxisLine[];
    /** Whether the mode turns about the map centre (draw a centre mark). */
    centre: boolean;
}
/** What to draw for a mode: its mirror lines, and a centre mark for the rotations. */
export declare function symmetryAxes(mode: SymmetryMode, width: number, height: number): SymmetryAxes;
