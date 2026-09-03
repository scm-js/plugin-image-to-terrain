/**
 * Terrain edits as invertible change lists.
 *
 * Every brush computes the tiles it would change without touching the scenario, the
 * caller applies them, and the same list undoes the stroke. MTXM and TILE are kept in
 * step because the game reads one and StarEdit the other (TILE being the ground without
 * doodads, a change records what TILE held separately — see `TileChange.under`); ISOM
 * is deliberately left alone — these brushes place tiles the ISOM model has no
 * vocabulary for, which is exactly what SCMDraft does in its Rectangular/Subtile modes.
 */
import { type Scenario } from "../formats/chk/scenario";
import type { Tileset } from "../formats/tileset/decode";
export interface TileChange {
    /** Flat index into `scenario.tiles`. */
    at: number;
    before: number;
    after: number;
    /**
     * What `scenario.editorTiles` (TILE) held before a terrain change, when that differs
     * from `before` (the cell was under a doodad). Filled in by `applyChanges` the first
     * time a change is applied, so undo can put the ground back rather than the doodad tile.
     */
    under?: number;
}
export interface Rect {
    x0: number;
    y0: number;
    /** Exclusive. */
    x1: number;
    y1: number;
}
/**
 * The tiles an N×N brush centred on (x, y) covers, the way the viewport's hover
 * outline draws it: even sizes hang one more tile to the right and bottom.
 */
export declare function brushRect(x: number, y: number, size: number, width: number, height: number): Rect;
/** Write one tile id over a set of tiles. */
export declare function stampTile(scn: Scenario, indices: Iterable<number>, id: number): TileChange[];
export interface FlatBrush {
    /** Even CV5 group of the terrain's flat pair. */
    group: number;
    /** A fixed variation slot, or -1 to draw one per pair. */
    variation?: number;
}
/**
 * Lay flat terrain over a set of tiles. Pairs follow the map's own parity — even
 * columns take the left group, odd the right — and both halves of a pair share one
 * variation when both fall inside the set, so the result is indistinguishable from
 * ground StarEdit laid down itself.
 */
export declare function stampTerrain(scn: Scenario, tileset: Tileset, brush: FlatBrush, indices: Iterable<number>, random?: () => number): TileChange[];
/** What Replace Terrain matches or writes: a flat terrain type (by ISOM id) or one exact tile. */
export type TerrainPick = {
    kind: "terrain";
    id: number;
    variation?: number;
} | {
    kind: "tile";
    id: number;
};
/**
 * The tiles Replace Terrain would touch: every cell (in `rect`, else the whole map) whose
 * tile is `from` — an exact id, or any tile of the flat pair carrying the terrain's ISOM
 * id, read off the CV5 group index as the Rect fill does. A terrain match needs the
 * tileset graphics; without them it is empty.
 */
export declare function matchingTiles(scn: Scenario, tileset: Tileset | null, from: TerrainPick, rect?: Rect): number[];
/**
 * Tools ▸ Replace Terrain: every tile matching `from` becomes `to` — flat pairs laid the
 * way the Rect brush lays them (so a terrain-to-terrain swap keeps StarEdit's left/right
 * pairing), or one exact tile everywhere. ISOM is left alone, as by the Rect brush.
 */
export declare function replaceTerrain(scn: Scenario, tileset: Tileset | null, from: TerrainPick, to: TerrainPick, rect?: Rect, random?: () => number): TileChange[];
/** The even CV5 group of the flat pair carrying an ISOM terrain id, or -1. */
export declare function flatGroupOf(tileset: Tileset, terrainId: number): number;
/**
 * The 4-connected region around (x, y) whose tiles all satisfy `same`, as flat
 * indices. Capped so a runaway predicate on a 256x256 map still returns.
 */
export declare function floodRegion(scn: Scenario, x: number, y: number, same: (id: number) => boolean): Set<number>;
/**
 * Apply a change list, or take it back. Terrain edits (`layer` "terrain") write MTXM and
 * TILE alike, remembering what TILE held in `under` on first application; doodad edits
 * ("mtxm") touch only MTXM's contents, leaving TILE as the ground beneath.
 */
export declare function applyChanges(scn: Scenario, changes: readonly TileChange[], direction?: "do" | "undo", layer?: "terrain" | "mtxm"): void;
/**
 * For code that has already written `scn.tiles` itself (the isometric brush): bring
 * TILE along and record what it held, exactly as `applyChanges` would have.
 */
export declare function mirrorEditorTiles(scn: Scenario, changes: readonly TileChange[]): void;
/**
 * Accumulates one drag's worth of changes so the stroke undoes as a unit: a tile
 * painted twice keeps its original `before` and its final `after`.
 */
export declare class Stroke {
    private readonly changes;
    add(changes: readonly TileChange[]): void;
    /** Whether the stroke has touched this cell. */
    has(at: number): boolean;
    get size(): number;
    /** The net change list, dropping tiles that ended where they started. */
    finish(): TileChange[];
}
/** Integer points from (x0, y0) to (x1, y1) inclusive, so a fast drag leaves no gaps. */
export declare function linePoints(x0: number, y0: number, x1: number, y1: number): {
    x: number;
    y: number;
}[];
