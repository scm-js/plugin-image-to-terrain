/**
 * StarCraft tileset graphics.
 *
 * A map's MTXM entry is only an index. Resolving it to pixels walks four files:
 *
 *   MTXM id ──(id >> 4)──▶ CV5 group ──(id & 15)──▶ VX4 megatile
 *   VX4 megatile ──▶ 16 minitile refs ──▶ VR4 8x8 palette-index bitmaps ──▶ WPE palette
 *
 * VF4 carries the per-minitile walkability/height flags the editor overlays.
 * Community format reference: https://wiki.staredit.net/wiki/Terrain_Format
 * Full provenance: ../../../ATTRIBUTION.md
 */
export declare const MINITILE_PX = 8;
export declare const MEGATILE_PX = 32;
/** Minitiles per megatile edge. */
export declare const MINITILES_PER_EDGE = 4;
export interface Cv5Group {
    /** Doodad groups store 1 here; terrain groups store a group type. */
    index: number;
    /** The full u16 flag word; see GroupFlag. */
    flags: number;
    /** Low byte of `flags`: walkability, creep and the unbuildable bit. */
    buildability: number;
    /** High byte of `flags`: view-blocking and the ground-height bits. */
    groundHeight: number;
    /**
     * ISOM link on each side: values up to 48 are "soft" links shared with whatever
     * terrain borders this piece, higher ones are "hard" links that pair pieces of the
     * same edge set. Flat ground has the same soft link on all four sides.
     */
    edges: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    /**
     * How cliff pieces stack vertically: a group whose `top` equals the `bottom` of the
     * group above it continues that cliff face. Zero means nothing stacks that way.
     */
    stack: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    /** VX4 megatile index for each of the 16 slots in the group. */
    megatiles: Uint16Array;
    /** Set on doodad groups (`index` 1), which store a different record in the edge/stack bytes. */
    doodad?: Cv5Doodad;
}
/**
 * What a doodad group stores where terrain groups keep their ISOM links. A doodad spans
 * one group per row: row `r` of the doodad whose first group is `g` is group `g + r`,
 * with column `c` in megatile slot `c` (so its MTXM id is `((g + r) << 4) | c`). Every
 * group of the doodad repeats the same `ddData`, `width` and `height`.
 */
export interface Cv5Doodad {
    /** sprites.dat id (DoodadFlag.SpriteOverlay) or units.dat id (DoodadFlag.UnitOverlay) drawn over the tiles. */
    overlay: number;
    /** 1-based `rez\stat_txt.tbl` index of the palette category ("Trees", "Cliff", …); 0 for the unlisted ones. */
    nameIndex: number;
    /** Index into `tileset\<name>\dddata.bin`, and what DD2 records store. */
    ddData: number;
    width: number;
    height: number;
}
/** Doodad groups mark themselves with this `index`. */
export declare const DOODAD_GROUP_INDEX = 1;
export interface Tileset {
    /** 256 RGBA entries, 4 bytes each. */
    palette: Uint8Array;
    /** VR4: `minitiles[i * 64 + n]` is a palette index. */
    minitiles: Uint8Array;
    /** VX4 refs, 16 per megatile: bit 0 is horizontal flip, the rest is the minitile index. */
    megatileRefs: Uint32Array;
    megatileCount: number;
    /** True when the source was .vx4ex (Remastered, 32-bit refs). */
    extended: boolean;
    /** VF4 flags, 16 per megatile. */
    megatileFlags: Uint16Array;
    groups: Cv5Group[];
}
export interface TilesetFiles {
    cv5: Uint8Array;
    vf4: Uint8Array;
    vr4: Uint8Array;
    /** Pass either the classic .vx4 or the Remastered .vx4ex. */
    vx4: Uint8Array;
    vx4Extended?: boolean;
    wpe: Uint8Array;
}
/** WPE is 256 entries of R,G,B,pad. Expanded to RGBA with a fully opaque alpha. */
export declare function decodePalette(wpe: Uint8Array): Uint8Array;
export declare function decodeCv5(cv5: Uint8Array): Cv5Group[];
export declare function decodeMegatileRefs(vx4: Uint8Array, extended: boolean): Uint32Array;
export declare function decodeMegatileFlags(vf4: Uint8Array): Uint16Array;
/** A .vx4ex file is 64 bytes per megatile where .vx4 is 32; the caller usually knows which. */
export declare function loadTileset(files: TilesetFiles): Tileset;
/** Resolve an MTXM tile id to a VX4 megatile index, or -1 when the id is out of range. */
export declare function megatileForTile(tileset: Tileset, tileId: number): number;
/**
 * Paint one 32x32 megatile as RGBA into `dest` at (dx, dy) of a `destWidth`-pixel row.
 * Works on a plain array, so it is equally usable against ImageData in the browser and
 * a bare buffer in tests. `palette` defaults to the tileset's own; colour cycling passes
 * a rotated copy (see cycle.ts).
 */
export declare function drawMegatile(tileset: Tileset, megatile: number, dest: Uint8ClampedArray | Uint8Array, destWidth: number, dx: number, dy: number, palette?: Uint8Array): void;
/** Per-group flags; the walk/height bits are overridden per minitile by VF4. */
export declare const GroupFlag: {
    readonly Walkable: 1;
    readonly Unwalkable: 4;
    readonly HasDoodadCover: 16;
    readonly Creep: 64;
    readonly Unbuildable: 128;
    readonly BlocksView: 256;
    readonly MidGround: 512;
    readonly HighGround: 1024;
    readonly Occupied: 2048;
    readonly RecedingCreep: 4096;
    readonly CliffEdge: 8192;
    readonly TemporaryCreep: 16384;
    readonly Startable: 32768;
};
/**
 * The high bits of a doodad group's flag word, where terrain groups keep creep/cliff
 * bits. StarEdit copies the whole word into the overlay's THG2 record, which is how
 * `SpriteFlag.PureSprite` (0x1000) ends up set on doodad sprites.
 */
export declare const DoodadFlag: {
    /** `overlay` is a sprites.dat id, placed as a pure sprite. */
    readonly SpriteOverlay: 4096;
    /** `overlay` is a units.dat id, placed as a unit sprite (Installation doors and traps). */
    readonly UnitOverlay: 8192;
    /** The overlay is drawn mirrored. */
    readonly OverlayFlipped: 16384;
};
/** Ground height 0/1/2 a group is flagged with. */
export declare function groupHeight(group: Cv5Group): 0 | 1 | 2;
export declare function groupBuildable(group: Cv5Group): boolean;
export declare const TileFlag: {
    readonly Walkable: 1;
    readonly MidGround: 2;
    readonly HighGround: 4;
    readonly BlocksView: 8;
    readonly Ramp: 16;
};
/** Ground height 0/1/2 for a minitile, as the elevation overlay draws it. */
export declare function minitileHeight(tileset: Tileset, megatile: number, minitile: number): 0 | 1 | 2;
