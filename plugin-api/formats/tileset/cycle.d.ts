/**
 * Palette colour cycling — how StarCraft animates water and lava.
 *
 * Tileset graphics are 8-bit indexed. The game never swaps tiles to animate water:
 * instead a few short bands of the WPE palette are rotated one entry to the right every
 * few ticks, and every pixel that references one of those indices moves with them. Which
 * bands rotate depends on the tileset; Platform and Installation have none.
 *
 * Band tables are from Chkdraft's colour-cycler data (Justin Forsberg, MIT), which
 * mirrors the game's own rotator structs: each rotator counts down 8 ticks between
 * rotations. Upstream: https://github.com/TheNitesWhoSay/Chkdraft
 * Full provenance and license notice: ../../../ATTRIBUTION.md
 *
 * Timing: Chkdraft ticks those counters on a ~15.6 ms wall clock, which runs visibly
 * faster than the game. In StarCraft the water slows down with the game-speed setting,
 * so the counter is stepped per game frame; this uses the "Fastest" frame (42 ms).
 */
import type { Tileset } from "./decode";
/** One rotating run of palette entries, `min..max` inclusive. */
export interface PaletteBand {
    min: number;
    max: number;
}
/** Cycling bands per tileset, in ERA order (badlands, platform, install, ashworld, jungle, desert, ice, twilight). */
export declare const CYCLE_BANDS: readonly (readonly PaletteBand[])[];
/** One game frame on the "Fastest" speed setting. */
export declare const GAME_FRAME_MS = 42;
/** Game frames between two rotations of every band (the rotators' countdown). */
export declare const CYCLE_FRAMES = 8;
/** Wall-clock time between two rotations of every band. */
export declare const CYCLE_STEP_MS: number;
export declare function cycleBands(tilesetIndex: number): readonly PaletteBand[];
/** Rotations until every band is back where it started (1 when nothing cycles). */
export declare function cycleLength(bands: readonly PaletteBand[]): number;
/** Which rotation the wall clock is on right now. */
export declare function cycleStepAt(nowMs: number, length: number): number;
/**
 * The palette after `step` rotations: every band has moved `step` entries to the right,
 * wrapping within itself. Entries outside the bands are copied through unchanged.
 */
export declare function cyclePalette(base: Uint8Array, bands: readonly PaletteBand[], step: number, out?: Uint8Array): Uint8Array;
/** Megatile indices (ascending) that reference at least one cycling palette entry. */
export declare function cyclingMegatiles(tileset: Tileset, bands: readonly PaletteBand[]): Uint32Array;
