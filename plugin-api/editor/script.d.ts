/**
 * The trigger script as part of the map: its source and build manifest live as extra
 * archive members (`archiveExtrasAtom`), and the triggers it generated are a contiguous
 * *block* of `scenario.triggers` that the manifest points at.
 *
 * The block is identified by content, not just position: the manifest records the
 * block's start, length and a hash of its encoded records. `scriptBlock` looks for the
 * records at the recorded start and, failing that, anywhere in the list — so a hand
 * trigger inserted before the block in the Classic editor moves the block without
 * breaking it (`relocateScriptBlock` then rewrites the manifest). Only an edit *inside*
 * the block makes it stale, in which case the next Build appends a fresh block and the
 * old records are left as ordinary hand triggers.
 *
 * Building replaces the block wholesale and interns the script's strings; nothing here
 * is in the undo model (a Build is a settings-style transaction).
 */
import type { Scenario } from "../formats/chk/scenario";
import { type TriggerRecord } from "../formats/chk/sections/triggers";
import type { CompileOptions, CompileResult } from "../script/compiler";
export declare const SCRIPT_MEMBER = "scmjs\\triggers.ts";
export declare const MANIFEST_MEMBER = "scmjs\\triggers.json";
export interface ScriptManifest {
    version: 1;
    /** Index of the first generated trigger. */
    start: number;
    count: number;
    /** `hashTriggers` of the generated records. */
    hash: string;
    /** Per generated trigger, the 1-based source line of its `trigger(` call. */
    lines: number[];
    /** `hashText` of the source the block was built from; absent in older manifests. */
    sourceHash?: string;
}
export interface ScriptBlock {
    start: number;
    count: number;
    lines: number[];
}
export declare function readScript(extras: Map<string, Uint8Array>): string | null;
export declare function withScript(extras: Map<string, Uint8Array>, source: string | null): Map<string, Uint8Array>;
export declare function readManifest(extras: Map<string, Uint8Array>): ScriptManifest | null;
export declare function withManifest(extras: Map<string, Uint8Array>, manifest: ScriptManifest | null): Map<string, Uint8Array>;
/** FNV-1a over the encoded records, prefixed with the count. */
export declare function hashTriggers(list: TriggerRecord[]): string;
export declare function hashText(text: string): string;
/** Where the manifest's block actually is in the list, or null when its records are gone. */
export declare function findBlock(list: TriggerRecord[], manifest: ScriptManifest): ScriptBlock | null;
export interface ScriptState {
    source: string | null;
    manifest: ScriptManifest | null;
    /** The generated block, when the manifest's records are still in the list. */
    block: ScriptBlock | null;
    /** A manifest exists but its records were edited or removed. */
    stale: boolean;
    /** The source differs from what the block was built from (or was never built). */
    unbuilt: boolean;
}
export declare function scriptState(scn: Scenario | null, extras: Map<string, Uint8Array>): ScriptState;
export declare function isGenerated(state: ScriptState, index: number): boolean;
/** After another editor rewrote the list: point the manifest at where the block went. Null when nothing changed. */
export declare function relocateScriptBlock(scn: Scenario, extras: Map<string, Uint8Array>): Map<string, Uint8Array> | null;
/**
 * The death counters and switches the map's hand triggers (those outside the script's
 * block) and its switch names already use, so the structured program's variables are
 * allocated around them. The previous block's own records are not counted: a rebuild
 * replaces them.
 */
export declare function reservedStorage(scn: Scenario, block: ScriptBlock | null): CompileOptions;
/** The compiled records with their local string ids resolved against the scenario's string table. */
export declare function resolveStrings(scn: Scenario, compiled: CompileResult): TriggerRecord[];
export interface BuildOptions {
    /** Replace the *whole* list with the script's triggers (ejecting every hand trigger into the block). */
    takeOver?: boolean;
}
/**
 * Install a successful compile: replace the current block (or append one) and write the
 * source and manifest. Returns the new extras and where the block landed.
 */
export declare function buildScript(scn: Scenario, extras: Map<string, Uint8Array>, source: string, compiled: CompileResult, options?: BuildOptions): {
    extras: Map<string, Uint8Array>;
    block: ScriptBlock;
};
/** Which trigger a source line belongs to (the trigger whose call starts at or before the line), if any. */
export declare function triggerAtLine(block: ScriptBlock, line: number): number | null;
