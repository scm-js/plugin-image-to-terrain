import { type TilesetAtlas } from "./atlas";
import { type Tileset } from "./decode";
import { type DoodadCatalogue } from "./doodads";
/** ERA index order, which is also the on-disk file basename in `tileset/`. */
export declare const TILESET_FILENAMES: readonly ["badlands", "platform", "install", "ashworld", "jungle", "desert", "ice", "twilight"];
export type TilesetFileName = (typeof TILESET_FILENAMES)[number];
export interface LoadedTileset {
    name: TilesetFileName;
    tileset: Tileset;
    atlas: TilesetAtlas;
    /** The doodads the CV5 holds, with their placement rules when `<name>.dddata.bin` was extracted. */
    doodads: DoodadCatalogue;
}
export declare class TilesetMissingError extends Error {
    readonly tileset: TilesetFileName;
    constructor(tileset: TilesetFileName, cause?: unknown);
}
export interface TilesetProgress {
    tileset: TilesetFileName;
    /** Bytes received so far, and the total announced by the parts fetched so far. */
    loaded: number;
    total: number;
}
/**
 * Watch tileset downloads. This is a module-level subscription rather than an argument to
 * `getTileset` because the loader shares one promise per tileset: whoever asks second
 * would otherwise get no progress at all, and the caller that wants to *show* progress
 * (the splash preload) is not reliably the caller that starts the load.
 */
export declare function onTilesetProgress(listener: (p: TilesetProgress) => void): () => void;
/** Fetch, decode and rasterise a tileset. Repeat calls share one in-flight promise. */
export declare function getTileset(name: TilesetFileName): Promise<LoadedTileset>;
export declare function peekTileset(name: TilesetFileName): LoadedTileset | null;
export declare function ensureTileset(name: TilesetFileName): Promise<LoadedTileset>;
/** Install an already-decoded tileset as if it had been fetched (tests, or a loader that read the files itself). */
export declare function primeTileset(loaded: LoadedTileset): void;
