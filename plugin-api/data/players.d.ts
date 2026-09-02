/** Player / force / colour reference data. */
export declare const PLAYER_COUNT = 12;
import { type PlayerRgb } from "../formats/chk/sections/players";
import { type TeamColorSpec } from "../formats/units/teamColor";
/** OWNR controller bytes as StarEdit's Player Settings lists them, with the rest for maps that use them. */
export declare const PLAYER_TYPES: {
    value: number;
    label: string;
    hint?: string;
}[];
/** SIDE race bytes, in StarEdit's order. */
export declare const PLAYER_RACES: {
    value: number;
    label: string;
}[];
export declare const playerTypeLabel: (v: number) => string;
export declare const playerRaceLabel: (v: number) => string;
export interface PlayerColor {
    id: number;
    name: string;
    hex: string;
}
/** The classic StarCraft player colour table (COLR indices). */
export declare const PLAYER_COLORS: PlayerColor[];
/**
 * The colour a player's units are drawn in: the map's COLR choice for the eight playable
 * slots, the fixed table entries for players 9–12. Out-of-range (Remastered custom)
 * indices fall back to the slot's default so nothing ever renders colourless.
 */
export declare function playerColorIndex(colors: readonly number[] | null | undefined, owner: number): number;
export declare function playerColorHex(colors: readonly number[] | null | undefined, owner: number): string;
export declare function rgbToHex(rgb: readonly [number, number, number]): string;
export declare function hexToRgb(hex: string): [number, number, number] | null;
/**
 * The colour a slot shows everywhere — swatches, markers and the sprites themselves: a
 * Remastered custom RGB when the slot is set to one, else its palette entry.
 */
export declare function displayColorHex(colors: readonly number[] | null | undefined, rgb: PlayerRgb | null | undefined, owner: number): string;
/**
 * What the sprite renderer paints a player's units with. The sixteen classic colours are
 * `tunit.pcx` rows; the later table entries (Pink … Black) and a custom RGB have no row,
 * so they go out as an RGB for the renderer to build a ramp from (`synthesizeRamp`).
 */
export declare function playerTeamColor(colors: readonly number[] | null | undefined, rgb: PlayerRgb | null | undefined, owner: number): TeamColorSpec;
/** Player groups selectable in triggers. */
export declare const TRIGGER_PLAYER_GROUPS: string[];
