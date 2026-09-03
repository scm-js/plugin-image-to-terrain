/**
 * The Sound Editor's view of a map's sounds: the WAV table (`scn.wavs`, 512 string indices
 * of archive paths) joined with the archive members that actually hold the bytes
 * (`archiveExtrasAtom`). Play WAV / Transmission actions store the *string index*, so a
 * sound is "used" when a trigger's `wav` field equals its string.
 */
import { type Scenario } from "../formats/chk/scenario";
export type Extras = ReadonlyMap<string, Uint8Array>;
export interface SoundRow {
    slot: number;
    stringIndex: number;
    /** The path as the string table has it. */
    path: string;
    /** Whether the archive carries a member at that path. */
    present: boolean;
    /** Bytes in the archive, 0 when absent. */
    size: number;
    /** The archive member's name as stored (case may differ from the path). */
    member: string | null;
    usedBy: string[];
}
/** Archive member names compare case-insensitively with either slash. */
export declare function normalizeMember(name: string): string;
/** The stored key of the member at `path`, or null. */
export declare function findMember(extras: Extras, path: string): string | null;
/** Where StarEdit keeps imported sounds. */
export declare function wavMemberName(fileName: string): string;
/** Labels of the trigger / briefing actions that play the string at `stringIndex`. */
export declare function wavUsage(scn: Scenario, stringIndex: number): string[];
export declare function readWavs(scn: Scenario): number[];
/** The table's filled slots, in slot order. */
export declare function soundList(scn: Scenario, extras: Extras, wavs?: readonly number[]): SoundRow[];
/** Archive members that look like sounds but are in no WAV slot. */
export declare function orphanSounds(scn: Scenario, extras: Extras, wavs?: readonly number[]): string[];
/** The slot holding `path` (by string, then by normalised text), or -1. */
export declare function slotOf(scn: Scenario, wavs: readonly number[], path: string): number;
/**
 * Put `path` in the first free slot (interning the string, which may append to the
 * table). Returns the slot, the existing one when the path is already listed, or -1
 * when all 512 are taken. `wavs` is edited in place.
 */
export declare function addSound(scn: Scenario, wavs: number[], path: string): number;
/** A copy of the table with `slot` cleared. */
export declare function removeSound(wavs: readonly number[], slot: number): number[];
/** Install an edited table, creating the section when the file had none. Marks WAV dirty only on a change. */
export declare function applySounds(scn: Scenario, wavs: readonly number[]): boolean;
/** Total bytes of the archive's sound members. */
export declare function soundBytes(extras: Extras): number;
