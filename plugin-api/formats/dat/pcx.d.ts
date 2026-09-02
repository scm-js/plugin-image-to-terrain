/**
 * Minimal PCX reader for the game's 8-bit, single-plane images (game\tunit.pcx and
 * friends). Pixels come back as palette indices; the trailing 256-colour palette is
 * returned too when present.
 */
export interface Pcx {
    width: number;
    height: number;
    /** `width * height` palette indices, row-major. */
    pixels: Uint8Array;
    /** 256 × RGB, or null when the file has no palette block. */
    palette: Uint8Array | null;
}
export declare function decodePcx(data: Uint8Array): Pcx;
