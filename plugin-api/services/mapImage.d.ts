import { type Scenario } from "../formats/chk/scenario";
import { type LoadedTileset } from "../formats/tileset/load";
import { type UnitAssets } from "../formats/units/load";
import type { Rect } from "../editor/terrain";
/** The scales the export offers, largest first. */
export declare const IMAGE_SCALES: readonly [32, 16, 8, 4, 2, 1];
export interface MapImageOptions {
    /** Output pixels per map tile. 32 matches the game's art 1:1; 1 is a minimap. */
    pixelsPerTile: number;
    units: boolean;
    sprites: boolean;
    locations: boolean;
    locationNames: boolean;
    startLocations: boolean;
    fog: boolean;
    /** Whose fog is drawn (0-based player), when `fog` is on. */
    fogPlayer: number;
    /** Grid spacing in map pixels (32 = one tile); 0 for no grid. */
    grid: number;
    /**
     * The part of the map to draw, in tiles (exclusive `x1` / `y1`). The whole map when
     * absent. Everything is drawn in map coordinates and the canvas is translated, so a
     * region looks exactly like that part of the full picture — a unit half outside the
     * region still leans in.
     */
    rect?: Rect | null;
}
export declare const DEFAULT_IMAGE_OPTIONS: MapImageOptions;
/** True when this scale draws unit and sprite graphics rather than minimap dots. */
export declare function drawsSprites(pixelsPerTile: number): boolean;
/** What `renderMapImage` draws with; either may be null when the game data is not installed. */
export interface MapImageAssets {
    tileset: LoadedTileset | null;
    units: UnitAssets | null;
}
/** The tiles an export covers: its `rect` clamped to the map, or the whole map. */
export declare function imageArea(scn: Scenario, options: MapImageOptions): Rect;
export declare function imageSize(scn: Scenario, options: MapImageOptions): {
    width: number;
    height: number;
};
/**
 * Fetch what the options ask for: the map's tileset always, the unit tables and every GRP
 * the drawn units and sprites need when they will be big enough to show one. Missing game
 * data is a normal state, so anything that fails comes back null and the render degrades.
 */
export declare function loadMapImageAssets(scn: Scenario, options: MapImageOptions): Promise<MapImageAssets>;
/** The whole map on a fresh canvas. Everything it needs must already be loaded (see above). */
export declare function renderMapImage(scn: Scenario, assets: MapImageAssets, options: MapImageOptions): HTMLCanvasElement;
/** Render and encode in one go. Rejects if the browser refuses the canvas size. */
export declare function exportMapImage(scn: Scenario, options: MapImageOptions): Promise<Blob>;
export declare function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob>;
