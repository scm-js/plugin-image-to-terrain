import { type LoadedTileset } from "../formats/tileset/load";
export interface TilesetState {
    loaded: LoadedTileset | null;
    loading: boolean;
    /** Set when the tileset files are missing — the viewport falls back to flat colours. */
    error: Error | null;
}
/**
 * Fetch and rasterise the tileset the open map uses. Missing files are a normal state
 * (nobody has run scripts/extract-tilesets.mjs yet), not a crash.
 *
 * Assets are only ever returned for the tileset currently asked for: opening a map of a
 * different era while the old atlas was still in state painted the new map's tile ids
 * through the previous tileset's graphics, which looked like scrambled terrain.
 */
export declare function useTileset(): TilesetState;
