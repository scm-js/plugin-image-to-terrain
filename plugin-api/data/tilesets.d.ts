/** StarCraft tileset reference data. */
export type TilesetId = "badlands" | "platform" | "install" | "ashworld" | "jungle" | "desert" | "ice" | "twilight";
/**
 * One ISOM terrain type: its id is the CV5 `index` of the flat left/right group pair
 * that draws it, and the value the ISOM section stores for it.
 */
export interface TerrainName {
    id: number;
    name: string;
}
export interface TilesetInfo {
    id: TilesetId;
    name: string;
    /** Representative ground colour used for placeholder rendering. */
    color: string;
    /** Slightly darker accent used for grid / minimap. */
    accent: string;
    /**
     * The tileset's terrain types, in the order StarEdit's palette lists them. Ids are
     * not in palette order (Badlands numbers High Dirt 3 and Mud 4, and shows Mud first).
     */
    terrain: TerrainName[];
    /** ISOM id of the terrain a brand new map is filled with. */
    defaultIsom: number;
}
export declare const TILESETS: TilesetInfo[];
export declare const TILESET_BY_ID: Record<TilesetId, TilesetInfo>;
/** Display name of an ISOM terrain id, or a generic label for ids the palette does not list. */
export declare function terrainName(info: TilesetInfo, id: number): string;
export declare const MAP_SIZES: readonly [64, 96, 128, 192, 256];
