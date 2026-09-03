import { type ChkFile } from "./reader";
import { type StringTable } from "./sections/strings";
import { type DoodadRecord, type LocationRecord, type SpriteRecord, type UnitRecord } from "./sections/objects";
import { type Forces, type PlayerRgb } from "./sections/players";
import { type TechRestrictions, type TechSettings, type UnitAvailability, type UnitSettings, type UpgradeRestrictions, type UpgradeSettings } from "./sections/settings";
import { type CuwpSlot } from "./sections/cuwp";
import { type TriggerRecord } from "./sections/triggers";
/**
 * A parsed scenario.
 *
 * `chk` holds every original section in file order and is the fidelity anchor: sections
 * we do not model are re-emitted byte for byte, so opening and saving a map we only
 * partly understand does not destroy the parts we don't. Only names listed in `dirty`
 * are re-encoded on save.
 */
export interface Scenario {
    chk: ChkFile;
    dirty: Set<string>;
    warnings: string[];
    /** TYPE, e.g. "RAWB" for Brood War. */
    type: string;
    /** VER: 59 original, 63 hybrid, 205 Brood War, 206 Remastered. */
    fileVersion: number;
    width: number;
    height: number;
    /** ERA value as stored; the meaningful tileset is `tilesetId`. */
    era: number;
    strings: StringTable;
    nameIndex: number;
    descriptionIndex: number;
    playerTypes: number[];
    /**
     * IOWN: StarEdit's own copy of the player types — what its Player Settings dialog
     * shows, where the game reads OWNR. The editor keeps the two in step; a file where they
     * differ (another tool wrote one and not the other) is flagged by Check Map. Null when
     * the file has no section.
     */
    editorPlayerTypes: number[] | null;
    playerRaces: number[];
    playerColors: number[];
    /** CRGB, Remastered's per-slot colour choice; null when the file has none (every client then reads COLR). */
    playerRgb: PlayerRgb | null;
    forces: Forces;
    /** UNIx if the file has one, else UNIS; null when it has neither (every type on its dat defaults). */
    unitSettings: UnitSettings | null;
    /** PUNI; null when the file has none (everything buildable by everyone). */
    unitAvailability: UnitAvailability | null;
    /** UPGx if the file has one, else UPGS; null when it has neither (every upgrade on its dat costs). */
    upgradeSettings: UpgradeSettings | null;
    /** PUPx else UPGR; null when absent (every player on the dat level caps, starting at 0). */
    upgradeRestrictions: UpgradeRestrictions | null;
    /** TECx else TECS; null when absent. */
    techSettings: TechSettings | null;
    /** PTEx else PTEC; null when absent (everything researchable, nothing researched). */
    techRestrictions: TechRestrictions | null;
    /** WAV: 512 string indices of the map's sound paths; null when the file has no section. */
    wavs: number[] | null;
    /** UPRP: the 64 Create Unit with Properties slots (the action names one 1-based); null when the file has no section. */
    cuwp: CuwpSlot[] | null;
    /** UPUS: StarEdit's "slot in use" byte per CUWP slot; null when the file has no section. */
    cuwpUsed: boolean[] | null;
    /** MTXM: what the game draws — terrain with the doodads stamped over it. */
    tiles: Uint16Array;
    /**
     * TILE: StarEdit's copy of the terrain *without* doodads (a doodad's cells hold the
     * ground it was placed on). Terrain brushes write both arrays; placing a doodad writes
     * only `tiles`, and removing one restores its cells from here. A file without TILE
     * starts with a copy of MTXM.
     */
    editorTiles: Uint16Array;
    isom: Uint16Array | null;
    mask: Uint8Array | null;
    units: UnitRecord[];
    sprites: SpriteRecord[];
    doodads: DoodadRecord[];
    locations: LocationRecord[];
    /** TRIG, in execution order. */
    triggers: TriggerRecord[];
    /** MBRF: mission briefings, same record layout with briefing action types. */
    briefing: TriggerRecord[];
    /** SWNM: string index per switch (0 = unnamed); null when the file has no section. */
    switchNames: number[] | null;
}
export type TilesetIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
/** ERA is stored as a full u16 but the game masks it to three bits. */
export declare function tilesetIndex(scn: Scenario): TilesetIndex;
export declare function scenarioName(scn: Scenario): string | null;
export declare function scenarioDescription(scn: Scenario): string | null;
export declare function markDirty(scn: Scenario, ...names: string[]): void;
export declare function setScenarioName(scn: Scenario, text: string): void;
export declare function setScenarioDescription(scn: Scenario, text: string): void;
/** Which section the string table is written to: STRx for Remastered maps, STR otherwise. */
export declare function strSectionName(scn: Scenario): string;
export type MapVersion = "original" | "hybrid" | "broodwar" | "remastered";
/** VER values StarEdit writes for each revision. */
export declare const MAP_VERSIONS: Record<MapVersion, {
    ver: number;
    type: string;
    label: string;
    extension: string;
}>;
export declare function mapVersionOf(fileVersion: number): MapVersion;
/** Whether the game reads the Brood War (`x`) settings sections for this file. */
export declare function isExpansion(scn: Scenario): boolean;
/**
 * Change the file's revision: VER and TYPE, and the string table's width when moving
 * to or from Remastered. Sections of the other revision are left alone — a hybrid map
 * legitimately carries both UNIS and UNIx.
 */
export declare function setMapVersion(scn: Scenario, version: MapVersion, extendedStrings?: boolean): void;
/**
 * Switch the string table between STR (16-bit) and STRx (32-bit). Both names go dirty:
 * the one that no longer applies encodes to null and is dropped on save.
 */
export declare function setExtendedStrings(scn: Scenario, extended: boolean): void;
/** UNIS and/or UNIx. */
export declare const unitSettingsSections: (scn: Scenario) => string[];
/** UPGS and/or UPGx. */
export declare const upgradeSettingsSections: (scn: Scenario) => string[];
/** UPGR and/or PUPx. */
export declare const upgradeRestrictionSections: (scn: Scenario) => string[];
/** TECS and/or TECx. */
export declare const techSettingsSections: (scn: Scenario) => string[];
/** PTEC and/or PTEx. */
export declare const techRestrictionSections: (scn: Scenario) => string[];
export declare function parseScenario(bytes: Uint8Array): Scenario;
/**
 * The sections `encodeSection` produces from the model. Everything else in a file is
 * carried as bytes and written back unchanged; a raw edit to one of these is only seen
 * by the editor once the file is parsed again (`editor/sections.ts`).
 */
export declare const MODELLED_SECTIONS: ReadonlySet<string>;
export declare function serializeScenario(scn: Scenario): Uint8Array;
