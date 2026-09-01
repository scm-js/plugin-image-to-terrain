/**
 * CHK section layouts and validation sizes. Community format reference:
 * https://wiki.staredit.net/wiki/Scenario.chk
 * Full provenance: ../../../../ATTRIBUTION.md
 */
import type { CombineMode } from "../reader";
export interface Dim {
    width: number;
    height: number;
}
export interface SectionSpec {
    name: string;
    /** How repeated occurrences combine. Only meaningful for sections we decode. */
    mode: CombineMode;
    /** Fixed buffer width the game reads into, where there is one. */
    size?: number | ((dim: Dim) => number);
    /** Record stride for list sections. */
    stride?: number;
    what: string;
}
export declare const SECTION_SPECS: ReadonlyMap<string, SectionSpec>;
export declare function specFor(name: string): SectionSpec | undefined;
export declare function sizeOf(spec: SectionSpec, dim: Dim): number | undefined;
