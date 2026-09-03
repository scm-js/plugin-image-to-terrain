/**
 * Fog of war edits as invertible change lists over the MASK section.
 *
 * MASK is one byte per tile; bit n set means the tile starts the game *unexplored* for
 * player n+1 (black), clear means explored (the player sees the terrain, darkened, until
 * a unit gives vision). StarEdit writes 0xFF everywhere and a map without the section
 * behaves the same, so "no MASK" reads as fully fogged and the first edit creates a
 * 0xFF-filled section (`ensureMask`) for the caller to record in the undo history.
 *
 * The brushes here are the fog counterparts of `editor/terrain.ts`: they compute
 * `TileChange`s (flat index, before, after byte) without touching the scenario, and
 * `applyFogChanges` applies or reverts a list and marks MASK dirty.
 */
import { type Scenario } from "../formats/chk/scenario";
import { type TileChange } from "./terrain";
/** MASK carries fog for the eight playable slots only. */
export declare const FOG_PLAYERS = 8;
export declare const ALL_FOG_PLAYERS = 255;
export type FogMode = "fog" | "clear";
export declare function playerBit(player: number): number;
/** The section's default: every tile unexplored for every player. */
export declare function defaultMask(width: number, height: number): Uint8Array;
/**
 * The scenario's mask, creating the default one when the file had no MASK. Returns
 * the new array when one was created (record it as `createdMask` in the history
 * entry so undo removes the section again), else null.
 */
export declare function ensureMask(scn: Scenario): Uint8Array | null;
/** Whether tile `at` starts fogged for `player`; a missing section means yes. */
export declare function isFogged(scn: Scenario, at: number, player: number): boolean;
/** The byte a tile ends up with after painting `players` in `mode`. */
export declare function fogByte(before: number, players: number, mode: FogMode): number;
/** Set or clear the `players` bits over a set of tiles. Needs a mask (see `ensureMask`). */
export declare function paintFog(scn: Scenario, indices: Iterable<number>, players: number, mode: FogMode): TileChange[];
/** Fog or clear the whole map for `players`. */
export declare function fillFog(scn: Scenario, players: number, mode: FogMode): TileChange[];
/** Swap fogged and explored everywhere for `players`. */
export declare function invertFog(scn: Scenario, players: number): TileChange[];
/** Give every player in `to` (a bit mask) exactly player `from`'s fog. */
export declare function copyFog(scn: Scenario, from: number, to: number): TileChange[];
/**
 * The 4-connected area around (x, y) with the same fog state as that tile for
 * `player` — what a fill on the fog layer covers.
 */
export declare function floodFog(scn: Scenario, x: number, y: number, player: number): Set<number>;
/** Apply a fog change list, or take it back. */
export declare function applyFogChanges(scn: Scenario, changes: readonly TileChange[], direction?: "do" | "undo"): void;
/** How many tiles start fogged for `player`. */
export declare function fogCount(scn: Scenario, player: number): number;
/** The players that have fog on tile (x, y), as a bit mask — the fog layer's eyedropper. */
export declare function fogPlayersAt(scn: Scenario, x: number, y: number): number;
