import { type PaletteBand } from "./cycle";
import { type Tileset } from "./decode";
/**
 * All of a tileset's megatiles rendered once into a single image, so the viewport can
 * draw terrain with one `drawImage` per visible tile instead of decoding minitiles on
 * every frame.
 */
export interface TilesetAtlas {
    image: CanvasImageSource;
    /** Megatiles per atlas row. */
    columns: number;
    tileSize: number;
    count: number;
    /** Packed 0xRRGGBB average of each megatile, for minimap and far-zoom drawing. */
    averages: Uint32Array;
    /** The cycling (water/lava) megatiles, or null when the tileset has none. */
    animation: AtlasAnimation | null;
}
/**
 * A second, small atlas holding only the megatiles that reference cycling palette
 * entries. It is re-rasterised with the rotated palette on every step, while the main
 * atlas stays at step 0; `atlasSource` picks the right one per megatile.
 */
export interface AtlasAnimation {
    image: HTMLCanvasElement;
    columns: number;
    /** Megatile → slot in this atlas, or -1 for megatiles that do not cycle. */
    slot: Int32Array;
    megatiles: Uint32Array;
    bands: readonly PaletteBand[];
    /** Steps until the cycle repeats. */
    length: number;
    /** The step the image currently shows. */
    step: number;
    pixels: ImageData;
    /** Scratch palette, rotated in place each step. */
    palette: Uint8Array;
}
export declare function buildAtlasImageData(tileset: Tileset): {
    pixels: Uint8ClampedArray<ArrayBuffer>;
    width: number;
    height: number;
    columns: number;
};
/** Mean colour of each megatile, read straight off the finished atlas. */
export declare function megatileAverages(pixels: Uint8ClampedArray, width: number, columns: number, count: number): Uint32Array;
/** Rasterise `megatiles` in slot order into a `columns`-wide RGBA buffer using `palette`. */
export declare function drawAnimationPixels(tileset: Tileset, megatiles: Uint32Array, palette: Uint8Array, columns: number, dest: Uint8ClampedArray | Uint8Array): void;
/**
 * Move the animated atlas to palette rotation `step`. Returns true when it changed and
 * anything drawn from it should be repainted.
 */
export declare function setAtlasStep(atlas: TilesetAtlas, tileset: Tileset, step: number): boolean;
export declare function buildAtlas(tileset: Tileset, bands?: readonly PaletteBand[]): Promise<TilesetAtlas>;
export interface AtlasSource {
    image: CanvasImageSource;
    sx: number;
    sy: number;
    /** True when the megatile comes from the animated atlas. */
    animated: boolean;
}
/** Image and source rectangle to blit one megatile from, at the atlas's current step. */
export declare function atlasSource(atlas: TilesetAtlas, megatile: number): AtlasSource;
