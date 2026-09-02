/**
 * The vocabulary the trigger script shares between its three consumers — the generated
 * declarations (`declarations.ts`), the compiler (`compiler.ts`) and the printer
 * (`print.ts`): which identifier each condition/action goes by, what TypeScript type each
 * argument kind has, and the string unions the enumerated kinds accept.
 *
 * Identifiers are the `ConditionType` / `ActionType` keys (`Bring`, `DisplayText`,
 * `KillUnitAt`) rather than TrigEdit's spaced names, so the script reads like code;
 * argument order is still the table's, so a text trigger and its script form line up.
 */
import { type ActionDef, type ArgKind, type ConditionDef } from "../data/triggerDefs";
export declare function conditionIdent(type: number): string | undefined;
export declare function actionIdent(type: number): string | undefined;
/** Script identifier → definition. Mission Briefing is a briefing-only condition and has no script form. */
export declare const CONDITION_IDENTS: ReadonlyMap<string, ConditionDef>;
export declare const ACTION_IDENTS: ReadonlyMap<string, ActionDef>;
/** The names of the string-union types for enumerated argument kinds. */
export declare const CHOICE_TYPES: Partial<Record<ArgKind, string>>;
/** Every spelling a choice kind accepts, in table order (labels first, then aliases). */
export declare function choiceSpellings(kind: ArgKind): string[];
/** The TypeScript type of an argument of this kind. */
export declare function argType(kind: ArgKind): string;
/** A parameter name for an argument label: `Unit at` → `unitAt`; reserved words get a trailing underscore. */
export declare function paramName(label: string): string;
export declare const IDENTIFIER: RegExp;
/** A property key as it appears in a declaration: bare when it is an identifier, quoted otherwise. */
export declare function propertyKey(key: string): string;
/** A member access as it appears in a script: `Units.TerranMarine` or `Units["Terran Marine"]`. */
export declare function memberAccess(object: string, key: string): string;
