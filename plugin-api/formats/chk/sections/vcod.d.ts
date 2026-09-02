/**
 * VCOD: the verification table StarCraft checks a scenario against on load — 256 u32 seeds
 * and 16 opcode bytes. StarEdit writes the same fixed table into every map it creates
 * (both Blizzard maps in `fixtures/` carry it byte for byte), so a new scenario gets that
 * one; a map without a VCOD the game recognises does not load.
 */
export declare const VCOD_SIZE = 1040;
/** StarEdit's verification table, freshly copied. */
export declare function defaultVcod(): Uint8Array;
