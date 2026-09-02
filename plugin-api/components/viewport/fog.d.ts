/**
 * The fog of war overlay, drawn the way StarCraft shows ground it has explored but
 * cannot currently see: the terrain darkened through the tileset's `dark.pcx` remap.
 *
 * The game draws that state through row 18 of `tileset\<name>\dark.pcx`, a palette
 * remap that leaves roughly half the light with a slight blue bias. `FOG_TINT` holds
 * each tileset's mean per-channel ratio for that row (measured from the game's own
 * files); painting it with the `multiply` blend reproduces the remap's darkening
 * pixel for pixel, on units and overlays under the fog as well as on the ground.
 *
 * The section is tile-aligned, so the overlay is too, with one softening the game's
 * fog edges have: where two explored tiles meet a fogged corner the corner is cut at
 * 45°, and where two fogged tiles meet an explored corner the fog creeps in, so a
 * diagonal boundary reads as a line rather than a staircase.
 */
import type { Scenario } from "../../formats/chk/scenario";
/**
 * Mean RGB ratio of dark.pcx row 18 per tileset, in ERA order (badlands, platform,
 * install, ashworld, jungle, desert, ice, twilight), over palette entries 16–255.
 */
export declare const FOG_TINT: readonly (readonly [number, number, number])[];
/** The tint as a CSS colour, to be painted with the `multiply` blend. */
export declare function fogTintColor(tileset: number): string;
export interface FogView {
    /** Visible tile range, exclusive on the far side. */
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    /** Screen pixels per tile and the scroll offset in screen pixels. */
    tilePx: number;
    sx: number;
    sy: number;
}
/** Darken `player`'s fogged tiles over whatever is on the canvas already. */
export declare function drawFogOverlay(ctx: CanvasRenderingContext2D, scn: Scenario, tileset: number, player: number, view: FogView): void;
/**
 * The same fog as an RGB image one pixel per tile for the minimap: the tint where
 * fogged, white elsewhere, meant to be drawn with the `multiply` blend.
 */
export declare function fogImageData(scn: Scenario, tileset: number, player: number): ImageData;
