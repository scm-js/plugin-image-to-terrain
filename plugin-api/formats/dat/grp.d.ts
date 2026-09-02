/**
 * GRP sprite sheets: palette-indexed, run-length encoded frames sharing one bounding box.
 *
 *   header      u16 frames, u16 width, u16 height
 *   frame table u8 x, u8 y, u8 width, u8 height, u32 offset       (8 bytes each)
 *   frame data  u16 lineOffset[height] (relative to the frame), then per line:
 *                 0x80|n  skip n transparent pixels
 *                 0x40|n  repeat the next byte n times
 *                 n       copy the next n bytes
 *
 * Palette index 0 is transparent. Indices 8–15 are the team colour slots the game remaps
 * per player (see `units/teamColor.ts`); a `lut` argument applies that remap here.
 */
export interface GrpFrame {
    /** Offset of the frame's pixels inside the shared box. */
    x: number;
    y: number;
    width: number;
    height: number;
    /** Byte offset of the frame's line table from the start of the file. */
    offset: number;
}
export interface Grp {
    width: number;
    height: number;
    frames: GrpFrame[];
    data: Uint8Array;
}
export declare function decodeGrp(data: Uint8Array): Grp;
/**
 * Paint one frame into an RGBA buffer `destWidth` pixels wide, with the frame box's
 * top-left corner at (dx, dy). `palette` is 256 RGBA entries; `lut` optionally remaps
 * palette indices first. `flip` mirrors the frame inside the box, which is how the game
 * draws facings 17–31 from frames 15–1.
 */
export declare function drawGrpFrame(grp: Grp, frameIndex: number, dest: Uint8ClampedArray | Uint8Array, destWidth: number, dx: number, dy: number, palette: Uint8Array, lut?: Uint8Array | null, flip?: boolean): void;
/**
 * The frame that shows facing `direction` (0 = up, clockwise to 31) for a GRP whose
 * frames come in sets of 17: directions 0–16 are stored, 17–31 are the mirror of 15–1.
 */
export declare function facingFrame(direction: number): {
    frame: number;
    flip: boolean;
};
