export declare const UNIT_TYPES = 228;
export declare const PLAYER_SLOTS = 12;
/** Weapon columns in UNIS. */
export declare const WEAPONS_ORIGINAL = 100;
/** Weapon columns in UNIx. */
export declare const WEAPONS_BW = 130;
export declare const UNIS_SIZE: number;
export declare const UNIX_SIZE: number;
export declare const PUNI_SIZE: number;
export interface UnitSettings {
    /** 1 = the game uses units.dat / weapons.dat for this type and ignores the columns below. */
    useDefault: Uint8Array;
    /** Fixed point: hit points × 256, like units.dat. */
    hitPoints: Uint32Array;
    shields: Uint16Array;
    armor: Uint8Array;
    /** Game frames (15 per second at Fastest). */
    buildTime: Uint16Array;
    mineralCost: Uint16Array;
    gasCost: Uint16Array;
    /** String index of the custom name, 0 for the default one. */
    nameIndex: Uint16Array;
    /** Per weapons.dat id, always `WEAPONS_BW` long; UNIS only stores the first 100. */
    weaponDamage: Uint16Array;
    weaponBonus: Uint16Array;
}
export declare function decodeUnitSettings(data: Uint8Array): UnitSettings;
export declare function encodeUnitSettings(s: UnitSettings, weapons: number): Uint8Array;
/** Every type on its dat defaults — what a map has before anyone opens Unit Settings. */
export declare function defaultUnitSettings(): UnitSettings;
export declare function cloneUnitSettings(s: UnitSettings): UnitSettings;
/**
 * Which players may build which unit types. Three tables, player-major (`puniIndex`):
 * a per-player answer, the global default, and whether each player defers to it.
 */
export interface UnitAvailability {
    /** 1 = the player can build the type; read only where `playerUsesDefault` is 0. */
    playerAvailable: Uint8Array;
    /** 1 = the type is available to every player that uses the default. */
    defaultAvailable: Uint8Array;
    /** 1 = the player takes `defaultAvailable` for the type. */
    playerUsesDefault: Uint8Array;
}
export declare function puniIndex(player: number, unitId: number): number;
export declare function decodeUnitAvailability(data: Uint8Array): UnitAvailability;
export declare function encodeUnitAvailability(a: UnitAvailability): Uint8Array;
/** Everything buildable by everyone, every player on the default — StarEdit's starting point. */
export declare function defaultUnitAvailability(): UnitAvailability;
export declare function cloneUnitAvailability(a: UnitAvailability): UnitAvailability;
/** The effective answer for one player and type: their own byte, or the default they defer to. */
export declare function isUnitAvailable(a: UnitAvailability, player: number, unitId: number): boolean;
/** Upgrades in the original layout (UPGS, UPGR). */
export declare const UPGRADES_ORIGINAL = 46;
/** Upgrades in the Brood War layout (UPGx, PUPx); also the model's width. */
export declare const UPGRADES_BW = 61;
export declare const UPGS_SIZE: number;
/** UPGx carries one unused byte after the use-default column. */
export declare const UPGX_SIZE: number;
/**
 * Research cost per upgrade: a base and a per-level factor for minerals, gas and time.
 * Struct of arrays over 61 upgrades; the original sections only store the first 46.
 */
export interface UpgradeSettings {
    /** 1 = the game uses upgrades.dat for this upgrade and ignores the columns below. */
    useDefault: Uint8Array;
    mineralCost: Uint16Array;
    mineralFactor: Uint16Array;
    gasCost: Uint16Array;
    gasFactor: Uint16Array;
    /** Game frames. */
    timeCost: Uint16Array;
    timeFactor: Uint16Array;
}
export declare function decodeUpgradeSettings(data: Uint8Array): UpgradeSettings;
export declare function encodeUpgradeSettings(s: UpgradeSettings, count: number): Uint8Array;
/** Every upgrade on its upgrades.dat costs. */
export declare function defaultUpgradeSettings(): UpgradeSettings;
export declare function cloneUpgradeSettings(s: UpgradeSettings): UpgradeSettings;
export declare const UPGR_SIZE: number;
export declare const PUPX_SIZE: number;
/**
 * How far each player may research each upgrade and where they start. Player-major
 * tables (`upgradeIndex`), a global default pair, and a per-player "use the default" flag.
 */
export interface UpgradeRestrictions {
    playerMax: Uint8Array;
    playerStart: Uint8Array;
    defaultMax: Uint8Array;
    defaultStart: Uint8Array;
    playerUsesDefault: Uint8Array;
}
export declare function upgradeIndex(player: number, upgradeId: number): number;
/**
 * upgrades.dat's `maxRepeats` per id — the level cap StarEdit writes for a fresh map: 3 for
 * the sixteen armour / weapon lines, 1 for single-shot upgrades, 0 for the unused slots.
 */
export declare const DEFAULT_UPGRADE_MAX: readonly number[];
export declare function decodeUpgradeRestrictions(data: Uint8Array): UpgradeRestrictions;
export declare function encodeUpgradeRestrictions(r: UpgradeRestrictions, count: number): Uint8Array;
/** Every player on the default, which caps each upgrade at its upgrades.dat level and starts it at 0. */
export declare function defaultUpgradeRestrictions(): UpgradeRestrictions;
export declare function cloneUpgradeRestrictions(r: UpgradeRestrictions): UpgradeRestrictions;
/** The effective { start, max } levels for one player and upgrade. */
export declare function upgradeLevels(r: UpgradeRestrictions, player: number, upgradeId: number): {
    start: number;
    max: number;
};
export declare const TECHS_ORIGINAL = 24;
export declare const TECHS_BW = 44;
export declare const TECS_SIZE: number;
export declare const TECX_SIZE: number;
export interface TechSettings {
    /** 1 = the game uses techdata.dat for this ability. */
    useDefault: Uint8Array;
    mineralCost: Uint16Array;
    gasCost: Uint16Array;
    /** Game frames. */
    researchTime: Uint16Array;
    energyCost: Uint16Array;
}
export declare function decodeTechSettings(data: Uint8Array): TechSettings;
export declare function encodeTechSettings(s: TechSettings, count: number): Uint8Array;
export declare function defaultTechSettings(): TechSettings;
export declare function cloneTechSettings(s: TechSettings): TechSettings;
export declare const PTEC_SIZE: number;
export declare const PTEX_SIZE: number;
/** Whether each player may research each ability and whether they start with it. Same shape as `UpgradeRestrictions`. */
export interface TechRestrictions {
    playerAvailable: Uint8Array;
    playerResearched: Uint8Array;
    defaultAvailable: Uint8Array;
    defaultResearched: Uint8Array;
    playerUsesDefault: Uint8Array;
}
export declare function techIndex(player: number, techId: number): number;
export declare function decodeTechRestrictions(data: Uint8Array): TechRestrictions;
export declare function encodeTechRestrictions(r: TechRestrictions, count: number): Uint8Array;
/** Everything researchable by everyone, nothing pre-researched, every player on the default. */
export declare function defaultTechRestrictions(): TechRestrictions;
export declare function cloneTechRestrictions(r: TechRestrictions): TechRestrictions;
/** The effective { available, researched } answer for one player and ability. */
export declare function techState(r: TechRestrictions, player: number, techId: number): {
    available: boolean;
    researched: boolean;
};
