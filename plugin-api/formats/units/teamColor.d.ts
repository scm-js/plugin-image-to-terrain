/**
 * Team colours. Unit GRPs paint their coloured parts with palette indices 8–15; the game
 * replaces those eight slots per player from `game\tunit.pcx`, a 128×1 image whose pixels
 * are palette indices: row `c` (bytes c*8 … c*8+7) is the ramp for colour `c`.
 * The ramp indexes the *tileset* palette, so a red marine is the same red on every map.
 *
 * The file only has sixteen rows. The editor's colour table goes further (Remastered's
 * Pink … Black, ids 16+) and a CRGB slot can be any RGB at all, so a colour with no row
 * gets a ramp *synthesised* from its RGB (`synthesizeRamp`): the table's average
 * bright-to-dark profile applied to the target, in true colour. The 8-bit tileset palettes
 * have no pink (or lime, or navy) to snap to, so the renderer draws such a ramp by
 * overriding palette slots 8–15 rather than through the index remap — an approximation of
 * what Remastered shows, but the swatches and the sprites agree.
 */
export declare const TEAM_COLOR_ROWS = 16;
export declare const TEAM_SLOT_FIRST = 8;
export declare const TEAM_SLOT_COUNT = 8;
export type Rgb = readonly [number, number, number];
/**
 * How to colour a player's units: a `tunit.pcx` row (0 … 15), or an RGB the renderer
 * builds a ramp for. `data/players.ts#playerTeamColor` turns COLR/CRGB into one of these.
 */
export type TeamColorSpec = {
    row: number;
} | {
    rgb: Rgb;
};
/** A short, stable cache key for a spec (`r3`, `c255,196,228`). */
export declare function teamColorKey(spec: TeamColorSpec): string;
/**
 * The game's shading profile for a team colour: each step's luminance as a fraction of
 * the brightest, averaged over the sixteen `tunit.pcx` rows through the Jungle palette
 * (red alone is steeper — 1, .74, .74, .56, .38, .28, .21, .06 — the pale colours gentler).
 */
export declare const SHADE_PROFILE: readonly number[];
/** The eight palette indices of `tunit.pcx` row `row` (clamped into the table). */
export declare function tunitRamp(teamColors: Uint8Array, row: number): Uint8Array;
/** A 256-entry palette-index remap that swaps in the eight-index `ramp` from the table. */
export declare function teamColorLut(ramp: Uint8Array): Uint8Array;
/** Eight RGB triples (24 bytes, bright → dark) for a colour the table has no row for. */
export declare function synthesizeRamp(rgb: Rgb): Uint8Array;
/**
 * A copy of `palette` (256 RGBA entries) with slots 8–15 replaced by the synthesised
 * ramp for `rgb` — what a GRP draws through, with no index remap, to come out in a colour
 * the palette itself does not have.
 */
export declare function teamColorPalette(palette: Uint8Array, rgb: Rgb): Uint8Array;
