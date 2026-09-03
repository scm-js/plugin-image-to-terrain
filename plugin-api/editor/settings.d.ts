/**
 * Scenario-wide settings the dialogs edit: players, forces, colours and unit settings.
 *
 * These are not part of the undo model — each dialog is its own transaction (OK / Apply
 * / Cancel), as in StarEdit. Every writer here marks the sections it touches dirty and
 * the caller bumps `settingsRevisionAtom` (`commitSettingsAtom`) so the chrome re-reads.
 */
import { type MapVersion, type Scenario } from "../formats/chk/scenario";
import { type PlayerRgb } from "../formats/chk/sections/players";
import { type TechRestrictions, type TechSettings, type UnitAvailability, type UnitSettings, type UpgradeRestrictions, type UpgradeSettings } from "../formats/chk/sections/settings";
import { type TechdataDat, type UnitsDat, type UpgradesDat, type WeaponsDat } from "../formats/dat/dat";
/**
 * The index of `text` in the string table: an existing identical entry, else a new one
 * at the end. Never overwrites, since the old index may be shared with a trigger or
 * location. Returns 0 for the empty string ("no name").
 */
export declare function internString(scn: Scenario, text: string): number;
export interface PlayerSettings {
    /** OWNR bytes (`PlayerType`), 12 slots. */
    types: number[];
    /** SIDE bytes (`PlayerRace`), 12 slots. */
    races: number[];
    /** COLR bytes, 8 slots. */
    colors: number[];
    /** FORC force index, 8 slots. */
    force: number[];
}
export declare function readPlayerSettings(scn: Scenario): PlayerSettings;
/** Write the four player tables back, marking only the sections that changed. OWNR and IOWN always agree. */
export declare function applyPlayerSettings(scn: Scenario, next: PlayerSettings): void;
/** COLR plus, when present, CRGB. A null `rgb` leaves the file without a CRGB section. */
export declare function applyPlayerColors(scn: Scenario, colors: number[], rgb: PlayerRgb | null): void;
export interface ForceSettings {
    /** Force index of each of the 8 playable slots. */
    playerForce: number[];
    /** The four names as text ("" for none). */
    names: string[];
    /** `ForceFlag` bits per force. */
    flags: number[];
}
export declare function forceName(scn: Scenario, force: number): string;
export declare function readForceSettings(scn: Scenario): ForceSettings;
export declare function applyForceSettings(scn: Scenario, next: ForceSettings): void;
/** A working copy of both unit tables, created on defaults when the file has none. */
export declare function readUnitSettings(scn: Scenario): {
    settings: UnitSettings;
    availability: UnitAvailability;
};
/**
 * Install edited copies. `names` maps a unit id to the custom name text the user typed
 * (the string is interned here, so the copy's `nameIndex` for those ids is overwritten).
 * Which of UNIS / UNIx gets written follows the file's revision (`unitSettingsSections`).
 */
export declare function applyUnitSettings(scn: Scenario, settings: UnitSettings, availability: UnitAvailability, names: Map<number, string>): void;
export declare function unitCustomName(scn: Scenario, unitId: number): string;
/** A working copy of UPGS/UPGx and UPGR/PUPx, on defaults when the file has none. */
export declare function readUpgradeSettings(scn: Scenario): {
    settings: UpgradeSettings;
    restrictions: UpgradeRestrictions;
};
/** Install edited copies; which of UPGS / UPGx and UPGR / PUPx get written follows the file's revision. */
export declare function applyUpgradeSettings(scn: Scenario, settings: UpgradeSettings, restrictions: UpgradeRestrictions): void;
export declare function readTechSettings(scn: Scenario): {
    settings: TechSettings;
    restrictions: TechRestrictions;
};
export declare function applyTechSettings(scn: Scenario, settings: TechSettings, restrictions: TechRestrictions): void;
export interface PlayerSlotView {
    /** 0-based; the chrome shows it as `slot + 1`. */
    slot: number;
    type: number;
    typeName: string;
    race: number;
    raceName: string;
    /** COLR index; null for the four unplayable slots. */
    color: number | null;
    /** The colour the chrome shows for the slot (CRGB-aware). */
    colorHex: string | null;
    /** The CRGB custom triple when one is in effect. */
    rgb: [number, number, number] | null;
    /** 0-based force; null for the unplayable slots. */
    force: number | null;
    forceName: string | null;
}
export declare function playerSlotViews(scn: Scenario): PlayerSlotView[];
export interface PlayerPatch {
    type?: number;
    race?: number;
    /** COLR index 0–15 (playable slots). */
    color?: number;
    /** A CRGB custom colour, or null to go back to the palette colour (playable slots). */
    rgb?: [number, number, number] | null;
    /** 0-based force (playable slots). */
    force?: number;
}
/** Apply a patch to one slot; the sections that changed (empty when nothing did). Colours go through `applyPlayerColors`. */
export declare function patchPlayer(scn: Scenario, slot: number, patch: PlayerPatch): string[];
export interface ForceView {
    /** 0-based. */
    force: number;
    name: string;
    flags: number;
    allied: boolean;
    alliedVictory: boolean;
    sharedVision: boolean;
    randomStart: boolean;
    /** 0-based playable slots in the force. */
    players: number[];
}
export declare function forceViews(scn: Scenario): ForceView[];
export interface ForcePatch {
    name?: string;
    allied?: boolean;
    alliedVictory?: boolean;
    sharedVision?: boolean;
    randomStart?: boolean;
    /** The whole flag word, applied before the booleans. */
    flags?: number;
    /** 0-based playable slots the force should contain (others keep theirs); moves them from their forces. */
    players?: number[];
}
/** The sections that changed: `FORC`, plus the string table when a name was interned. */
export declare function patchForce(scn: Scenario, force: number, patch: ForcePatch): string[];
export interface WeaponView {
    id: number;
    name: string;
    damage: number;
    bonus: number;
}
export interface UnitTypeView {
    id: number;
    /** The game's name (or the custom one when the map sets it). */
    name: string;
    /** The custom name the map sets, `""` for the default. */
    customName: string;
    useDefault: boolean;
    /** Whole hit points. */
    hitPoints: number;
    shields: number;
    armor: number;
    /** Game frames. */
    buildTime: number;
    mineralCost: number;
    gasCost: number;
    /** The type's ground and air weapons (a turreted vehicle's are its turret's), with the effective damage. */
    weapons: WeaponView[];
    /** units.dat / weapons.dat, null without the game data. */
    defaults: {
        hitPoints: number;
        shields: number;
        armor: number;
        buildTime: number;
        mineralCost: number;
        gasCost: number;
        weapons: WeaponView[];
    } | null;
    /** PUNI: whether the type can be built by default, and per player (`"default"` where the player follows the default). */
    availability: {
        defaultAvailable: boolean;
        players: (boolean | "default")[];
    };
}
/** The weapon ids a type fights with, StarEdit's way (the turret's for a turreted vehicle). */
export declare function unitWeaponIds(dat: UnitsDat | null, unitId: number): number[];
export declare function unitTypeView(scn: Scenario, unitId: number, dat: UnitsDat | null, weapons: WeaponsDat | null): UnitTypeView;
export interface UnitTypePatch {
    /** Explicitly back to (or off) the dat defaults; setting any number below turns it off. */
    useDefault?: boolean;
    /** Custom name; `""` restores the default. */
    name?: string;
    hitPoints?: number;
    shields?: number;
    armor?: number;
    buildTime?: number;
    mineralCost?: number;
    gasCost?: number;
    weapons?: {
        id: number;
        damage?: number;
        bonus?: number;
    }[];
    /** PUNI: `player` 0-based or `"default"` (the default column); `value` true / false, or `"default"` to follow the default column again. */
    available?: {
        player: number | "default";
        value: boolean | "default";
    }[];
}
/** Apply a patch to one unit type; which of `settings` / `availability` changed. Turning the defaults off seeds an untouched row from the dat, as the dialog does. */
export declare function patchUnitType(scn: Scenario, unitId: number, patch: UnitTypePatch, dat: UnitsDat | null, weaponsDat: WeaponsDat | null): string[];
export interface UpgradeLevelsView {
    start: number;
    max: number;
    usesDefault: boolean;
}
export interface UpgradeView {
    id: number;
    name: string;
    useDefault: boolean;
    mineralCost: number;
    mineralFactor: number;
    gasCost: number;
    gasFactor: number;
    /** Game frames. */
    timeCost: number;
    timeFactor: number;
    /** upgrades.dat, null without the game data. */
    defaults: {
        mineralCost: number;
        mineralFactor: number;
        gasCost: number;
        gasFactor: number;
        timeCost: number;
        timeFactor: number;
        maxLevel: number;
    } | null;
    /** UPGR / PUPx: the default start and cap, and each of the 12 players' (effective, with `usesDefault`). */
    levels: {
        defaultStart: number;
        defaultMax: number;
        players: UpgradeLevelsView[];
    };
}
export declare function upgradeView(scn: Scenario, id: number, dat: UpgradesDat | null): UpgradeView;
export interface UpgradePatch {
    useDefault?: boolean;
    mineralCost?: number;
    mineralFactor?: number;
    gasCost?: number;
    gasFactor?: number;
    timeCost?: number;
    timeFactor?: number;
    /** `player` 0-based or `"default"`; `useDefault: true` puts a player back on the default column. */
    levels?: {
        player: number | "default";
        start?: number;
        max?: number;
        useDefault?: boolean;
    }[];
}
export declare function patchUpgrade(scn: Scenario, id: number, patch: UpgradePatch, dat: UpgradesDat | null): string[];
export interface TechStateView {
    available: boolean;
    researched: boolean;
    usesDefault: boolean;
}
export interface TechView {
    id: number;
    name: string;
    useDefault: boolean;
    mineralCost: number;
    gasCost: number;
    /** Game frames. */
    researchTime: number;
    energyCost: number;
    defaults: {
        mineralCost: number;
        gasCost: number;
        researchTime: number;
        energyCost: number;
    } | null;
    /** PTEC / PTEx: the default column and each of the 12 players' effective state. */
    state: {
        defaultAvailable: boolean;
        defaultResearched: boolean;
        players: TechStateView[];
    };
}
export declare function techView(scn: Scenario, id: number, dat: TechdataDat | null): TechView;
export interface TechPatch {
    useDefault?: boolean;
    mineralCost?: number;
    gasCost?: number;
    researchTime?: number;
    energyCost?: number;
    /** `player` 0-based or `"default"`; `useDefault: true` puts a player back on the default column. */
    state?: {
        player: number | "default";
        available?: boolean;
        researched?: boolean;
        useDefault?: boolean;
    }[];
}
export declare function patchTech(scn: Scenario, id: number, patch: TechPatch, dat: TechdataDat | null): string[];
export interface MapVersionView {
    version: MapVersion;
    label: string;
    /** The VER word. */
    fileVersion: number;
    type: string;
    /** Whether the string table is STRx. */
    extendedStrings: boolean;
    /** The file extension StarEdit would give it. */
    extension: string;
}
export declare function mapVersionView(scn: Scenario): MapVersionView;
/** `setMapVersion` reporting the sections it changed. */
export declare function changeMapVersion(scn: Scenario, version: MapVersion, extendedStrings?: boolean): string[];
