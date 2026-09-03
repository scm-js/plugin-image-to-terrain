/**
 * Tools ▸ Statistics: the map's contents counted up. Pure over the scenario plus whatever
 * game data happens to be loaded — the tileset for terrain by type, units.dat to tell
 * buildings from mobile units — and degrades to "n/a" without them.
 */
import { type Scenario } from "../formats/chk/scenario";
import { type UnitsDat } from "../formats/dat/dat";
import type { Tileset } from "../formats/tileset/decode";
import { type TerrainName } from "../data/tilesets";
export interface PlayerStatistics {
    slot: number;
    type: string;
    race: string;
    units: number;
    /** Null when units.dat is not loaded. */
    buildings: number | null;
    startLocations: number;
}
export interface MapStatistics {
    width: number;
    height: number;
    tileset: string;
    revision: string;
    sections: number;
    strings: {
        slots: number;
        set: number;
        extended: boolean;
    };
    players: PlayerStatistics[];
    /** Units whose owner byte is past the twelve slots. */
    unownedUnits: number;
    units: {
        total: number;
        buildings: number | null;
        top: {
            id: number;
            name: string;
            count: number;
        }[];
    };
    resources: {
        minerals: number;
        gas: number;
        fields: number;
        geysers: number;
    };
    doodads: number;
    sprites: {
        pure: number;
        unit: number;
    };
    locations: number;
    triggers: {
        count: number;
        conditions: number;
        actions: number;
        preserved: number;
        disabled: number;
    };
    /** MBRF: the briefing's records and the actions in them. */
    briefings: {
        count: number;
        actions: number;
    };
    switchesNamed: number;
    sounds: number;
    /** Tiles per terrain type ("Edges and cliffs" for the unnamed edge sets), most common first; null without the tileset graphics. */
    terrain: {
        name: string;
        tiles: number;
    }[] | null;
}
export declare function mapStatistics(scn: Scenario, tileset: Tileset | null, terrainNames: readonly TerrainName[] | null, dat: UnitsDat | null): MapStatistics;
/** The same numbers as plain text, for the clipboard. */
export declare function statisticsText(s: MapStatistics): string;
