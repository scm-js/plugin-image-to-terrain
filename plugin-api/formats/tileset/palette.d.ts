/**
 * What the terrain palettes are built from: the tileset's terrain types (for the Rect
 * brush) and a catalogue of every CV5 tile group (for the Subtile and Index brushes).
 *
 * A CV5 group is 16 megatile slots. Groups 2..~27 come in flat left/right pairs whose
 * `index` is the ISOM terrain id; the groups after them are the cliff and edge pieces
 * the ISOM brush stitches between terrains; groups with index 1 are doodads; and
 * index 0 marks slots the tileset does not use (a few still hold real graphics).
 */
import type { TerrainName } from "../../data/tilesets";
import { type Tileset } from "./decode";
export interface TerrainType extends TerrainName {
    /** Even CV5 group of the flat pair; odd columns use `group + 1`. */
    group: number;
    height: 0 | 1 | 2;
    buildable: boolean;
}
/** A flat ground pair: two consecutive groups sharing an index, each with all four edges equal. */
export declare function isFlatPair(tileset: Tileset, group: number): boolean;
/**
 * The tileset's terrain types in palette order. Names come from the reference table;
 * everything else is read off the CV5. A name whose pair is missing from the graphics
 * is dropped rather than shown as something that cannot be painted.
 */
export declare function terrainTypes(tileset: Tileset | null, names: readonly TerrainName[]): TerrainType[];
export type GroupKind = "terrain" | "edge" | "doodad" | "other";
export interface TileGroupInfo {
    group: number;
    kind: GroupKind;
    /** CV5 index: the ISOM terrain id for flat pairs, an edge-set id otherwise. */
    index: number;
    label: string;
    /** Slots that hold a real megatile, in slot order. */
    slots: number[];
}
/** Every group with at least one drawable megatile, in group order. */
export declare function tileGroups(tileset: Tileset, names: readonly TerrainName[]): TileGroupInfo[];
export interface TileInfo {
    id: number;
    group: number;
    slot: number;
    /** VX4 megatile, or -1 when the id points at nothing drawable. */
    megatile: number;
    kind: GroupKind;
    label: string;
    height: 0 | 1 | 2;
    buildable: boolean;
    /** Walkable minitiles out of 16, from VF4. */
    walkable: number;
}
export declare function heightLabel(height: 0 | 1 | 2): string;
/** Everything the properties panel shows about one MTXM id. */
export declare function tileInfo(tileset: Tileset, names: readonly TerrainName[], id: number): TileInfo;
/** `0x1234`-style hex for a tile id, the way other editors print them. */
export declare function hexTile(id: number): string;
