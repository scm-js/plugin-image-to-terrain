/**
 * The identifiers a script uses for the map's things. `scriptNames(scn)` reads the
 * scenario once into five tables — players, units, locations, switches, AI scripts — each
 * entry being a value and the keys it goes by: an identifier derived from the display
 * name (`TerranMarine`, `BeaconAlpha`) first, the display name itself second (usable as
 * `Units["Terran Marine"]`), then any custom name the map gives it. The declarations are
 * generated from these tables and the printer chooses the first key, so the two agree
 * by construction; keys are unique within a table (a duplicate name gets `_2`, `_3`).
 */
import type { Scenario } from "../formats/chk/scenario";
export interface NameEntry {
    value: number;
    /** All keys, the preferred identifier first. Unique within the table. */
    keys: string[];
}
export interface NameTable {
    /** The object the script reads the entries from (`Units`). */
    object: string;
    /** The branded type of its values (`UnitId`). */
    type: string;
    doc: string;
    entries: NameEntry[];
}
export interface ScriptNames {
    players: NameTable;
    units: NameTable;
    locations: NameTable;
    switches: NameTable;
    aiScripts: NameTable;
}
/** `Terran Siege Tank (Tank Mode)` → `TerranSiegeTankTankMode`; never empty, never starts with a digit. */
export declare function identifier(name: string): string;
export declare function playerEntries(forceNames?: (string | null)[]): NameEntry[];
export declare function unitEntries(customName?: (id: number) => string | null): NameEntry[];
export declare function aiScriptEntries(): NameEntry[];
/** Tables over fixed lists only — what a script sees with no map open, and what tests use. */
export declare function defaultScriptNames(): ScriptNames;
export declare function scriptNames(scn: Scenario): ScriptNames;
/** The entry for a value, if the table has one. */
export declare function entryFor(t: NameTable, value: number): NameEntry | undefined;
