import type { TilesetId } from "../data/tilesets";
import type { MapVersion } from "../formats/chk/scenario";
import { type PlacementOptions } from "../editor/placement";
import { type DoodadPlacementOptions } from "../editor/doodads";
import type { FogMode } from "../editor/fog";
import type { SpriteKind } from "../editor/sprites";
import type { SymmetryMode } from "../editor/symmetry";
import { type Clip, type ClipParts, type PasteMode } from "../editor/clipboard";
import type { Rect } from "../editor/terrain";
export type EditorScreen = "splash" | "editor";
export declare const screenAtom: import("jotai").PrimitiveAtom<EditorScreen> & {
    init: EditorScreen;
};
export type EditorLayer = "terrain" | "doodads" | "units" | "sprites" | "locations" | "fog" | "clipboard";
export declare const activeLayerAtom: import("jotai").PrimitiveAtom<EditorLayer> & {
    init: EditorLayer;
};
/** Terrain sub-mode inside the Terrain palette. */
export type TerrainMode = "isom" | "rect" | "tile" | "blend";
export declare const TERRAIN_MODES: readonly TerrainMode[];
export declare const terrainModeAtom: import("jotai").PrimitiveAtom<TerrainMode> & {
    init: TerrainMode;
};
export declare const brushSizeAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** ISOM terrain id the Isometric and Rect brushes paint. See data/tilesets.ts. */
export declare const activeTerrainAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Variation slot the Rect brush uses for every pair, or -1 for StarEdit's random pick. */
export declare const rectVariationAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Raw MTXM tile id the Tile brush paints. */
export declare const activeTileAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Map cell the Blend brush is matching against (see editor/blend.ts), or null before one is picked. */
export declare const blendAnchorAtom: import("jotai").PrimitiveAtom<{
    x: number;
    y: number;
} | null> & {
    init: {
        x: number;
        y: number;
    } | null;
};
/** Whether placing a blend candidate moves the anchor onto the tile it just placed. */
export declare const blendFollowAtom: import("jotai").PrimitiveAtom<boolean> & {
    init: boolean;
};
/** units.dat id the Units layer places. */
export declare const activeUnitAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
export declare const unitOwnerAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Indices into `scenario.units` of the selected units; cleared whenever the list is edited under it. */
export declare const selectedUnitsAtom: import("jotai").PrimitiveAtom<number[]> & {
    init: number[];
};
/**
 * Whether a click on empty ground places `activeUnitAtom`. Picking a unit in the palette
 * arms it; Escape or a right-click disarms it, leaving plain select mode.
 */
export declare const unitPlacingAtom: import("jotai").PrimitiveAtom<boolean> & {
    init: boolean;
};
/** The Units layer's placement checks (see editor/placement.ts). */
export declare const placementOptionsAtom: import("jotai").PrimitiveAtom<PlacementOptions> & {
    init: PlacementOptions;
};
/** dddata index of the doodad the palette has picked, or -1 before anything was picked. */
export declare const activeDoodadAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Palette category the doodad grid shows; "" = the tileset's first. */
export declare const doodadCategoryAtom: import("jotai").PrimitiveAtom<string> & {
    init: string;
};
/** Whether a click on the map places `activeDoodadAtom` (armed by the palette, disarmed by Esc / right-click). */
export declare const doodadPlacingAtom: import("jotai").PrimitiveAtom<boolean> & {
    init: boolean;
};
/** Indices into `scenario.doodads` of the selected doodads; cleared whenever the list is edited under it. */
export declare const selectedDoodadsAtom: import("jotai").PrimitiveAtom<number[]> & {
    init: number[];
};
/** "Place anywhere" (off) and "Snap to grid" (on) — StarEdit's defaults. */
export declare const doodadPlacementAtom: import("jotai").PrimitiveAtom<DoodadPlacementOptions> & {
    init: DoodadPlacementOptions;
};
/** Whether the palette places a pure sprite (sprites.dat id) or a unit sprite (units.dat id). */
export declare const activeSpriteKindAtom: import("jotai").PrimitiveAtom<SpriteKind> & {
    init: SpriteKind;
};
/** sprites.dat id the Sprites layer places when the kind is "pure". */
export declare const activeSpriteAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** units.dat id it places when the kind is "unit"; doors and traps are what StarEdit uses this for. */
export declare const activeUnitSpriteAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Whether a click on the map places the active sprite (armed by the palette, disarmed by Esc / right-click). */
export declare const spritePlacingAtom: import("jotai").PrimitiveAtom<boolean> & {
    init: boolean;
};
/** Indices into `scenario.sprites` of the selected sprites; cleared whenever the list is edited under it. */
export declare const selectedSpritesAtom: import("jotai").PrimitiveAtom<number[]> & {
    init: number[];
};
/** Flags given to newly placed sprites: mirrored graphic, and (unit sprites only) starting disabled. */
export declare const spritePlaceOptionsAtom: import("jotai").PrimitiveAtom<{
    flipped: boolean;
    disabled: boolean;
}> & {
    init: {
        flipped: boolean;
        disabled: boolean;
    };
};
/**
 * MRGN slot indices of the selected locations. Slots never shift, so a selection survives
 * every edit; it is only pruned when a slot it names stops being in use. Anywhere (slot
 * 63) can be selected from the list to read it, but never picked up on the map.
 */
export declare const selectedLocationsAtom: import("jotai").PrimitiveAtom<number[]> & {
    init: number[];
};
/** Pixel grid a create, move or resize snaps to; 0 = off. StarEdit works in whole tiles. */
export declare const locationSnapAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
export declare const LOCATION_SNAPS: readonly number[];
/** Bit mask of the players (bit n = player n+1) the fog brush paints for. */
export declare const fogPlayersAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Whether the brush lays fog (unexplored) or clears it (explored). */
export declare const fogModeAtom: import("jotai").PrimitiveAtom<FogMode> & {
    init: FogMode;
};
/** Whose fog the viewport and minimap draw, 0–7 (shown while `viewFlags.fog` is on). */
export declare const fogViewPlayerAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** What the last Cut / Copy captured; survives the map it came from being closed. */
export declare const clipboardAtom: import("jotai").PrimitiveAtom<Clip | null> & {
    init: Clip | null;
};
/** The tile rectangle marked on the clipboard layer (exclusive x1 / y1), or null. */
export declare const clipSelectionAtom: import("jotai").PrimitiveAtom<Rect | null> & {
    init: Rect | null;
};
/** Which parts a copy captures and a paste writes. */
export declare const clipPartsAtom: import("jotai").PrimitiveAtom<ClipParts> & {
    init: ClipParts;
};
/** Whether a paste adds to the target area or clears its units, sprites and doodads first. */
export declare const clipPasteModeAtom: import("jotai").PrimitiveAtom<PasteMode> & {
    init: PasteMode;
};
/** Whether the clip follows the pointer waiting for a click to stamp it (Esc / right-click stops). */
export declare const clipPastingAtom: import("jotai").PrimitiveAtom<boolean> & {
    init: boolean;
};
export declare const mapNameAtom: import("jotai").PrimitiveAtom<string> & {
    init: string;
};
export declare const mapDescriptionAtom: import("jotai").PrimitiveAtom<string> & {
    init: string;
};
export declare const mapTilesetAtom: import("jotai").PrimitiveAtom<TilesetId> & {
    init: TilesetId;
};
export declare const mapWidthAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
export declare const mapHeightAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
export declare const mapModifiedAtom: import("jotai").PrimitiveAtom<boolean> & {
    init: boolean;
};
export declare const mapFilePathAtom: import("jotai").PrimitiveAtom<string | null> & {
    init: string | null;
};
export declare const mapVersionAtom: import("jotai").PrimitiveAtom<MapVersion> & {
    init: MapVersion;
};
export declare const zoomAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
export declare const cursorTileAtom: import("jotai").PrimitiveAtom<{
    x: number;
    y: number;
}> & {
    init: {
        x: number;
        y: number;
    };
};
export declare const viewportRectAtom: import("jotai").PrimitiveAtom<{
    x: number;
    y: number;
    w: number;
    h: number;
}> & {
    init: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
};
/**
 * One-shot request to centre the main viewport on a tile — set by the minimap,
 * consumed (and cleared) by MapViewport.
 */
export declare const centerViewOnAtom: import("jotai").PrimitiveAtom<{
    x: number;
    y: number;
} | null> & {
    init: {
        x: number;
        y: number;
    } | null;
};
export interface ViewFlags {
    grid: boolean;
    locations: boolean;
    locationNames: boolean;
    units: boolean;
    sprites: boolean;
    doodads: boolean;
    fog: boolean;
    elevation: boolean;
    buildability: boolean;
    startLocations: boolean;
    /** Cycle the palette so water and lava animate as they do in game. */
    animateWater: boolean;
    /** Run the units' iscript idle animations (turrets, pulsing buildings, fires, smoke). */
    animateUnits: boolean;
}
export declare const viewFlagsAtom: import("jotai").PrimitiveAtom<ViewFlags> & {
    init: ViewFlags;
};
export declare const gridSizeAtom: import("jotai").PrimitiveAtom<8 | 64 | 32 | 16 | 128> & {
    init: 8 | 64 | 32 | 16 | 128;
};
/**
 * The mirror mode the Rect, Tile and Fog brushes paint under (Tools ▸ Symmetry…). The
 * isometric and Blend brushes ignore it. A square-only mode on a map that is not square
 * behaves as "none".
 */
export declare const symmetryAtom: import("jotai").PrimitiveAtom<SymmetryMode> & {
    init: SymmetryMode;
};
