/**
 * The `arr\*.dat` tables that lead from a unit type to its picture:
 *
 *   units.dat[unit].flingy ─▶ flingy.dat[flingy].sprite ─▶ sprites.dat[sprite].image
 *   ─▶ images.dat[image].grp ─▶ images.tbl (1-based) ─▶ "unit\" + path
 *
 * Each file is a struct of arrays: every field is stored for all entries before the next
 * field starts. A few unit fields only exist for a sub-range of entries, and three of them
 * (placement box, add-on offset, extents) are arrays of small structs instead. The layout
 * below is the Brood War one (units.dat = 19876 bytes); the original game's 19192-byte
 * table just lacks the last two fields. Only what the editor needs is decoded.
 */
export declare const UNIT_TYPES = 228;
export declare const FLINGY_TYPES = 209;
export declare const SPRITE_TYPES = 517;
export declare const IMAGE_TYPES = 999;
export declare const UNITS_DAT_SIZE = 19876;
/** Pre-Brood War layout: no `broodWar` byte or `availability` word. */
export declare const UNITS_DAT_SIZE_LEGACY = 19192;
export declare const FLINGY_DAT_SIZE = 3135;
export declare const SPRITES_DAT_SIZE = 3229;
export declare const IMAGES_DAT_SIZE = 37962;
/** `subunit` value meaning "none". */
export declare const NO_UNIT = 228;
export declare const WEAPON_TYPES = 130;
/** units.dat's "no weapon" id. */
export declare const NO_WEAPON = 130;
export declare const WEAPONS_DAT_SIZE = 5460;
/** `direction` value meaning StarCraft picks one at random when the unit is created. */
export declare const RANDOM_DIRECTION = 32;
/** units.dat `flags` (special ability flags) bits. */
export declare const UnitFlag: {
    readonly Building: number;
    readonly Addon: number;
    readonly Flyer: number;
    readonly Worker: number;
    readonly Subunit: number;
    readonly FlyingBuilding: number;
    readonly Hero: number;
    readonly Regenerates: number;
    readonly AnimatedIdle: number;
    readonly Cloakable: number;
    readonly TwoUnitsInOneEgg: number;
    readonly SingleEntity: number;
    readonly ResourceDepot: number;
    readonly ResourceContainer: number;
    readonly Robotic: number;
    readonly Detector: number;
    readonly Organic: number;
    readonly RequiresCreep: number;
    readonly RequiresPsi: number;
    readonly Burrowable: number;
    readonly Spellcaster: number;
    readonly PermanentCloak: number;
    readonly PickupItem: number;
    readonly IgnoreSupplyCheck: number;
    readonly UseMediumOverlays: number;
    readonly UseLargeOverlays: number;
    readonly BattleReactions: number;
    readonly FullAutoAttack: number;
    readonly Invincible: number;
    readonly Mechanical: number;
    readonly ProducesUnits: 2147483648;
};
export interface UnitsDat {
    /** flingy.dat index. */
    flingy: Uint8Array;
    /** First subunit (turret), or NO_UNIT. */
    subunit: Uint16Array;
    /** Starting facing 0–31 (0 = up, 8 = right, 16 = down), or RANDOM_DIRECTION. */
    direction: Uint8Array;
    shieldEnable: Uint8Array;
    shieldAmount: Uint16Array;
    /** Fixed point: hit points × 256. */
    hitPoints: Uint32Array;
    elevation: Uint8Array;
    /** UnitFlag bits. */
    flags: Uint32Array;
    /** StarEdit placement box, pixels. Buildings are placed on the tile grid by this box. */
    placementWidth: Uint16Array;
    placementHeight: Uint16Array;
    /** Collision extents from the unit's centre, pixels. */
    extentLeft: Uint16Array;
    extentUp: Uint16Array;
    extentRight: Uint16Array;
    extentDown: Uint16Array;
    mineralCost: Uint16Array;
    vespeneCost: Uint16Array;
    /** Game frames. */
    buildTime: Uint16Array;
    armor: Uint8Array;
    /** weapons.dat ids, or NO_WEAPON. */
    groundWeapon: Uint8Array;
    airWeapon: Uint8Array;
    /** Bit 0 Zerg, 1 Terran, 2 Protoss, 3 men, 4 building, 5 factory, 6 independent, 7 neutral. */
    groupFlags: Uint8Array;
    /** StarEdit availability flags; all zero for the legacy layout. */
    availability: Uint16Array;
}
export interface FlingyDat {
    /** sprites.dat index. */
    sprite: Uint16Array;
}
export interface SpritesDat {
    /** images.dat index. */
    image: Uint16Array;
}
/** images.dat `drawFunction` values the editor distinguishes. */
export declare const DrawFunction: {
    readonly Normal: 0;
    /** Palette-remapped effect (fire, explosions): `remapping` picks the tileset's remap table. */
    readonly Remap: 9;
    readonly Shadow: 10;
    readonly HpBar: 11;
    readonly SelectionCircle: 13;
};
/** images.dat `remapping` values: which `tileset\<name>\*.pcx` table a Remap image blends through. */
export declare const REMAP_TABLES: readonly ["", "ofire", "gfire", "bfire", "bexpl"];
/** The overlay `.lo` slots in images.dat order; `imgoluselo` picks one by this index. */
export declare const LO_KINDS: readonly ["attack", "damage", "special", "landing", "liftOff", "shield"];
export interface ImagesDat {
    /** 1-based images.tbl index of the GRP path, relative to `unit\`. */
    grp: Uint32Array;
    /** 1 when the GRP holds 17 frames per facing set (directions 0–16, the rest mirrored). */
    graphicTurns: Uint8Array;
    drawFunction: Uint8Array;
    remapping: Uint8Array;
    /** iscript.bin id of the image's animation script. */
    iscript: Uint32Array;
    /** 1-based images.tbl indices of the overlay position files (0 = none), in LO_KINDS order. */
    lo: Uint32Array[];
}
export declare function decodeUnitsDat(data: Uint8Array): UnitsDat;
export interface WeaponsDat {
    damage: Uint16Array;
    /** Added per upgrade level. */
    bonus: Uint16Array;
}
/** Only the two columns Unit Settings shows as defaults; the layout is 42 bytes per weapon, struct of arrays. */
export declare function decodeWeaponsDat(data: Uint8Array): WeaponsDat;
export type Race = "zerg" | "terran" | "protoss" | null;
/** The race a unit type belongs to, from its group flags. */
export declare function unitRace(units: UnitsDat, unitId: number): Race;
export declare function decodeFlingyDat(data: Uint8Array): FlingyDat;
export declare function decodeSpritesDat(data: Uint8Array): SpritesDat;
export declare function decodeImagesDat(data: Uint8Array): ImagesDat;
export declare const UPGRADE_TYPES = 61;
export declare const TECH_TYPES = 44;
export declare const UPGRADES_DAT_SIZE = 1281;
export declare const TECHDATA_DAT_SIZE = 836;
/** The columns Upgrade Settings shows as defaults: base cost and per-level factor for minerals, gas and time, plus the level cap. */
export interface UpgradesDat {
    mineralCost: Uint16Array;
    mineralFactor: Uint16Array;
    vespeneCost: Uint16Array;
    vespeneFactor: Uint16Array;
    /** Game frames. */
    timeCost: Uint16Array;
    timeFactor: Uint16Array;
    /** Highest level the upgrade goes to (3 for armour / weapons, 1 for the rest). */
    maxRepeats: Uint8Array;
    /** 1 for upgrades only Brood War has. */
    broodWar: Uint8Array;
}
/** Struct of arrays: six u16 columns of cost, then unknown / icon / label u16s, then race, max repeats and the Brood War flag. */
export declare function decodeUpgradesDat(data: Uint8Array): UpgradesDat;
/** The columns Technology Settings shows as defaults. */
export interface TechdataDat {
    mineralCost: Uint16Array;
    vespeneCost: Uint16Array;
    /** Game frames. */
    researchTime: Uint16Array;
    energyCost: Uint16Array;
    /** 1 for abilities only Brood War has. */
    broodWar: Uint8Array;
}
/** Struct of arrays: four u16 cost columns, then research / use requirements, icon and label u16s, race, an unused byte and the Brood War flag. */
export declare function decodeTechdataDat(data: Uint8Array): TechdataDat;
