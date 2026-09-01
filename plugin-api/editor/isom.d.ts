/**
 * The isometric terrain brush — StarEdit's, as reverse-engineered for Chkdraft
 * (Justin Forsberg, MIT; src/mapping_core/{sc,scenario,chk}.{h,cpp}).
 * Upstream: https://github.com/TheNitesWhoSay/Chkdraft
 * Full provenance and license notice: ../../ATTRIBUTION.md
 *
 * The model: a lattice of diamonds, each 4 tiles wide and 2 tall, centred on the
 * corners of the ISOM rect grid (a rect is a 2x1 tile pair; diamond (x, y) is centred
 * on the top-left corner of rect (x, y), so only (x + y) even are diamonds). A diamond
 * has one ISOM value, stored redundantly in the four rects it overlaps — two u16 per
 * rect, `(value << 4) | flags`, the flags saying which quadrant of which diamond the
 * u16 belongs to. `value` is a row of the shape-link table: one row per flat terrain,
 * fourteen per cliff/edge set (one per shape: four edges, four outer and four inner
 * corners, two straights).
 *
 * The shape-link table is derived from the CV5 at load time (`isomTables`): each
 * tile group carries four ISOM links, and the fourteen shape definitions say which
 * link pattern belongs in which quadrant of which shape. Only the terrain-type
 * numbering and the adjacency lists (`data/isomTables.ts`) had to be copied in.
 *
 * Painting (`paintIsom`) sets the brush diamonds to the terrain's value, then walks
 * outward: each neighbouring diamond is re-picked as the table row that agrees with
 * the most of its four neighbours (a terrain that cannot touch the new one becomes
 * the intermediate terrain, which is why the brush bleeds). Finally every touched rect
 * is turned back into tiles by hashing its four links and looking the hash up among
 * the CV5 groups, with cliff faces continued upward along the groups' stack links.
 *
 * Everything here mutates the scenario in place and returns the change lists, in the
 * same `{ at, before, after }` form as the tile brushes so one history entry undoes
 * both `tiles` and `isom`.
 */
import { type Scenario } from "../formats/chk/scenario";
import type { Tileset } from "../formats/tileset/decode";
import { type IsomTerrainType } from "../data/isomTables";
import { type TileChange } from "./terrain";
interface Links {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
/** One quadrant of a shape-link row: the two links on its rect sides, and its identity. */
interface QuadLinks extends Links {
    linkId: number;
}
export interface ShapeLinks {
    /** CV5 `index` of the terrain or edge set this row belongs to; 0 for padding rows. */
    terrainType: number;
    quads: [QuadLinks, QuadLinks, QuadLinks, QuadLinks];
}
export interface IsomTables {
    era: number;
    links: ShapeLinks[];
    terrainTypes: readonly IsomTerrainType[];
    /** `[a * n + b]`: the terrain to try first when `b` must sit next to `a`. */
    terrainTypeMap: Uint16Array;
    /** Link hash of a left-hand CV5 group → the even group indices carrying it. */
    hashToGroups: Map<number, number[]>;
}
/** The brush tables for a tileset's graphics, built once per loaded tileset. */
export declare function isomTables(tileset: Tileset, era: number): IsomTables;
/** The terrain types the tileset can actually paint isometrically, by CV5 index. */
export declare function isomTerrains(tables: IsomTables): number[];
export interface Diamond {
    x: number;
    y: number;
}
export declare const isomWidth: (scn: {
    width: number;
}) => number;
export declare const isomHeight: (scn: {
    height: number;
}) => number;
/** Only lattice points with an even coordinate sum are diamonds. */
export declare const isDiamond: (d: Diamond) => boolean;
/**
 * The diamond under a map pixel — StarEdit's own arithmetic. Diamond (x, y) is centred
 * on pixel (64x, 32y) and spans 128x64. The result can be off the map; check bounds.
 */
export declare function diamondAt(px: number, py: number): Diamond;
/** The in-bounds diamonds a brush of `extent` centred on `d` covers, for the hover preview. */
export declare function brushDiamonds(scn: {
    width: number;
    height: number;
}, d: Diamond, extent: number): Diamond[];
export interface IsomEdit {
    tiles: TileChange[];
    /** Changes to `scenario.isom`, indexed by u16. */
    isom: TileChange[];
}
/** True when the scenario carries an ISOM section the brush can work on. */
export declare function hasIsom(scn: Scenario | null): scn is Scenario & {
    isom: Uint16Array;
};
/**
 * Paint `terrainType` (a CV5 index) with an `extent`-diamond brush centred on `d`.
 * Mutates `scn.tiles` and `scn.isom`; returns what changed, or null when the terrain is
 * not one the tileset paints isometrically or `d` is not a diamond.
 */
export declare function paintIsom(scn: Scenario & {
    isom: Uint16Array;
}, tileset: Tileset, d: Diamond, terrainType: number, extent: number, random?: () => number): IsomEdit | null;
/** Apply (or take back) the ISOM half of an edit. */
export declare function applyIsomChanges(scn: Scenario, changes: readonly TileChange[], direction?: "do" | "undo"): void;
export interface IsomCheck {
    /** Rects that have tiles under them. */
    rects: number;
    /** Rects whose tiles are not what their ISOM resolves to (doodad tiles are excused). */
    mismatched: number;
}
/** How well the ISOM section describes the tiles that are actually on the map. */
export declare function checkIsom(scn: Scenario & {
    isom: Uint16Array;
}, tileset: Tileset): IsomCheck;
export interface IsomRebuild {
    isom: Uint16Array;
    diamonds: number;
    /** Diamonds no tile gave a clue for (borrowed from a neighbour). */
    unresolved: number;
}
/**
 * Reconstruct an ISOM section from the tiles: every tile group's four links say which
 * table rows could have produced it on each side, and each diamond takes the row most
 * of its eight rect-sides agree on. Exact for terrain StarEdit laid down (bar the
 * doodads over it), a best guess for hand-placed tiles.
 */
export declare function rebuildIsomFromTiles(scn: Scenario, tileset: Tileset): IsomRebuild;
/**
 * Regenerate every tile from the ISOM section — what StarEdit does after any isometric
 * edit, applied to the whole map. Used to validate the port against real maps.
 */
export declare function tilesFromIsom(scn: Scenario & {
    isom: Uint16Array;
}, tileset: Tileset, random?: () => number): IsomEdit;
export {};
