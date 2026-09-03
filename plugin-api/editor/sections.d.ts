/**
 * The open map as the bytes Save would write, section by section, and raw edits to them.
 *
 * The scenario keeps the file it was read from (`Scenario.chk`) and re-encodes only the
 * dirty sections on save, so "the current bytes of a section" is not a field anywhere —
 * it is what `serializeScenario` would emit. `currentChk` runs that serialisation and
 * parses the result back into a `ChkFile`, which gives every occurrence in write order
 * with its offset; `sectionInfos` decorates those with what the registry knows.
 *
 * A raw edit (`editRaw`) goes the other way: mutate that `ChkFile`, serialise it and
 * parse a fresh `Scenario` from the bytes. The typed model is rebuilt from scratch, so an
 * edit to any section — modelled or not — is seen by every part of the editor, at the
 * cost of the undo history, which the caller drops the way Resize does. Nothing here
 * touches the store; `replaceScenarioAtom` installs the result.
 */
import { type ChkFile, type CombineMode } from "../formats/chk/reader";
import { type Scenario } from "../formats/chk/scenario";
import { type Dim } from "../formats/chk/sections/registry";
/** What the registry knows about a section name, sized for one map. */
export interface SectionKnowledge {
    name: string;
    /** "Placed units", "String table", … */
    what: string;
    /** How the game combines repeated occurrences. */
    mode: CombineMode;
    /** The fixed buffer the game reads the section into, for this map's size; null when the length varies. */
    size: number | null;
    /** The record length of a list section, or null. */
    stride: number | null;
    /** Whether the editor decodes the section into its model and re-encodes it on save. */
    modelled: boolean;
}
/** One occurrence of a section in the file, as Save would write it. */
export interface SectionInfo {
    /** Position in the file's section list — what the byte-level calls take. */
    index: number;
    /** The four characters as stored (`"VER "` keeps its space); junk in a protected map. */
    name: string;
    /** Byte offset of the eight-byte chunk header within the CHK. */
    offset: number;
    /** Payload length. */
    size: number;
    /** The length field as written; differs from `size` only when the file ended early. */
    declaredSize: number;
    truncated: boolean;
    /** Which occurrence of this name it is, 0-based, and how many the file has. */
    occurrence: number;
    occurrences: number;
    /** Whether the editor has unsaved changes it will encode into this section on save. */
    dirty: boolean;
    /** The registry entry, or null for a section the editor has never heard of. */
    spec: SectionKnowledge | null;
}
/** A section name is four characters; shorter ones are padded with spaces, as the game's own are. */
export declare function sectionName(name: string): string;
export declare function sectionKnowledge(name: string, dim: Dim): SectionKnowledge | null;
/** Every section the registry knows, in its order. */
export declare function knownSections(dim: Dim): SectionKnowledge[];
/** The file Save would write, parsed back so every section has its offset. */
export declare function currentChk(scn: Scenario): ChkFile;
export declare function sectionInfos(scn: Scenario, file?: ChkFile): SectionInfo[];
/** The bytes the game acts on for a name — repeats combined the way the registry says — or null when absent. */
export declare function combinedSection(scn: Scenario, name: string, file?: ChkFile): Uint8Array | null;
/** Replace one occurrence's payload. */
export declare function replaceSectionData(file: ChkFile, index: number, data: Uint8Array): void;
/** Rename one occurrence. */
export declare function renameSection(file: ChkFile, index: number, name: string): void;
/** Insert a section before `index` (`sections.length` appends). */
export declare function insertSection(file: ChkFile, index: number, name: string, data: Uint8Array): void;
export declare function removeSection(file: ChkFile, index: number): void;
/** Move the occurrence at `from` so it sits at `to` in the resulting list. */
export declare function moveSection(file: ChkFile, from: number, to: number): void;
/**
 * Apply `mutate` to the file Save would write and parse a fresh scenario from the result.
 * The returned scenario is a new object with an empty dirty set — every section it
 * carries is now the file's own bytes — and `warnings` says what the parser thought of it.
 */
export declare function editRaw(scn: Scenario, mutate: (file: ChkFile) => void): Scenario;
/** Parse a whole CHK the way File ▸ Open does, for a plugin that rewrote the file itself. */
export declare function parseRaw(bytes: Uint8Array): Scenario;
/**
 * The bytes File ▸ New writes for a section, for a map of this one's size, tileset and
 * revision: StarEdit's defaults for the settings tables, the fixed VCOD, empty lists,
 * null terrain. Null for a name the editor cannot produce (one it does not model, or a
 * modelled one that is optional and absent on a new map — CRGB, SWNM).
 */
export declare function defaultSectionBytes(scn: Scenario, name: string): Uint8Array | null;
/** What `rebuildSections` did: the parser's remarks and the sections actually re-encoded. */
export interface RebuildResult {
    warnings: string[];
    rebuilt: string[];
}
/**
 * Re-encode sections from the editor's model — the way Save writes a dirty section — and
 * parse the result as a fresh scenario. Repeated occurrences collapse into one, a
 * truncated or oversized section comes back at the size the model encodes to, and a string
 * table with offsets pointing nowhere is rewritten with every string the editor could read.
 * Names the editor does not model, and modelled ones whose model is absent (`isom` null,
 * no settings table), are left as they are and missing from `rebuilt`; omit `names` to
 * rebuild every modelled section the map has a model for.
 */
export declare function rebuildSections(scn: Scenario, names?: readonly string[]): {
    scenario: Scenario;
    result: RebuildResult;
};
/** The sections a file of this map's revision must carry to load, as Check Map tests them. */
export declare function requiredSectionNames(scn: Scenario): string[];
