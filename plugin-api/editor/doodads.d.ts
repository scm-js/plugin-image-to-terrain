/**
 * Doodad edits: placing, removing and moving the tile-based doodads StarEdit records in
 * `DD2 `, as invertible change lists in the spirit of `TileChange` / `UnitChange`.
 *
 * A placed doodad is three things in the file, and an edit touches all of them:
 *
 *   - its megatiles stamped into MTXM (`scenario.tiles`) — but *not* into TILE
 *     (`scenario.editorTiles`), which keeps the ground beneath so removal can restore it;
 *   - a `DD2 ` record with the dddata index and the footprint's pixel centre;
 *   - for doodads with an overlay (tree canopies, Installation doors), a `THG2` sprite at
 *     the same centre carrying the doodad's CV5 flag word, exactly as StarEdit writes it.
 *
 * Placement follows StarEdit's rules unless "place anywhere" is on: every cell with a
 * requirement in dddata.bin must sit on exactly that CV5 group, no cell may land on
 * another doodad's tile, and the footprint must be inside the map (that last one always
 * holds — tiles cannot be written off the edge). "Snap to grid" keeps the left column
 * even, which is where StarEdit puts every doodad (the isometric lattice is two tiles
 * wide) and what the requirement tables are drawn for.
 */
import { type Scenario } from "../formats/chk/scenario";
import { type DoodadRecord, type SpriteRecord } from "../formats/chk/sections/objects";
import { type Tileset } from "../formats/tileset/decode";
import { type DoodadCatalogue, type DoodadDef } from "../formats/tileset/doodads";
import { type TileChange } from "./terrain";
import { applySpriteChanges, type SpriteChange } from "./sprites";
export { applySpriteChanges, type SpriteChange };
export interface DoodadChange {
    index: number;
    before: DoodadRecord | null;
    after: DoodadRecord | null;
}
/** Everything one doodad edit changes; each list undoes in reverse. */
export interface DoodadEdit {
    /** MTXM-only tile changes (apply with `applyChanges(…, "mtxm")`). */
    tiles: TileChange[];
    doodads: DoodadChange[];
    sprites: SpriteChange[];
}
export declare function applyDoodadChanges(scn: Scenario, changes: readonly DoodadChange[], direction?: "do" | "undo"): void;
export interface DoodadPlacementOptions {
    /** Skip StarEdit's ground check: any doodad goes on any terrain, even over another doodad. */
    placeAnywhere: boolean;
    /** Keep the left column on an even tile, as StarEdit always does. */
    snapToGrid: boolean;
}
export declare const DEFAULT_DOODAD_PLACEMENT: DoodadPlacementOptions;
export interface TileRect {
    x0: number;
    y0: number;
    /** Exclusive. */
    x1: number;
    y1: number;
}
/** The tiles a placed doodad covers. */
export declare function doodadFootprint(def: DoodadDef, rec: DoodadRecord): TileRect;
/**
 * Top-left tile for a doodad dropped with the pointer at map pixel (px, py): the
 * footprint is centred on the pointer, the left column made even when snapping, and the
 * whole thing kept inside the map (a snapped doodad that cannot fit evenly stays even
 * and one tile short of the right edge).
 */
export declare function snapDoodad(def: DoodadDef, px: number, py: number, mapW: number, mapH: number, snap?: boolean): {
    x: number;
    y: number;
};
export interface DoodadVerdict {
    ok: boolean;
    /** The footprint leaves the map (never allowed). */
    outOfBounds: boolean;
    /** Cell indices (row-major) whose ground fails the check, for the ghost to mark red. */
    bad: number[];
}
/**
 * May `def` go with its top-left tile at (tx, ty)? `tileAt` overrides what a cell
 * currently holds — a move passes the map as it would be with the moving doodads gone.
 */
export declare function checkDoodadPlacement(scn: Scenario, tileset: Tileset | null, def: DoodadDef, tx: number, ty: number, opts: DoodadPlacementOptions, tileAt?: (at: number) => number): DoodadVerdict;
export declare function makeDoodad(def: DoodadDef, tx: number, ty: number, owner: number): DoodadRecord;
/** The THG2 record StarEdit adds for a doodad's overlay, or null when it has none. */
export declare function makeOverlaySprite(def: DoodadDef, rec: DoodadRecord): SpriteRecord | null;
/** Index of the THG2 record that is this doodad's overlay, or -1. */
export declare function overlaySpriteIndex(scn: Scenario, def: DoodadDef, rec: DoodadRecord, taken?: ReadonlySet<number>): number;
/**
 * Stamp `def` at (tx, ty): its tiles into MTXM, a DD2 record and, if it has one, the
 * overlay sprite. `tileAt` is what the cells hold right now (a move passes the state
 * with the old copy removed). Nothing is applied.
 */
export declare function placeDoodad(scn: Scenario, def: DoodadDef, tx: number, ty: number, owner: number, tileAt?: (at: number) => number): DoodadEdit;
/**
 * What a doodad cell goes back to when the doodad leaves: the ground TILE kept under it,
 * or — when TILE holds a doodad tile too (a map from an editor that writes doodads into
 * both sections) — a fresh tile of the group dddata says belongs there. With nothing
 * better to go on the cell keeps its tile.
 */
export declare function groundUnder(scn: Scenario, tileset: Tileset | null, def: DoodadDef, cell: number, at: number, random?: () => number): number;
/**
 * Take the doodads at `indices` off the map: their cells go back to the ground beneath
 * (only where the cell still shows that doodad's tile), their records go, and so do
 * their overlay sprites. Removals are ordered highest index first.
 */
export declare function removeDoodads(scn: Scenario, tileset: Tileset | null, catalogue: DoodadCatalogue, indices: Iterable<number>, random?: () => number): DoodadEdit;
/** Replace fields on the doodads at `indices` (and mirror owner / disabled onto their overlay sprites). */
export declare function updateDoodads(scn: Scenario, catalogue: DoodadCatalogue, indices: number[], patch: Partial<Pick<DoodadRecord, "owner" | "disabled">>): DoodadEdit;
/** Index of the topmost (last placed) doodad with a tile on (tx, ty), or -1. */
export declare function doodadAt(scn: Scenario, catalogue: DoodadCatalogue, tx: number, ty: number): number;
/** Indices of doodads whose footprint intersects the tile rectangle (inclusive corners). */
export declare function doodadsInBox(scn: Scenario, catalogue: DoodadCatalogue, box: TileRect): number[];
/**
 * Doodads that lost a tile to a terrain edit at `changedTiles` (flat indices): any whose
 * cell no longer shows its own tile. The Terrain palette removes these in the same undo
 * step, so half a tree is never left behind with a record claiming it is whole.
 */
export declare function strandedDoodads(scn: Scenario, catalogue: DoodadCatalogue, changedTiles: Iterable<number>): number[];
