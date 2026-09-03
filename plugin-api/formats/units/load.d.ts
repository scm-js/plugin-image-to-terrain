import { LO_KINDS, type FlingyDat, type ImagesDat, type SpritesDat, type TechdataDat, type UnitsDat, type UpgradesDat, type WeaponsDat } from "../dat/dat";
import { type Grp } from "../dat/grp";
import { type IscriptBin } from "../dat/iscript";
import { type LoFile } from "../dat/lo";
/**
 * The unit data tables, fetched once from `arr/` + `game/` (mirroring the MPQ tree; see
 * `gamedata/extract.ts`) wherever the session's game data comes from (`gamedata/source.ts`).
 * GRPs, overlay `.lo` files and the tileset remap tables are fetched lazily as the viewport
 * first needs them, so opening a melee map only pulls minerals, geysers and start locations.
 */
export interface UnitAssets {
    units: UnitsDat;
    flingy: FlingyDat;
    sprites: SpritesDat;
    images: ImagesDat;
    /** images.tbl: GRP paths relative to `unit\`, as stored (backslashes, mixed case). */
    imagePaths: string[];
    /** tunit.pcx pixels: 16 rows × 8 palette indices. */
    teamColors: Uint8Array;
    /** The animation bytecode, or null when `scripts/iscript.bin` is not installed (units then stay still). */
    iscript: IscriptBin | null;
    /** weapons.dat, or null when an older extraction did not ship it (Unit Settings then shows no weapon defaults). */
    weapons: WeaponsDat | null;
    /** upgrades.dat / techdata.dat, or null likewise (Upgrade / Technology Settings then show defaults as 0). */
    upgrades: UpgradesDat | null;
    techs: TechdataDat | null;
}
export declare class UnitAssetsMissingError extends Error {
    constructor(cause?: unknown);
}
export declare function getUnitAssets(): Promise<UnitAssets>;
/** Already-loaded tables, for synchronous render paths. */
export declare function peekUnitAssets(): UnitAssets | null;
/** images.dat id of the unit type's main graphic. */
export declare function unitImageId(assets: UnitAssets, unitId: number): number;
/** URL path under `public/unit/` for an image's GRP, or null when the table has none. */
export declare function imageGrpPath(assets: UnitAssets, imageId: number): string | null;
/** URL path under `public/unit/` for one of an image's overlay `.lo` files, or null. */
export declare function imageLoPath(assets: UnitAssets, imageId: number, kind: (typeof LO_KINDS)[number]): string | null;
/** Called whenever a lazily fetched part (GRP, .lo, remap table) arrives or fails, so canvases can repaint. */
export declare function onGrpLoaded(listener: () => void): () => void;
/**
 * After the game data source changes (Help ▸ Game Data… installed a copy): forget every
 * part that failed so it is fetched again, and tell the canvases. The tables retry on
 * their own — `getUnitAssets` drops its promise when it fails.
 */
export declare function retryFailedParts(): void;
/** The decoded GRP for a path under `public/unit/`, per the LazyFiles contract. */
export declare function requestGrp(path: string): Grp | null | undefined;
/**
 * Wait for a set of lazily fetched GRPs. `requestGrp` starts the fetch and answers
 * `undefined` until it settles, so the arrival notification is the only signal there is.
 * Used by the startup preload and by image export, both of which want every graphic
 * present before they draw rather than markers where one has not arrived yet.
 */
export declare function awaitGrps(paths: readonly string[]): Promise<void>;
/** The decoded `.lo` file for a path under `public/unit/`. */
export declare function requestLo(path: string): LoFile | null | undefined;
/**
 * A tileset's colour remap table (`public/tileset/<name>.ofire.pcx` etc., from
 * scripts/extract-tilesets.mjs): 256 columns per source index. `remapping` is the
 * images.dat value; 0 has no table.
 */
export declare function requestRemap(tilesetName: string, remapping: number): Uint8Array | null | undefined;
