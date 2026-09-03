/**
 * `.lo?` overlay position files (`unit\terran\control.lof`, `neutral\geyser.los`, …):
 * where an image's overlays attach, per frame of the main graphic.
 *
 *   u32 frames, u32 overlays per frame, u32 offset[frames], then per frame
 *   `overlays` × (s8 x, s8 y). A slot of (127, 127) is unused.
 *
 * images.dat names one file per overlay kind (attack, damage, special, landing dust,
 * lift-off, shield); the editor uses the damage file for burning buildings and the
 * special file for geyser and refinery smoke.
 */
export interface LoFile {
    frames: number;
    overlays: number;
    /** `frames × overlays × 2` signed offsets, row-major. */
    offsets: Int8Array;
}
export declare const LO_UNUSED = 127;
export declare function decodeLo(data: Uint8Array): LoFile;
/** Offset of overlay slot `index` in `frame`, or null when the slot is unused. Frames past the end reuse the last one. */
export declare function loOffset(lo: LoFile, frame: number, index: number): {
    x: number;
    y: number;
} | null;
/** The slot indices of `frame` that are in use — not necessarily contiguous (the Missile Turret only fills slot 1). */
export declare function loUsedSlots(lo: LoFile, frame: number): number[];
