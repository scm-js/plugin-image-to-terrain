/**
 * STR/STRx string table.
 *
 * Index 0 means "no string" and is never stored. Indices are referenced from TRIG,
 * MRGN, SPRP and friends — several of which we round-trip as raw bytes — so the table
 * must keep its index space stable across a save. Entries are therefore addressed by
 * position, never renumbered.
 */
export interface StringTable {
    /** `strings[i]` is string index `i`; slot 0 is always null. */
    strings: (string | null)[];
    /** True when the source section was STRx (Remastered, 32-bit count and offsets). */
    extended: boolean;
}
export declare function decodeStrings(data: Uint8Array, extended: boolean): StringTable;
export declare function encodeStrings(table: StringTable): Uint8Array;
/** Read a string by index, with 0 / out-of-range meaning "none". */
export declare function getString(table: StringTable, index: number): string | null;
/** Set the text at an existing index, or append a new one and return its index. */
export declare function setString(table: StringTable, index: number, text: string): number;
/** The lowest index holding exactly `text`, or -1 — StarEdit recycles identical strings rather than storing them twice. */
export declare function findString(table: StringTable, text: string): number;
