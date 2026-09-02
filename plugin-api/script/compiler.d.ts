/**
 * The trigger script compiler: a TypeScript program checked against the generated
 * declarations and lowered to `TriggerRecord`s, at two levels.
 *
 * The *raw* level is `trigger(players, conditions, actions)` calls and `const`s — one
 * call, one record. The *structured* level is everything else at the top level: `let`
 * variables, assignments, `if` / `while` / `for`, functions, action calls as statements.
 * Those statements form one program that `structured.ts` walks and `lower.ts` turns into a
 * death-counter state machine — a run of preserved triggers owned by one player, appended
 * after the raw triggers (see `lower.ts` for the execution model).
 *
 * The compiler owns no parser: it builds a real TypeScript program (`noLib`, the
 * declarations plus the script) and walks its AST, and it owns no name tables either —
 * `Units.TerranMarine` is a property whose *type* is the literal `0 & Brand<"unit">`, so
 * every argument is evaluated by asking the checker for the expression's literal type,
 * falling back to folding arithmetic and following `const` initialisers. Anything that is
 * not a compile-time constant is an error, except a `let` variable where structured code
 * allows one.
 *
 * Strings are not interned here (the compiler may run in a worker, away from the
 * scenario): text/wav fields hold local ids into `strings`, resolved by the build step.
 * The `typescript` namespace is passed in so tests (Node) and the worker (bundled) share
 * one implementation.
 */
import type * as TS from "typescript";
import { type ActionRecord, type ConditionRecord, type TriggerRecord } from "../formats/chk/sections/triggers";
import { type ArgKind } from "../data/triggerDefs";
import { LowerError, type Var } from "./lower";
export declare const SCRIPT_FILE = "triggers.ts";
/** `Memory(address, …)` reads `Deaths` at player `EPD(address)`, unit 0: the deaths table starts here in 1.16.1's memory. */
export declare const DEATHS_TABLE_ADDRESS = 5808996;
export interface ScriptDiagnostic {
    /** 1-based. */
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    message: string;
    source: "typescript" | "compiler";
}
/** A string a record refers to: text to intern, or an existing string-table index (raw forms). */
export type ScriptString = {
    text: string;
} | {
    index: number;
};
export interface VariableInfo {
    name: string;
    kind: "number" | "boolean";
    /** Where it lives: "P3 · Cantina (Unused)" or "Switch 256". */
    storage: string;
    /** Death counter (numbers). */
    player?: number;
    unit?: number;
    /** Switch index (booleans). */
    switch?: number;
}
export interface ProgramInfo {
    /** The player the program runs as (0-based). */
    owner: number;
    /** Index into `triggers` of the program's first trigger. */
    start: number;
    /** Program triggers, hyper triggers excluded. */
    count: number;
    hyperTriggers: boolean;
}
export interface CompileResult {
    triggers: TriggerRecord[];
    /** Per trigger, the 1-based line of its `trigger(` call or of the statement it came from. */
    lines: number[];
    /** Local string table: a record's `text` / `wav` field `k > 0` means `strings[k - 1]`. */
    strings: ScriptString[];
    diagnostics: ScriptDiagnostic[];
    /** The structured program's variables (temporaries and the program counter included), in allocation order. */
    variables: VariableInfo[];
    /** The structured program, when the script has one. */
    program: ProgramInfo | null;
    /** No errors: `triggers` is the complete program. */
    ok: boolean;
}
export interface CompileOptions {
    /** Death counters (player, unit) the map's hand triggers use; variables avoid them. */
    reservedDeaths?: readonly (readonly [number, number])[];
    /** Switches the map's hand triggers use or name; variables avoid them. */
    reservedSwitches?: readonly number[];
}
export type Const = {
    n: number;
} | {
    s: string;
};
/** What an identifier means inside structured code: a constant (function parameter) or a variable. */
export type Binding = {
    kind: "const";
    value: Const;
} | {
    kind: "var";
    v: Var;
};
/** Bindings keyed by declaration node, so shadowing and inlined functions resolve exactly as the checker does. */
export declare class Scope {
    private readonly map;
    readonly parent: Scope | null;
    constructor(parent: Scope | null);
    bind(decl: TS.Node, b: Binding): void;
    lookup(decl: TS.Node): Binding | undefined;
}
export interface ProgramOptions {
    owner: number;
    hyperTriggers: number | null;
    comments: boolean;
    variableUnits: number[];
}
export declare class Compiler {
    readonly ts: typeof TS;
    readonly checker: TS.TypeChecker;
    readonly sf: TS.SourceFile;
    readonly diagnostics: ScriptDiagnostic[];
    readonly strings: ScriptString[];
    readonly triggers: TriggerRecord[];
    readonly lines: number[];
    readonly variables: VariableInfo[];
    program: ProgramInfo | null;
    readonly options: CompileOptions;
    /** The structured program's innermost scope while it is being lowered; null in raw code. */
    scope: Scope | null;
    constructor(ts: typeof TS, program: TS.Program, sf: TS.SourceFile, options: CompileOptions);
    error(node: TS.Node, message: string): void;
    lineOf(node: TS.Node): number;
    localString(s: ScriptString): number;
    /** Is this call to one of the runtime's functions (declared in the generated file), by name? */
    isRuntimeCall(e: TS.Node, name: string): e is TS.CallExpression;
    /** The script's own declaration an identifier refers to (a `let`, a parameter, a function), if any. */
    scriptDeclaration(id: TS.Identifier): TS.Declaration | undefined;
    /** The structured binding of an identifier, if it has one. */
    binding(expr: TS.Expression): Binding | undefined;
    varOf(expr: TS.Expression): Var | undefined;
    run(): void;
    /** `program({ owner, hyperTriggers, comments, variableUnits })`, defaults filled in. */
    programOptions(call: TS.CallExpression | null): ProgramOptions;
    trigger(call: TS.CallExpression): void;
    /** Strip parentheses, `as`, `satisfies`, `!` — the wrappers that change nothing at compile time. */
    unwrap(expr: TS.Expression): TS.Expression;
    /** The `const` initialiser an identifier refers to, if it is one. */
    initializer(expr: TS.Expression): TS.Expression | undefined;
    /** Follow wrappers and `const` references down to the expression that carries the value. */
    resolve(expr: TS.Expression, depth?: number): TS.Expression;
    /** The elements of an array expression (spreads flattened), or null when it is not an array. */
    list(expr: TS.Expression, depth?: number): TS.Expression[] | null;
    items(expr: TS.Expression, kind: "condition" | "action"): (ConditionRecord | ActionRecord)[];
    item(expr: TS.Expression, kind: "condition" | "action", depth?: number): ConditionRecord | ActionRecord | null;
    /** One argument's record value, by kind; undefined (with a diagnostic) when it is not a usable constant. */
    arg(kind: ArgKind, expr: TS.Expression): number | undefined;
    /** The constant an expression evaluates to, or undefined. */
    value(expr: TS.Expression, depth?: number): Const | undefined;
}
export { LowerError };
/** Compile a script against a declaration file. Never throws for script errors — read `diagnostics`. */
export declare function compileScript(ts: typeof TS, source: string, declarations: string, options?: CompileOptions): CompileResult;
