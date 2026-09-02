/**
 * Scenario-wide settings the dialogs edit: players, forces, colours and unit settings.
 *
 * These are not part of the undo model — each dialog is its own transaction (OK / Apply
 * / Cancel), as in StarEdit. Every writer here marks the sections it touches dirty and
 * the caller bumps `settingsRevisionAtom` (`commitSettingsAtom`) so the chrome re-reads.
 */
import { type Scenario } from "../formats/chk/scenario";
import { type PlayerRgb } from "../formats/chk/sections/players";
import { type TechRestrictions, type TechSettings, type UnitAvailability, type UnitSettings, type UpgradeRestrictions, type UpgradeSettings } from "../formats/chk/sections/settings";
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
