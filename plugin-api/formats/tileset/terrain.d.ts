/**
 * Base terrain: the flat ground each tileset's ISOM palette is built from, and the fill
 * a brand new map is made of.
 *
 * CV5 groups come in left/right pairs, because an ISOM diamond is two tiles wide: flat
 * ground alternates group `g` on even columns with `g + 1` on odd ones, both using the
 * same variation slot. A pair's `index` field is its ISOM terrain id.
 */
import type { Tileset } from "./decode";
export interface BaseTerrain {
    /** CV5 group `index`, which is also the ISOM terrain id. */
    id: number;
    /** Even CV5 group of the pair; odd columns use `group + 1`. */
    group: number;
}
/** Groups 2/3 are the tileset's base ground (ISOM id 2) — used when graphics are missing. */
export declare const DIRT: BaseTerrain;
/**
 * The terrain a new map is filled with: the pair carrying `isomId`, or the lowest-id
 * pair that has real graphics — ISOM id 2 is the base ground everywhere except Space
 * Platform, where it is the empty void.
 *
 * Ids are not the order the palette lists terrain in (badlands numbers High Dirt 3 and
 * Mud 4, while StarEdit shows Mud first), so callers name the terrain they want by id.
 */
export declare function baseTerrain(tileset: Tileset | null, isomId?: number): BaseTerrain;
export interface TerrainFill {
    tiles: Uint16Array;
    isom: Uint16Array;
}
/** Megatile slot 0 is the null megatile, so a slot holding it is an unused variation. */
export interface Variations {
    /** Slots before the group's first gap: what flat ground is nearly always made of. */
    common: number[];
    /** Slots past the gap — the occasional cracked/scorched tile. */
    rare: number[];
}
export declare function variationsOf(tileset: Tileset | null, group: number): Variations;
/**
 * A map of nothing but one flat terrain, laid out the way StarEdit writes a new
 * scenario: MTXM in left/right pairs with a random variation, and ISOM as the two flat
 * quads that alternate across the diamond grid.
 */
/** One variation slot, weighted the way StarEdit weights them. */
export declare function pickVariation({ common, rare }: Variations, random?: () => number): number;
export declare function flatTerrain(width: number, height: number, terrain: BaseTerrain, tileset: Tileset | null, random?: () => number, 
/** ERA of the map: the ISOM value of a terrain is numbered per tileset. */
era?: number): TerrainFill;
