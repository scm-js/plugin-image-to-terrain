/**
 * Blizzard `.tbl` string tables (images.tbl, stat_txt.tbl, …): a u16 count, that many u16
 * offsets from the start of the file, and NUL-terminated latin1 strings at those offsets.
 */
export declare function decodeTbl(data: Uint8Array): string[];
