/**
 * Text triggers: SCMDraft 2's TrigEdit syntax, printed from and parsed into trigger records.
 *
 *     Trigger("Player 1", "Force 2"){
 *     Conditions:
 *       Bring("Current Player", "Any unit", "Beacon Alpha", At least, 1);
 *     Actions:
 *       Display Text Message(Always Display, "You found it!");
 *       Preserve Trigger();
 *     }
 *
 * Names (players, units, locations, switches, strings, AI scripts) resolve through a
 * `TriggerNames` context so this module knows nothing about the scenario. Anything the
 * context cannot name prints as a bare number and parses back from one, so a record with
 * an EUD player or an out-of-range unit still round-trips. A leading `;` disables a
 * condition or action (its `Disabled` flag); a `Flags:` block carries the trigger-level
 * flags SCMDraft has no syntax for, and is omitted when there are none.
 */
import { type ActionRecord, type ConditionRecord, type TriggerRecord } from "../chk/sections/triggers";
/** How the text format names things it cannot know on its own. */
export interface TriggerNames {
    /** Text of a string-table entry, null when unset. */
    string(index: number): string | null;
    /** Index for `text` — an existing identical entry or a new one. Only called while parsing. */
    intern(text: string): number;
    /** Display name of a 1-based location number. */
    location(number: number): string;
    /** 1-based number for a location name (or `Location N` / `Anywhere`), undefined when unknown. */
    locationByName(name: string): number | undefined;
    unit(id: number): string;
    unitByName(name: string): number | undefined;
    /** Display name of a 0-based switch. */
    switch(index: number): string;
    switchByName(name: string): number | undefined;
}
export interface TextTrigger {
    trigger: TriggerRecord;
    /** 1-based line the `Trigger(` header starts on. */
    line: number;
}
export declare class TriggerTextError extends Error {
    readonly line: number;
    constructor(message: string, line: number);
}
export declare function quote(text: string): string;
export declare const TRIGGER_FLAG_NAMES: [number, string][];
export declare function formatCondition(c: ConditionRecord, names: TriggerNames): string;
export declare function formatAction(a: ActionRecord, names: TriggerNames, briefing?: boolean): string;
export declare function formatTrigger(t: TriggerRecord, names: TriggerNames, briefing?: boolean): string;
export declare function formatTriggers(triggers: TriggerRecord[], names: TriggerNames, briefing?: boolean): string;
/** Parse a whole text into triggers; throws `TriggerTextError` with the offending line. */
export declare function parseTriggers(text: string, names: TriggerNames, briefing?: boolean): TextTrigger[];
/** A one-line summary of a trigger for lists: its comment, else its first condition and action. */
export declare function summarizeTrigger(t: TriggerRecord, names: TriggerNames, briefing?: boolean): {
    players: string;
    conditions: string;
    actions: string;
};
/** Text of the trigger's Comment action, if it has one. */
export declare function triggerComment(t: TriggerRecord, names: TriggerNames): string | null;
/** A copy of the trigger with its Comment action set to `text` (removed when empty). */
export declare function withComment(t: TriggerRecord, text: string, names: TriggerNames): TriggerRecord;
