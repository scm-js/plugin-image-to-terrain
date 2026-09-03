/**
 * Import / export of triggers and strings as files, the way SCMDraft trades them:
 *
 * - `.trg` is the raw TRIG record stream — one 2400-byte record per trigger, exactly the
 *   bytes of the section — so a file from SCMDraft's "Export triggers" reads here and ours
 *   reads there. The records carry string *indices*, so a .trg only makes sense between
 *   copies of the same map (or after the strings are imported too).
 * - Text triggers are the TrigEdit format (`formats/triggers/text.ts`), resolved through
 *   the open map's names; text the map cannot resolve fails with the line.
 * - Strings are one line per entry, `<index><TAB><text>`, with `\\`, `\n`, `\t` escaped
 *   and every other control character (the game's colour codes) written as `<XX>` hex;
 *   a literal `<` is written `\<`. Importing sets the given indices in place and appends
 *   past the end — never renumbers, since triggers and locations hold the indices.
 */
import { type Scenario } from "../formats/chk/scenario";
import { type StringTable } from "../formats/chk/sections/strings";
import { type TriggerRecord } from "../formats/chk/sections/triggers";
export declare function encodeTrg(triggers: TriggerRecord[]): Uint8Array;
/** Read a .trg; throws when the length is not a whole number of records. */
export declare function decodeTrg(bytes: Uint8Array): TriggerRecord[];
export declare function triggersToText(scn: Scenario, triggers: TriggerRecord[], briefing?: boolean): string;
/** Parse TrigEdit text against the map's names; throws `TriggerTextError` with the line. */
export declare function triggersFromText(scn: Scenario, text: string, briefing?: boolean): TriggerRecord[];
export type TriggerFileFormat = "trg" | "txt";
/** The format a file name implies: `.trg` is binary, anything else text. */
export declare function triggerFormatOf(fileName: string): TriggerFileFormat;
/** Read either kind of trigger file. */
export declare function readTriggerFile(scn: Scenario, fileName: string, bytes: Uint8Array, briefing?: boolean): TriggerRecord[];
export declare function escapeStringText(text: string): string;
export declare function unescapeStringText(text: string): string;
/** The whole table as text; unset slots are skipped. */
export declare function formatStringTable(table: StringTable): string;
export interface StringImport {
    entries: {
        index: number;
        text: string;
    }[];
    /** Lines that were not `N<TAB>text`, with their 1-based line numbers. */
    errors: {
        line: number;
        message: string;
    }[];
}
/** Parse the text format; blank lines and `#` / `//` comments are ignored. */
export declare function parseStringTable(text: string): StringImport;
/**
 * Write imported entries into the table: existing indices are replaced in place, an index
 * past the end appends (filling any gap with unset slots so the numbers stay as written).
 */
export declare function applyStringImport(scn: Scenario, entries: readonly {
    index: number;
    text: string;
}[]): {
    replaced: number;
    added: number;
};
