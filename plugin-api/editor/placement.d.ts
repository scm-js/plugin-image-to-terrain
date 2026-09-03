/**
 * Whether a unit can stand where it is: the checks StarEdit and SCMDraft offer as
 * placement options, and the game itself applies when it loads a map (a preplaced unit
 * that does not fit is silently dropped).
 *
 *   - terrain: a building's placement box must sit on buildable tiles; a ground unit's
 *     collision box on walkable minitiles (VF4 flags). Flyers go anywhere.
 *   - collision: ground units and buildings may not overlap each other's collision boxes.
 *
 * Start locations are markers rather than units and skip both checks.
 */
import type { Scenario } from "../formats/chk/scenario";
import type { UnitsDat } from "../formats/dat/dat";
import { type Tileset } from "../formats/tileset/decode";
import { type UnitGeometry } from "./units";
export interface PlacementOptions {
    /** Refuse to put a unit on top of another (ground units and buildings only). */
    checkCollision: boolean;
    /** Refuse unwalkable ground for units and unbuildable tiles for buildings. */
    checkTerrain: boolean;
    /** After a terrain edit, remove units the new terrain can no longer hold (the Terrain palette's toggle). */
    removeStranded: boolean;
    /** Buildings snap their placement box to the tile grid (StarEdit always does; SCMDraft lets you turn it off). */
    snapToGrid: boolean;
}
export declare const DEFAULT_PLACEMENT: PlacementOptions;
export type PlacementProblem = "terrain" | "collision";
export declare const START_LOCATION = 214;
/** Does the terrain under (x, y) hold a unit of this geometry? True when there is no tileset to ask. */
export declare function terrainFits(scn: Scenario, tileset: Tileset | null, g: UnitGeometry, unitId: number, x: number, y: number): boolean;
/** Index of the first placed unit whose collision box a unit here would overlap, or -1. */
export declare function collidesWith(scn: Scenario, tables: UnitsDat | null, g: UnitGeometry, unitId: number, x: number, y: number, ignore?: ReadonlySet<number>): number;
export interface PlacementVerdict {
    problem: PlacementProblem | null;
    /** The unit in the way, for collision problems. */
    blocker: number;
    /** The problem as a sentence fragment — "the ground is unwalkable", "it overlaps Terran Marine" — null when it fits. */
    reason: string | null;
}
/** The words for a verdict's problem, given the record list the blocker indexes. */
export declare function placementReason(tables: UnitsDat | null, unitId: number, problem: PlacementProblem | null, blocker: number, units: readonly {
    unitId: number;
}[]): string | null;
/** Apply the enabled checks to a unit of type `unitId` at (x, y); `ignore` are indices that do not count as blockers (the units being moved). */
export declare function checkPlacement(scn: Scenario, tileset: Tileset | null, tables: UnitsDat | null, opts: PlacementOptions, unitId: number, x: number, y: number, ignore?: ReadonlySet<number>): PlacementVerdict;
/**
 * Units that no longer fit their terrain after the tiles at `changedTiles` (flat indices)
 * were replaced — only units touching a changed tile are re-examined.
 */
export declare function strandedUnits(scn: Scenario, tileset: Tileset | null, tables: UnitsDat | null, changedTiles: Iterable<number>): number[];
