/**
 * Save options: what File ▸ Save As offers before a file is written, and the pure functions
 * behind the dialog's preview and the write itself.
 *
 * Saving has three layers, and the options touch all of them:
 * - the CHK sections `serializeScenario` produces (`currentChk`), which can be thinned —
 *   editor-only sections the game never reads, sections the format reference does not
 *   know, repeated sections collapsed to what the game acts on, bytes after the last
 *   section;
 * - the archive around it (`mpq/scm.ts#saveMap`): compression method, StarEdit-style
 *   encryption, which of the other members ride along;
 * - the file name and extension.
 *
 * `planSave` is the whole decision as data — every section with its fate and every extra
 * member with a tick — so the dialog shows what will be written before it is; `buildChk`
 * and `buildMapFile` turn the same options into bytes. Nothing here touches the store or
 * the scenario: stripping a section from the *file* leaves the open document as it is,
 * which is the point of a "smallest that plays" save that is not the working copy.
 */
import { type ChkFile } from "../formats/chk/reader";
import type { Scenario } from "../formats/chk/scenario";
import { type ArchiveCompression, type MemberInfo } from "../formats/mpq/scm";
/**
 * The archive members the Trigger Script plugin keeps its source and build manifest in
 * (`scmjs\triggers.ts`, `scmjs\triggers.json`, next to `staredit\scenario.chk`). The
 * editor never reads them; it knows the names so the Save dialog can say what leaving
 * them out means.
 */
export declare const SCRIPT_MEMBER = "scmjs\\triggers.ts";
export declare const MANIFEST_MEMBER = "scmjs\\triggers.json";
export type MapFormat = "scx" | "scm" | "chk";
export interface SaveOptions {
    format: MapFormat;
    /** How every archive member is compressed; ignored for a bare .chk. */
    compression: ArchiveCompression;
    /** Encrypt the members as StarEdit does. Every StarCraft build reads it. */
    encrypt: boolean;
    /** Archive members left out of the file, by name. */
    omitExtras: string[];
    /** Leave out ISOM, TILE and DD2: the terrain-editing data the game never reads. */
    stripTerrainEditing: boolean;
    /** Leave out IVER, IVE2, IOWN, UPUS, SWNM and WAV: editor bookkeeping the game never reads. */
    stripBookkeeping: boolean;
    /** Leave out sections whose names the format reference does not know. */
    stripUnknown: boolean;
    /** Collapse a section that occurs more than once into the bytes the game would act on. */
    mergeRepeats: boolean;
    /** Drop bytes after the last section header the file could parse. */
    dropTrailing: boolean;
}
/** The sections `stripTerrainEditing` removes. */
export declare const TERRAIN_EDITING_SECTIONS: readonly string[];
/** The sections `stripBookkeeping` removes. */
export declare const BOOKKEEPING_SECTIONS: readonly string[];
/** Everything kept, no compression: the file as the editor has always written it. */
export declare const DEFAULT_SAVE_OPTIONS: SaveOptions;
/** The extension of a file name, as a format, when it is one the editor writes. */
export declare function formatOf(fileName: string | null | undefined): MapFormat | null;
/**
 * What Save As starts from: the file's own extension (else `.scm` below the Brood War
 * revision, as StarEdit names them), and the archive stored the way it was opened — a map
 * that came in PKWARE-compressed and encrypted, Blizzard's own layout, goes out the same
 * way. A new map, or one opened from a bare .chk, gets StarEdit's layout too, since it is
 * what every build of the game reads.
 */
export declare function defaultSaveOptions(scn: Scenario, origin: MemberInfo | null, fileName: string | null): SaveOptions;
/** Two ready-made settings the dialog offers as buttons. */
export declare const SAVE_PRESETS: {
    /** Every section and member kept; compression as it is. */
    readonly everything: (o: SaveOptions) => SaveOptions;
    /** The smallest file that plays the same: StarEdit's compression, editor data left out. */
    readonly smallest: (o: SaveOptions) => SaveOptions;
};
export type SectionFate = "kept" | "dropped" | "merged";
/** One occurrence of a section in the output, with what the options do to it. */
export interface PlannedSection {
    /** Position in `currentChk`'s section list. */
    index: number;
    name: string;
    /** The registry's description, or null for a name it does not know. */
    what: string | null;
    size: number;
    fate: SectionFate;
    /** Why it is dropped or merged, in words. */
    reason?: string;
    /** Whether the editor has unsaved changes it encodes into this section. */
    dirty: boolean;
    editorOnly: boolean;
}
export type ExtraKind = "sound" | "script" | "file";
export interface PlannedExtra {
    name: string;
    size: number;
    kind: ExtraKind;
    kept: boolean;
}
export interface SavePlan {
    /** The CHK as it will be written. */
    file: ChkFile;
    sections: PlannedSection[];
    extras: PlannedExtra[];
    /** Bytes of the CHK before and after the options. */
    chkSizeBefore: number;
    chkSize: number;
    /** Counts the dialog shows next to its ticks — what each option would act on, whether or not it is on. */
    counts: {
        unknown: number;
        repeated: number;
        trailing: number;
        terrainEditing: number;
        bookkeeping: number;
    };
    /** Consequences worth reading before pressing Save. */
    warnings: string[];
}
/** What an archive member is, from its path. */
export declare function extraKind(name: string): ExtraKind;
/**
 * Decide every section's and member's fate under `options`, without writing anything.
 * The section list is `currentChk` — the bytes Save would emit with dirty sections
 * re-encoded — so a section the editor is about to rewrite is judged on its new size.
 */
export declare function planSave(scn: Scenario, extras: Map<string, Uint8Array>, options: SaveOptions): SavePlan;
/** The scenario bytes the plan describes. */
export declare function buildChk(plan: SavePlan): Uint8Array;
/** The archive members the plan keeps. */
export declare function keptExtras(plan: SavePlan, extras: Map<string, Uint8Array>): Map<string, Uint8Array>;
/**
 * The whole file: the CHK alone for `.chk`, else the archive around it. zlib works best
 * with big sectors; PKWARE and uncompressed use StarEdit's 4 KB, the layout the game's own
 * maps carry.
 */
export declare function buildMapFile(scn: Scenario, extras: Map<string, Uint8Array>, options: SaveOptions, plan?: SavePlan): Promise<Uint8Array>;
/** The names the registry marks editor-only, for the tests that keep the two lists above in step with it. */
export declare function editorOnlySections(): string[];
/** Human-readable size. */
export declare function formatBytes(n: number): string;
