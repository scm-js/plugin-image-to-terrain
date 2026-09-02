/**
 * The structured level's back end: a *trigger machine* that turns straight-line code,
 * branches and loops into ordinary triggers — no memory tricks, so the output runs on
 * every StarCraft version, and it is exactly what a trigger-cycle interpreter can
 * simulate (`simulate.ts`, which the tests use to prove programs behave).
 *
 * The model, in four facts about how the game runs triggers:
 *
 * 1. Every trigger cycle the game walks a player's trigger list *in order* and runs each
 *    trigger whose conditions hold, once. So a run of triggers that each test
 *    `pc == S` and are placed in list order execute *sequentially within one cycle* —
 *    a basic block is a sequence of triggers sharing a state number.
 * 2. Setting `pc` to a *later* state continues in the same cycle (its triggers are further
 *    down the list); setting it to an *earlier* state resumes next cycle. Forward control
 *    flow is free; a loop's back edge costs one trigger cycle, which is what a game loop
 *    wants anyway (every ~2 s at Normal speed, every frame with hyper triggers).
 * 3. Two triggers in the same state, one with an extra condition, give negation for free:
 *    `[pc == S, C] → pc = THEN` followed by `[pc == S] → pc = ELSE` — the second only
 *    fires when the first did not. Conditions the game cannot negate (Command the Most)
 *    become "skip" steps the same way.
 * 4. Variables are death counters — `Deaths` / `Set Deaths` on units that never die —
 *    unsigned 32-bit, subtraction saturating at 0. `x += 5` is one action; `x += y` is the
 *    classic binary decomposition (32 conditioned steps moving `y` into `x` and a temp,
 *    32 moving the temp back), so a variable-to-variable operation costs 64 triggers.
 *    Booleans are switches.
 *
 * The machine is deliberately ignorant of TypeScript: the compiler walks the AST and
 * calls `Machine` with records; `Bool` trees carry ready-made condition records. Every
 * generated trigger is preserved and owned by one player — the program is a single
 * thread running as that player.
 */
import { type ActionRecord, type ConditionRecord, type TriggerRecord } from "../formats/chk/sections/triggers";
export interface DcVar {
    kind: "dc";
    name: string;
    player: number;
    unit: number;
}
export interface SwVar {
    kind: "switch";
    name: string;
    index: number;
}
export type Var = DcVar | SwVar;
/**
 * Units whose death counters are safe to use as variables: they can never die because
 * nothing can create them — the "(Unused)" entries of units.dat, Cantina first (the
 * community's classic choice). Twelve players per unit, so eighteen units give 216 slots.
 */
export declare const VARIABLE_UNITS: readonly number[];
export declare const PLAYER_SLOTS = 12;
/**
 * Hands out storage: death counters player-major over `units` (so the first twelve
 * variables share one unit id), switches from 255 downwards. Slots that the map's hand
 * triggers already touch are skipped.
 */
export declare class Allocator {
    private readonly units;
    private readonly reservedDc;
    private readonly reservedSw;
    private nextDc;
    private nextSw;
    readonly variables: Var[];
    constructor(options?: {
        units?: readonly number[];
        reservedDeaths?: readonly (readonly [number, number])[];
        reservedSwitches?: readonly number[];
    });
    dc(name: string): DcVar | null;
    switch(name: string): SwVar | null;
}
/** "P3 · Cantina (Unused)" / "Switch 256" — where a variable lives, for the UI. */
export declare function storageLabel(v: Var): string;
export declare function deathsCondition(v: DcVar, comparison: number, amount: number): ConditionRecord;
export declare function setDeaths(v: DcVar, modifier: number, amount: number): ActionRecord;
export declare function switchCondition(v: SwVar, set: boolean): ConditionRecord;
export declare function setSwitch(v: SwVar, action: number): ActionRecord;
export declare const U32_MAX = 4294967295;
export type Bool = {
    kind: "const";
    value: boolean;
} | {
    kind: "cond";
    cond: ConditionRecord;
} | {
    kind: "not";
    expr: Bool;
} | {
    kind: "and";
    items: Bool[];
} | {
    kind: "or";
    items: Bool[];
};
export declare const TRUE: Bool;
export declare const FALSE: Bool;
export declare const cond: (c: ConditionRecord) => Bool;
export declare const not: (expr: Bool) => Bool;
export declare const and: (items: Bool[]) => Bool;
export declare const or: (items: Bool[]) => Bool;
/**
 * The conditions equivalent to `!c` — a disjunction — or null when the game has no way to
 * say it (then the branch lowering tests `c` and skips). Comparisons flip around their
 * amount: `at least n` ↔ `at most n − 1`, `exactly n` ↔ `at most n − 1 | at least n + 1`.
 */
export declare function negateCondition(c: ConditionRecord): ConditionRecord[] | null;
export interface Literal {
    cond: ConditionRecord;
    negative: boolean;
}
/** A product of literals; `[]` is `true`. */
export type Product = Literal[];
export declare const MAX_PRODUCTS = 256;
/**
 * Disjunctive normal form: a list of products, any of which passing means the expression
 * holds. `[]` is `false`, `[[]]` is `true`. Negation is pushed to the leaves and resolved
 * through `negateCondition` where the game can express it.
 */
export declare function toDnf(b: Bool): Product[];
export declare class LowerError extends Error {
}
export interface MachineOptions {
    /** The player the program runs as (0-based). */
    owner: number;
    allocator: Allocator;
    /** Local string id for a text (see `CompileResult.strings`); comments are dropped when absent. */
    comment?: (text: string) => number;
}
/** The most user actions one step carries: 64 minus the comment and the `pc` set. */
export declare const STEP_ACTIONS: number;
/** The most conditions one step tests besides `pc`. */
export declare const STEP_CONDITIONS: number;
export declare class Machine {
    readonly owner: number;
    readonly allocator: Allocator;
    readonly triggers: TriggerRecord[];
    /** Per trigger, the source line it came from. */
    readonly lines: number[];
    readonly pc: DcVar;
    /** The state whose steps are being emitted. State 0 is the entry: every counter is 0 at game start. */
    state: number;
    private nextState;
    private stepsInState;
    private readonly pending;
    private pendingLine;
    private pendingLabel;
    private readonly comment?;
    private readonly temps;
    private tempsInUse;
    private readonly scratches;
    constructor(options: MachineOptions);
    fresh(): number;
    /** The state that runs when the program has finished: nothing tests it. */
    get halt(): number;
    enter(state: number): void;
    /** Scratch counters for arithmetic: acquired in a stack, zeroed on acquisition by the caller. */
    temp(): DcVar;
    release(n?: number): void;
    /** Scratch switches for `random()`: one per use within an expression, so two draws are independent. */
    scratch(i: number): SwVar;
    private raw;
    /** Queue an action for the current state; it is written out with the next step. */
    action(a: ActionRecord, line: number, label: string): void;
    flush(): void;
    /** One trigger in the current state: extra conditions, actions, and optionally a jump. Pending actions go first. */
    step(conds: ConditionRecord[], actions: ActionRecord[], next: number | null, line: number, label: string): void;
    /** End the current state: write the pending actions and move to `target`. */
    jump(target: number, line: number, label: string): void;
    /** Jump to a fresh state and continue there. */
    next(line: number, label: string): number;
    /**
     * A loop header: the state a back edge returns to. When the current state is still empty
     * it is the header itself — the common `while (true)` at the top of a program then needs
     * no extra trigger.
     */
    loopHeader(line: number, label: string): number;
    set(v: DcVar, n: number, line: number, label: string): void;
    addConst(v: DcVar, n: number, line: number, label: string): void;
    /** `dst += src` (or `-=`), `src` intact afterwards: the binary decomposition through a temp. */
    addVar(dst: DcVar, src: DcVar, subtract: boolean, line: number, label: string): void;
    /** `dst += src; src = 0` — half the price of `addVar` when `src` is dead afterwards. */
    move(src: DcVar, dst: DcVar, line: number, label: string): void;
    /**
     * `x = c + Σ ±v`: constants first, additions before subtractions (so saturation only
     * bites when the true result is negative), through a temp when `x` itself is a term
     * anywhere but as the single leading `+x`.
     */
    assign(x: DcVar, expr: Linear, line: number, label: string): void;
    /** Compute a linear expression into a temp (zeroed first). */
    evaluate(t: DcVar, expr: Linear, line: number, label: string): void;
    /**
     * `a op b` for two counters as a `Bool` over saturating differences computed now, into
     * temps the caller releases after the branch (`releaseAfterCompare`).
     */
    compareVars(a: DcVar, op: CompareOp, b: DcVar, line: number, label: string): {
        bool: Bool;
        temps: number;
    };
    /**
     * End the current state with a conditional jump. Each product of the condition's DNF is
     * one trigger; negative literals are "skip" steps to the next product's state; the last
     * fallthrough goes to `elseState`.
     */
    branch(b: Bool, thenState: number, elseState: number, line: number, label: string): void;
    /** How many temps are held right now; `releaseTo` gives them back after a branch has read them. */
    get tempsHeld(): number;
    releaseTo(n: number): void;
}
export type CompareOp = "<" | "<=" | ">" | ">=" | "==" | "!=";
/** `c + Σ sign·v` — what the compiler reduces a numeric expression to. */
export interface Linear {
    c: number;
    terms: {
        v: DcVar;
        sign: 1 | -1;
    }[];
}
export declare function flipOp(op: CompareOp): CompareOp;
/** `v op n` against a constant, as a game condition (unsigned: `v < 0` is false, `v >= -3` true). */
export declare function compareConst(v: DcVar, op: CompareOp, n: number): Bool;
/**
 * The community's hyper triggers: three preserved triggers of 62 `Wait(0)`s each make the
 * game run the whole trigger loop every frame instead of every two seconds. Owned by one
 * player; their waits stall that player's other `Wait` actions ("wait blocks"), so give
 * them a player whose triggers never wait.
 */
export declare function hyperTriggers(owner: number, comment?: (text: string) => number): TriggerRecord[];
