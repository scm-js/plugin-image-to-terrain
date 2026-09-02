/**
 * Trigger editing: the scenario-backed name context the text format and the dialogs use,
 * and the list operations the Classic editor performs.
 *
 * Triggers are edited the way settings are — each dialog is its own OK / Apply / Cancel
 * transaction over a working copy, not part of the undo model — so the writers here
 * replace `scn.triggers` / `scn.briefing` wholesale and mark the section dirty; the
 * caller bumps `triggersRevisionAtom` (`commitTriggersAtom`) so lists re-read.
 */
import { type Scenario } from "../formats/chk/scenario";
import { type ActionRecord, type ConditionRecord, type TriggerRecord } from "../formats/chk/sections/triggers";
import { type ArgKind } from "../data/triggerDefs";
import type { TriggerNames } from "../formats/triggers/text";
/** StarEdit's default name for an unnamed switch (1-based, like its dialog). */
export declare function switchName(scn: Scenario, index: number): string;
/**
 * A `TriggerNames` over the scenario. `intern` appends to the string table (marking it
 * dirty), so parsing text into a scenario changes it even before the triggers are applied;
 * strings are never removed, so that is harmless.
 */
export declare function triggerNames(scn: Scenario): TriggerNames;
export declare function readTriggers(scn: Scenario): TriggerRecord[];
export declare function readBriefing(scn: Scenario): TriggerRecord[];
/** Replace the trigger list. Marks TRIG dirty only when something differs. */
export declare function applyTriggers(scn: Scenario, next: TriggerRecord[]): void;
export declare function applyBriefing(scn: Scenario, next: TriggerRecord[]): void;
export declare function sameTriggers(a: TriggerRecord[], b: TriggerRecord[]): boolean;
/** The value a fresh argument of this kind starts with (StarEdit-like defaults). */
export declare function defaultArgValue(kind: ArgKind): number;
export declare function newCondition(type: number): ConditionRecord;
export declare function newAction(type: number, briefing?: boolean): ActionRecord;
/** Whether the trigger keeps running: a Preserve Trigger action or the equivalent flag. */
export declare function isPreserved(t: TriggerRecord): boolean;
/** Add or remove the Preserve Trigger action (StarEdit's checkbox); the flag is left alone. */
export declare function setPreserved(t: TriggerRecord, on: boolean): TriggerRecord;
/** A blank trigger for the given player groups (default: All Players). */
export declare function newTrigger(players?: number[]): TriggerRecord;
export declare function insertTrigger(list: TriggerRecord[], at: number, t: TriggerRecord): TriggerRecord[];
export declare function removeTriggers(list: TriggerRecord[], indices: number[]): TriggerRecord[];
/** Move the trigger at `from` to `to` (its index in the resulting list). */
export declare function moveTrigger(list: TriggerRecord[], from: number, to: number): TriggerRecord[];
/** Indices of the triggers that run for any of the given player groups. */
export declare function triggersFor(list: TriggerRecord[], groups: number[]): number[];
