/**
 * What each trigger condition and action *means*: its name, and which record fields hold
 * which arguments. Everything that presents a trigger — the Classic editor's argument
 * editors, the text format's printer and parser, the script API's typings — reads this
 * table rather than knowing the field layout itself.
 *
 * Argument order follows SCMDraft 2's text triggers (TrigEdit), so text pasted from the
 * community's usual editor parses here and ours reads back there. Field assignments are
 * from the staredit.net Scenario.chk reference; the ones nothing in `fixtures/` exercises
 * are marked so.
 */
import type { ActionRecord, ConditionRecord } from "../formats/chk/sections/triggers";
export type ArgKind = "player" | "unit" | "location" | "switch" | "comparison" | "switchState" | "switchAction" | "modifier" | "unitState" | "order" | "alliance" | "resource" | "score" | "aiScript" | "textFlags" | "text" | "wav" | "number" | "amount" | "count" | "duration" | "percent" | "cuwp" | "slot";
export type ConditionField = keyof ConditionRecord;
export type ActionField = keyof ActionRecord;
export interface ArgDef<F extends string> {
    kind: ArgKind;
    field: F;
    label: string;
}
export interface ConditionDef {
    type: number;
    name: string;
    args: ArgDef<ConditionField>[];
}
export interface ActionDef {
    type: number;
    name: string;
    args: ArgDef<ActionField>[];
    /** Text / Transmission: the `AlwaysDisplay` flag is an argument of its own. */
    hasTextFlags?: boolean;
}
export declare const CONDITION_DEFS: ConditionDef[];
export declare const ACTION_DEFS: ActionDef[];
/**
 * Mission briefing actions. The portrait slot lives in the record's first player group
 * (`player`), as Blizzard's own briefings show (`tests/briefing.test.ts` reads the ones on
 * Ground Zero and Spring Thaw: Show Portrait, Display Speaking Portrait and Text Message
 * all round-trip) — not in the second group the community reference names. Transmission
 * follows the same layout: slot in `player`, the duration modifier's amount in `target`
 * with the modifier byte, the text's own time in `time`; no Blizzard map uses it, so that
 * one rests on the reference and on SCMDraft's reading of it.
 */
export declare const BRIEFING_ACTION_DEFS: ActionDef[];
export declare const conditionDef: (type: number) => ConditionDef | undefined;
export declare const conditionDefByName: (name: string) => ConditionDef | undefined;
export declare const actionDef: (type: number, briefing?: boolean) => ActionDef | undefined;
export declare const actionDefByName: (name: string, briefing?: boolean) => ActionDef | undefined;
export interface Choice {
    value: number;
    label: string;
    /** Extra spellings the text parser accepts. */
    aliases?: string[];
}
/** The 27 player-group slots, in `PlayerGroup` order. */
export declare const PLAYER_GROUP_CHOICES: Choice[];
export declare const UNIT_CLASS_CHOICES: Choice[];
export declare const CHOICES: Partial<Record<ArgKind, Choice[]>>;
export declare function choiceLabel(kind: ArgKind, value: number): string | undefined;
export declare function choiceValue(kind: ArgKind, text: string): number | undefined;
/** Encode a four-character script code the way the action stores it (little-endian u32). */
/**
 * Where the deaths table starts in StarCraft 1.16.1's memory: `EPD(address)` is the player
 * value that reaches `address` through a Deaths condition or Set Deaths action (the
 * Classic editor's EPD box, and the trigger script's `Memory` / `SetMemory`).
 */
export declare const DEATHS_TABLE_ADDRESS = 5808996;
export declare function aiScriptCode(id: string): number;
export declare function aiScriptId(code: number): string;
/** The scripts StarEdit offers, by code. Campaign scripts print as their code. */
export declare const AI_SCRIPT_NAMES: Record<string, string>;
export declare const AI_SCRIPT_CHOICES: {
    id: string;
    name: string;
}[];
export declare function aiScriptName(code: number): string;
/** A script by display name or four-character code; undefined when neither matches. */
export declare function aiScriptByName(text: string): number | undefined;
