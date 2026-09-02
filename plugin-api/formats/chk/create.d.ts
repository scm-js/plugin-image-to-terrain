import type { ChkSection } from "./reader";
import type { Scenario } from "./scenario";
export interface CreateScenarioOptions {
    width: number;
    height: number;
    /** ERA value: 0 badlands, 1 platform, 2 install, 3 ashworld, 4 jungle, 5 desert, 6 ice, 7 twilight. */
    era: number;
    name: string;
    description?: string;
    /** Terrain to start from; a map of null tiles when omitted. See tileset/terrain.ts. */
    tiles?: Uint16Array;
    /** The matching ISOM lattice; all null terrain (zeros, as StarEdit starts) when omitted. */
    isom?: Uint16Array;
}
/** The unmodelled sections a game-loadable map still needs, on StarEdit's defaults. */
export declare function rawCreatedSections(): ChkSection[];
export declare function createScenario(options: CreateScenarioOptions): Scenario;
/**
 * The sections StarCraft needs to load a scenario, whatever its revision. The settings
 * pairs come on top: the original layouts for a StarCraft 1.00 file (VER < 205), the `x`
 * layouts for anything Brood War reads (VER ≥ 63) — a hybrid map needs both. Used by
 * Check Map to tell a map that will not load from one that merely lacks optional data.
 */
export declare const REQUIRED_SECTIONS: readonly string[];
export declare const REQUIRED_ORIGINAL_SECTIONS: readonly string[];
export declare const REQUIRED_EXPANSION_SECTIONS: readonly string[];
/** Everything a file of this revision must carry to load (`STR ` stands for STRx on a Remastered file). */
export declare function requiredSections(fileVersion: number): string[];
