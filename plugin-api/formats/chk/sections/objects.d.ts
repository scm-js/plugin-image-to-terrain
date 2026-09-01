export interface UnitRecord {
    serial: number;
    x: number;
    y: number;
    unitId: number;
    relationType: number;
    /** Bit set of which "special properties" fields below are meaningful. */
    validProperties: number;
    validStates: number;
    owner: number;
    hitPointsPercent: number;
    shieldPercent: number;
    energyPercent: number;
    resourceAmount: number;
    hangarUnits: number;
    stateFlags: number;
    unused: number;
    relatedSerial: number;
}
export declare const UNIT_STRIDE = 36;
/** `validProperties` bits (offset 0x0C): which special-property fields the game reads. */
export declare const UnitValid: {
    readonly Cloak: 1;
    readonly Burrow: 2;
    readonly InTransit: 4;
    readonly Hallucinated: 8;
    readonly Invincible: 16;
};
/** `validStates` bits (offset 0x0E): which of the fields below are set ("properties used"). */
export declare const UnitUsed: {
    readonly Owner: 1;
    readonly HitPoints: 2;
    readonly Shields: 4;
    readonly Energy: 8;
    readonly Resources: 16;
    readonly Hangar: 32;
    readonly State: 64;
};
/** `stateFlags` bits (offset 0x18): the special properties themselves. */
export declare const UnitState: {
    readonly Cloaked: 1;
    readonly Burrowed: 2;
    readonly InTransit: 4;
    readonly Hallucinated: 8;
    readonly Invincible: 16;
};
/** `relationType` bits (offset 0x0A): how `relatedSerial` is linked. */
export declare const UnitRelation: {
    readonly NydusLink: 512;
    readonly Addon: 1024;
};
export declare function decodeUnits(data: Uint8Array): UnitRecord[];
export declare function encodeUnits(units: UnitRecord[]): Uint8Array;
export interface SpriteRecord {
    /** sprites.dat id for a pure sprite, units.dat id for a unit sprite (see `SpriteFlag.PureSprite`). */
    spriteId: number;
    x: number;
    y: number;
    owner: number;
    unused: number;
    /**
     * `SpriteFlag` bits. StarEdit writes a doodad's overlay sprite with the doodad's whole
     * CV5 flag word here, so real maps carry the terrain bits (0x80, 0x100, …) too.
     */
    flags: number;
}
export declare const SPRITE_STRIDE = 10;
/** THG2 `flags` bits. */
export declare const SpriteFlag: {
    /** Drawn as a sprite only; without it the game creates a unit of type `spriteId` (Installation doors and traps). */
    readonly PureSprite: 4096;
    /** The doodad's overlay is mirrored (a CV5 doodad flag StarEdit copies through). */
    readonly Flipped: 16384;
    /** Unit sprites only: the unit starts disabled (a closed door, an inactive trap). */
    readonly Disabled: 32768;
};
export declare function decodeSprites(data: Uint8Array): SpriteRecord[];
export declare function encodeSprites(sprites: SpriteRecord[]): Uint8Array;
/**
 * One placed doodad, as StarEdit records it (the game never reads this section: it sees
 * only the doodad's tiles in MTXM and its overlay in THG2). `doodadId` is the index into
 * the tileset's `dddata.bin`, not a CV5 group; `x`/`y` are the pixel centre of the
 * footprint, so the top-left tile is `x / 32 - width / 2`.
 */
export interface DoodadRecord {
    doodadId: number;
    x: number;
    y: number;
    owner: number;
    /** 0 = enabled (every doodad in Blizzard's maps), 1 = disabled. */
    disabled: number;
}
export declare const DOODAD_STRIDE = 8;
export declare function decodeDoodads(data: Uint8Array): DoodadRecord[];
export declare function encodeDoodads(doodads: DoodadRecord[]): Uint8Array;
export interface LocationRecord {
    left: number;
    top: number;
    right: number;
    bottom: number;
    nameIndex: number;
    /** Bit 0 low ground, 1 medium, 2 high, 3 low air, 4 medium air, 5 high air. */
    elevationFlags: number;
}
export declare const LOCATION_STRIDE = 20;
/** Location index 63 (1-based 64) is the fixed "Anywhere" location. */
export declare const ANYWHERE_INDEX = 63;
/**
 * `elevationFlags` bits. A *set* bit **excludes** that elevation from the location — the
 * game tests a unit's position against the location only on the elevations whose bit is
 * clear — so StarEdit's ticked "Low ground" box is bit 0 *clear*, and 0 means "everywhere".
 */
export declare const Elevation: {
    readonly LowGround: 1;
    readonly MediumGround: 2;
    readonly HighGround: 4;
    readonly LowAir: 8;
    readonly MediumAir: 16;
    readonly HighAir: 32;
};
export declare const ELEVATIONS: readonly {
    bit: number;
    label: string;
}[];
/** All six bits: the mask an elevation word is confined to. */
export declare const ELEVATION_MASK = 63;
export declare function decodeLocations(data: Uint8Array): LocationRecord[];
export declare function encodeLocations(locations: LocationRecord[]): Uint8Array;
/** A location is "unused" when it is degenerate and unnamed. */
export declare function isLocationUsed(l: LocationRecord): boolean;
