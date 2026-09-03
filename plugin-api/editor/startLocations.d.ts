/**
 * Tools ▸ Auto-place Start Locations: one start location per player, on a ring or in the
 * corners, each nudged to the nearest spot the placement checks accept. The Melee Wizard
 * plugin does the elaborate version (bases, symmetry from a picked point); this is the
 * built-in "give me N sensible starts" a fresh melee map needs before anything else, and
 * it goes through the ordinary unit change lists so it is one undo step.
 *
 * Ideal points: `ring` spaces the players evenly on an ellipse inset by `margin` tiles,
 * starting top-left and going clockwise, so two players sit on a diagonal and four in
 * the corners; `corners` fills the four corners first and the edge midpoints after. The
 * spiral search then walks outward tile by tile until `checkPlacement` (terrain and
 * collision as the Units palette has them set) says the start location fits.
 */
import type { Scenario } from "../formats/chk/scenario";
import type { Tileset } from "../formats/tileset/decode";
import type { UnitsDat } from "../formats/dat/dat";
import { type PlacementOptions } from "./placement";
import { type UnitChange } from "./units";
export type StartLayout = "ring" | "corners";
export interface StartPlacementOptions {
    /** How many players get a start location, 1..8; players are numbered from 1. */
    players: number;
    layout: StartLayout;
    /** Distance from the map edge to the ideal points, in tiles. */
    margin: number;
    /** Remove the start locations already on the map first. */
    replace: boolean;
    /** How far (in tiles) the search may wander from the ideal point before giving up. */
    searchRadius?: number;
    placement: PlacementOptions;
}
export declare const DEFAULT_START_PLACEMENT: Omit<StartPlacementOptions, "placement">;
export interface StartPlacementResult {
    changes: UnitChange[];
    /** Per player (0-based), where the start location landed, or null when nothing within reach fit. */
    placed: ({
        x: number;
        y: number;
    } | null)[];
    removed: number;
}
/** The players a map's slots say are playable — what the dialog offers as its default count. */
export declare function playableCount(scn: Scenario): number;
/** The ideal centre points, in map pixels, for `players` under a layout. */
export declare function idealStarts(width: number, height: number, players: number, layout: StartLayout, margin: number): {
    x: number;
    y: number;
}[];
/**
 * Compute and apply the placement: returns the change list (already applied to `scn`,
 * removals first) and where each player landed. Every start is checked against the
 * ones placed before it, so they never overlap each other.
 */
export declare function placeStartLocations(scn: Scenario, tileset: Tileset | null, tables: UnitsDat | null, options: StartPlacementOptions): StartPlacementResult;
