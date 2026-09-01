/**
 * The per-tileset tables StarEdit's isometric brush runs on.
 *
 * Nothing here can be read off the CV5: it is the numbering StarEdit compiled in, as
 * reverse-engineered for Chkdraft (src/mapping_core/sc.h, MIT, Justin Forsberg).
 * Upstream: https://github.com/TheNitesWhoSay/Chkdraft
 * Full provenance and license notice: ../../ATTRIBUTION.md
 *
 * Each
 * tileset has one row per CV5 terrain type (the `index` field of a tile group):
 *
 *  - `isomValue` — what the ISOM section stores (shifted left 4) for a diamond of that
 *    type, and the row of the shape-link table the type starts at. Flat terrains
 *    ("solid brushes") take one row; each cliff/edge set takes fourteen (one per shape).
 *  - `linkId` — the identity neighbours are compared by; unrelated to `isomValue`.
 *  - `brush` — position in StarEdit's palette, or -1 for types it does not offer.
 *
 * Row 0's `isomValue` is where the shape rows begin. Rows above the half-way point are
 * edge sets; their `isomValue` is the first of their fourteen shape rows.
 *
 * `terrainTypeMap` is the compressed adjacency list: "type A, then the types a search
 * for a neighbour of A starts at, 0" repeated, ending in 0. See editor/isom.ts.
 */
export interface IsomTerrainType {
    /** CV5 group `index`. */
    index: number;
    isomValue: number;
    linkId: number;
    brush: number;
}
export interface IsomTilesetTables {
    terrainTypes: readonly IsomTerrainType[];
    terrainTypeMap: readonly number[];
}
/** Indexed by ERA (0 badlands … 7 twilight). */
export declare const ISOM_TABLES: readonly IsomTilesetTables[];
/** The ISOM value a flat diamond of terrain `index` stores, or 0 when the tileset has no such brush. */
export declare function isomValueOf(era: number, index: number): number;
