/** Unit type catalogue: StarEdit names by units.dat id, and the palette's grouping of them. */
export type RaceKey = "terran" | "zerg" | "protoss" | "neutral";
/** StarEdit's display names, indexed by units.dat id (0–227). */
export declare const UNIT_NAMES: readonly string[];
export declare const UNIT_TYPE_COUNT: number;
export declare const START_LOCATION = 214;
export declare function unitName(id: number): string;
export interface UnitGroup {
    race: RaceKey;
    label: string;
    /** units.dat ids, in palette order. */
    units: number[];
}
/** SCMDraft-style palette grouping. Every id 0–227 appears exactly once (see tests/dat.test.ts). */
export declare const UNIT_GROUPS: UnitGroup[];
export declare const RACE_LABEL: Record<RaceKey, string>;
/** StarEdit's upgrade names by upgrades.dat id (0–60); 46 exist in the original game, Brood War added the rest. */
export declare const UPGRADE_NAMES: readonly string[];
/** StarEdit's technology names by techdata.dat id (0–43); 24 exist in the original game. */
export declare const TECH_NAMES: readonly string[];
export declare const upgradeName: (id: number) => string;
export declare const techName: (id: number) => string;
/** Which race researches each upgrade, for grouping the list; null for the unused slots. */
export declare const UPGRADE_RACE: readonly (RaceKey | null)[];
export declare const TECH_RACE: readonly (RaceKey | null)[];
/** Ids whose name is a placeholder: nothing in the game refers to them, so the dialogs list them last. */
export declare const isUnusedUpgrade: (id: number) => boolean;
export declare const isUnusedTech: (id: number) => boolean;
