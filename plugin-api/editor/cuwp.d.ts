/**
 * The Create Unit with Properties slots (UPRP / UPUS) as a settings-style transaction:
 * the dialog edits a working copy of the 64 slots and their "in use" ticks and installs
 * it with `applyCuwp`, which marks only what changed. A map that arrived without the
 * sections gets them on the first apply — the game needs UPRP to load a map at all, and
 * Check Map already says so — and `cuwpUsage` says which triggers name each slot, so the
 * dialog can warn before a slot a trigger points at is cleared.
 */
import { type Scenario } from "../formats/chk/scenario";
import { CUWP_SLOTS, CuwpField, CuwpState, CuwpValid, cuwpSlotActive, describeCuwpSlot, emptyCuwpSlot, type CuwpSlot } from "../formats/chk/sections/cuwp";
export { CUWP_SLOTS, CuwpField, CuwpState, CuwpValid, cuwpSlotActive, describeCuwpSlot, emptyCuwpSlot, type CuwpSlot };
export interface CuwpTable {
    slots: CuwpSlot[];
    /** UPUS: StarEdit's tick per slot. */
    used: boolean[];
}
/** A working copy: the file's slots, or 64 empty ones when it has no UPRP. */
export declare function readCuwp(scn: Scenario): CuwpTable;
/** Per slot (0-based), how many Create Unit with Properties actions name it (the action's `target` is 1-based). */
export declare function cuwpUsage(scn: Scenario): number[];
/**
 * Install an edited table. UPRP is marked dirty when a slot differs (or the file had no
 * section), UPUS when a tick differs; a file that never had UPUS gets one only when a
 * tick is on, since the game does not read it. Returns the sections it marked, empty
 * when nothing changed.
 */
export declare function applyCuwp(scn: Scenario, table: CuwpTable): string[];
/** The label a slot shows in lists and the trigger editor's pick: `3 · HP 50%, cloaked`. */
export declare function cuwpSlotLabel(index: number, slot: CuwpSlot | undefined, used?: boolean): string;
/** A slot patch the way the dialog and the plugin API both apply one: only the named fields move. */
export interface CuwpSlotPatch {
    /** `null` leaves the field at the unit's default (clears its valid bit); a number sets it and the bit. */
    hitPointsPercent?: number | null;
    shieldsPercent?: number | null;
    energyPercent?: number | null;
    resources?: number | null;
    hangar?: number | null;
    /** `null` leaves the state alone; a boolean forces it. */
    cloaked?: boolean | null;
    burrowed?: boolean | null;
    inTransit?: boolean | null;
    hallucinated?: boolean | null;
    invincible?: boolean | null;
}
export declare function patchCuwpSlot(slot: CuwpSlot, patch: CuwpSlotPatch): CuwpSlot;
/** The slot as a patch-shaped view: null where the unit's default applies. */
export interface CuwpSlotView {
    index: number;
    used: boolean;
    /** How many Create Unit with Properties actions name the slot. */
    references: number;
    hitPointsPercent: number | null;
    shieldsPercent: number | null;
    energyPercent: number | null;
    resources: number | null;
    hangar: number | null;
    cloaked: boolean | null;
    burrowed: boolean | null;
    inTransit: boolean | null;
    hallucinated: boolean | null;
    invincible: boolean | null;
    summary: string;
}
export declare function cuwpSlotView(scn: Scenario, index: number, usage?: number[]): CuwpSlotView | null;
export declare function cuwpSlotViews(scn: Scenario): CuwpSlotView[];
/**
 * Patch one slot in place, the plugin API's write: sets the slot, ticks it in use when
 * anything is set, and answers with the sections it marked.
 */
export declare function patchCuwp(scn: Scenario, index: number, patch: CuwpSlotPatch, used?: boolean): string[];
