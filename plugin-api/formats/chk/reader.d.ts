/**
 * CHK is a flat stream of chunks: 4-byte name, int32 length, then that many bytes.
 *
 * StarCraft applies chunks *sequentially into fixed-size buffers*, so a section that
 * appears twice is not "last one wins" — the later copy overwrites only as many bytes
 * as it carries. Protected maps lean on this constantly, so the reader keeps every
 * occurrence in file order and `layer()` reproduces the overwrite semantics.
 */
export interface ChkSection {
    /** 4-character chunk name, latin1. May contain junk in protected maps. */
    name: string;
    /** Byte offset of the chunk's *name* within the CHK. */
    offset: number;
    /** Length field as written, which may disagree with `data.length` when truncated. */
    declaredSize: number;
    data: Uint8Array;
    /** Set when the declared size ran past the end of the file. */
    truncated?: boolean;
}
export interface ChkFile {
    sections: ChkSection[];
    /** Bytes after the last parseable chunk header, if any. */
    trailing?: Uint8Array;
}
export declare function parseChk(bytes: Uint8Array): ChkFile;
export declare function serializeChk(file: ChkFile): Uint8Array;
export declare function sectionsNamed(file: ChkFile, name: string): ChkSection[];
/**
 * How the game combines repeated occurrences of a section. Which mode applies is a
 * per-section fact (see sections/registry.ts), not something the container can infer.
 */
export type CombineMode = 
/** Zeroed fixed buffer, each occurrence copied over the front in file order. */
"overlay"
/** Every occurrence's records are kept, in file order. */
 | "append"
/** Only the last occurrence is used. */
 | "last"
/** Only the first occurrence is used. */
 | "first";
/**
 * Collapse repeated occurrences of a section into the bytes the game would act on.
 * Returns null when the section is absent entirely.
 *
 * For "overlay", `size` gives the game's fixed buffer width; omitted, the buffer grows
 * to the longest occurrence.
 */
export declare function combine(file: ChkFile, name: string, mode: CombineMode, size?: number): Uint8Array | null;
