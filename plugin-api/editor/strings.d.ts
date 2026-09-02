/**
 * The string table as the String Editor sees it: where every entry is referenced, which
 * ones nothing refers to, and how control bytes are shown.
 *
 * Indices are never renumbered (see the header of `sections/strings.ts`) — several
 * sections we round-trip as raw bytes may point into the table — so "deleting" a string
 * blanks its slot, and only unused slots at the very end are dropped.
 */
import { scenarioDescription, scenarioName, type Scenario } from "../formats/chk/scenario";
export type StringUsageKind = "name" | "description" | "force" | "location" | "unit" | "switch" | "trigger" | "briefing" | "wav";
export interface StringUsage {
    kind: StringUsageKind;
    /** What the kind indexes: force / slot / unit id / switch / trigger index / WAV slot; 0 for name and description. */
    ref: number;
    label: string;
}
/** Highest string index the game addresses: STR is a 16-bit table (StarEdit stops at 1024), STRx a 32-bit one. */
export declare function stringCapacity(scn: Scenario): number;
/** Every reference into the string table, by index. Index 0 ("none") is never listed. */
export declare function stringUsages(scn: Scenario): Map<number, StringUsage[]>;
/** Indices holding a string that nothing refers to. */
export declare function unusedStrings(scn: Scenario, usages?: Map<number, StringUsage[]>): number[];
export declare function escapeControls(text: string): string;
/** The inverse: `<XX>` with a hex value below 0x20 becomes that byte; any other text is left as typed. */
export declare function unescapeControls(text: string): string;
export declare function readStrings(scn: Scenario): (string | null)[];
/** Blank every entry nothing refers to (slots stay; see `applyStrings`). */
export declare function deleteUnused(list: (string | null)[], usages: Map<number, StringUsage[]>): (string | null)[];
/**
 * Install an edited copy of the table. Trailing blank slots nothing refers to are dropped;
 * every other index keeps its place. Marks STR / STRx dirty only when something differs.
 */
export declare function applyStrings(scn: Scenario, next: (string | null)[], usages?: Map<number, StringUsage[]>): boolean;
/** One-line preview of an entry for lists: control codes escaped, line breaks flattened. */
export declare function previewString(text: string | null): string;
export { scenarioName, scenarioDescription };
