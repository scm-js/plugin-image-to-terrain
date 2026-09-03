/**
 * Scenario ▸ Map Properties ▸ Tileset: change the map's tileset (ERA). Tile ids mean
 * something different in every tileset — Badlands dirt is Jungle water is Ice nothing —
 * so the terrain cannot be carried across: the map is refilled with the new tileset's
 * chosen terrain, laid the way a new map is (`flatTerrain`, ISOM lattice included when the
 * map has one), and the doodads go with it, since a doodad is a set of the old tileset's
 * tiles. Units, sprites, locations, fog, triggers and settings stay where they are.
 * `keepTiles` leaves the tile numbers in place instead — what SCMDraft's tileset switch
 * does — for the author who wants to see what those numbers draw in the new tileset.
 *
 * Not an undoable edit: like Resize it is a transaction applied through
 * `changeTilesetAtom`, which drops the history and bumps every revision.
 */
import { type Scenario } from "../formats/chk/scenario";
import type { Tileset } from "../formats/tileset/decode";
import type { DoodadCatalogue } from "../formats/tileset/doodads";
import { type BaseTerrain } from "../formats/tileset/terrain";
export interface ChangeTilesetOptions {
    /** ERA index of the new tileset, 0..7. */
    era: number;
    /** Terrain the map is refilled with (ignored with `keepTiles`). */
    fill: BaseTerrain;
    /** The *new* tileset's graphics, when loaded; without them the fill uses the base ids. */
    tileset: Tileset | null;
    /** The *old* tileset's doodad catalogue, to find the overlay sprites the dropped doodads own. */
    doodads?: DoodadCatalogue | null;
    /** Keep the tile numbers and only change ERA. */
    keepTiles?: boolean;
    random?: () => number;
}
export interface ChangeTilesetResult {
    from: number;
    to: number;
    doodadsDropped: number;
    /** Overlay sprites that belonged to the dropped doodads. */
    spritesDropped: number;
    refilled: boolean;
}
export declare function changeTileset(scn: Scenario, options: ChangeTilesetOptions): ChangeTilesetResult;
