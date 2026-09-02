/**
 * Resize / crop the map in place.
 *
 * Not an undoable edit — like the settings dialogs it is a transaction, and the caller
 * (`resizeDocumentAtom`) drops the history. Existing content keeps its position relative
 * to the chosen anchor: the offset `dx` is kept *even* so StarEdit's left/right tile
 * pairs stay on their columns. Terrain outside the new bounds is cropped; units, sprites
 * and doodads whose position falls outside are dropped (a doodad's tiles are already part
 * of MTXM, so its record simply goes); locations are shifted and, on request, clamped —
 * never dropped, since triggers name them by slot. Anywhere is reset to the new bounds.
 * ISOM is rebuilt from the tiles when the tileset is loaded (exact for StarEdit terrain),
 * else replaced by the flat fill's lattice — the diamond grid's parity does not survive
 * an arbitrary shift.
 */
import { type Scenario } from "../formats/chk/scenario";
import type { Tileset } from "../formats/tileset/decode";
import { type BaseTerrain } from "../formats/tileset/terrain";
export interface ResizeOptions {
    width: number;
    height: number;
    /** 3×3 grid, row-major: 0 top-left … 4 centre … 8 bottom-right. */
    anchor: number;
    /** Terrain the new area is filled with. */
    fill: BaseTerrain;
    tileset: Tileset | null;
    /** ERA of the map, for the ISOM numbering of the fill. */
    era: number;
    /** Pull locations that hang past the new edge back inside; off leaves them where the shift put them. */
    clampLocations: boolean;
    random?: () => number;
}
export interface ResizeResult {
    dx: number;
    dy: number;
    unitsDropped: number;
    spritesDropped: number;
    doodadsDropped: number;
    locationsClamped: number;
    /** True when ISOM was reconstructed from the tiles; false when it is the flat fill's lattice. */
    isomRebuilt: boolean;
}
/** Tile offset of the old map inside the new one for an anchor; `dx` is even. */
export declare function resizeOffset(oldW: number, oldH: number, newW: number, newH: number, anchor: number): {
    dx: number;
    dy: number;
};
/** What a resize would drop or clamp, without doing it — for the dialog's preview line. */
export declare function resizePreview(scn: Scenario, width: number, height: number, anchor: number): Omit<ResizeResult, "isomRebuilt" | "locationsClamped"> & {
    locationsClamped: number;
};
export declare function resizeScenario(scn: Scenario, options: ResizeOptions): ResizeResult;
