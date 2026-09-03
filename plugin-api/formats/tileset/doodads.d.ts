/**
 * The tileset's doodad catalogue: what the Doodads palette lists and what placement
 * stamps onto the map.
 *
 * A doodad is a rectangle of CV5 doodad groups (see `Cv5Doodad`): one group per row,
 * one megatile slot per column, every group repeating the doodad's `ddData` index,
 * width and height. Two more files describe it:
 *
 *   - `tileset\<name>\dddata.bin` — 512 entries of 256 u16, indexed by `ddData`: for
 *     each cell (row-major, stride `width`) the CV5 group that must already be under it
 *     for StarEdit to allow the placement, or 0 for "anything". This is how a ramp only
 *     fits on the cliff edge it was drawn for. Cells can be required yet carry no
 *     megatile (the ramp's approach), or carry a megatile with no requirement.
 *   - `rez\stat_txt.tbl` — the category name each group's `nameIndex` points at.
 *
 * DD2 records store the `ddData` index, so it is the doodad's id here too.
 */
import { type Tileset } from "./decode";
export interface DoodadDef {
    /** The `dddata.bin` index, which DD2 records store. */
    id: number;
    /** First CV5 group; row `r` is group `group + r`, column `c` is slot `c`. */
    group: number;
    width: number;
    height: number;
    /** Palette category, from stat_txt.tbl; "Unlisted" for groups without a name. */
    category: string;
    /** The first group's CV5 flag word — copied onto the overlay's THG2 record, as StarEdit does. */
    flags: number;
    /** The sprite (or unit) drawn over the tiles, or null. */
    overlay: DoodadOverlay | null;
    /** MTXM id per cell, row-major; 0 where the doodad leaves the ground alone. */
    tiles: Uint16Array;
    /** CV5 group required under each cell, row-major; 0 = no requirement. */
    required: Uint16Array;
    /**
     * Whether any of its minitiles carries the VF4 ramp bit. StarEdit files ramps under the
     * cliff categories with no name of their own; this is the only way to tell them apart.
     */
    ramp: boolean;
}
export interface DoodadOverlay {
    kind: "sprite" | "unit";
    /** sprites.dat or units.dat id. */
    id: number;
    flipped: boolean;
}
export interface DoodadCategory {
    name: string;
    doodads: DoodadDef[];
}
export interface DoodadCatalogue {
    doodads: DoodadDef[];
    byId: Map<number, DoodadDef>;
    /** In first-appearance order, the way StarEdit's category drop-down lists them; "Unlisted" last. */
    categories: DoodadCategory[];
    /** Whether dddata.bin was available; without it nothing is ever refused for its ground. */
    hasPlacementData: boolean;
}
export declare const DDDATA_ENTRY_CELLS = 256;
export declare const DDDATA_ENTRIES = 512;
export declare const DDDATA_SIZE: number;
/**
 * Read the doodads out of the CV5. `dddata` may be null (no requirements) and `names`
 * the decoded stat_txt.tbl or null (one anonymous category).
 */
export declare function buildDoodadCatalogue(tileset: Tileset, dddata: Uint8Array | null, names: readonly string[] | null): DoodadCatalogue;
/** An empty catalogue, for when the tileset graphics are missing. */
export declare const NO_DOODADS: DoodadCatalogue;
/** Row-major cell index of tile column `col`, row `row`. */
export declare const doodadCell: (def: DoodadDef, col: number, row: number) => number;
/**
 * Top-left tile of a doodad whose DD2 record puts its centre at pixel (x, y). Odd sizes
 * put the centre mid-tile, which is why the division rounds.
 */
export declare function doodadOrigin(def: DoodadDef, x: number, y: number): {
    x: number;
    y: number;
};
/** The DD2 (and overlay THG2) pixel position of a doodad placed with its top-left tile at (tx, ty). */
export declare function doodadCenter(def: DoodadDef, tx: number, ty: number): {
    x: number;
    y: number;
};
