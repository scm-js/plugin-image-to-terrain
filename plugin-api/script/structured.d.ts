/**
 * The structured level's front end: walks the top-level statements that are not
 * `trigger()` calls — `let` variables, assignments, `if` / `while` / `do` / `for`,
 * `break` / `continue`, action calls, calls to the script's own functions — and drives
 * the trigger machine in `lower.ts`.
 *
 * What the language means, in the game's terms:
 *
 * - A `let` holding a number is a death counter (unsigned 32-bit, `-=` stops at 0); a
 *   `let` holding a boolean is a switch. `const`s stay compile-time constants.
 * - Statements run in order within one trigger cycle; a loop's back edge waits for the
 *   next cycle, so `while (true) { … }` is a game loop running once per cycle.
 * - `if (Bring(…) && x >= 3 || !flag)`: conditions are trigger conditions, comparisons
 *   of variables with constants, comparisons between variables (costly — see `lower.ts`),
 *   `&&`, `||`, `!`, and `random()`.
 * - `x = y + 3`, `x += y`, `x++`: linear arithmetic only; there is no multiplication
 *   between variables because the game has no instruction for it.
 * - Functions are inlined at each call — parameters bind to constants or, when an
 *   argument is a variable, to that variable (by reference). No recursion, no return
 *   values.
 *
 * Every trigger argument inside structured code is still a compile-time constant: the
 * point of variables is that *conditions and assignments* can read them.
 */
import type * as TS from "typescript";
import { type Compiler } from "./compiler";
import { Machine } from "./lower";
export declare class Structured {
    private readonly c;
    private readonly m;
    private readonly ts;
    /** After `break` / `continue` / `return` / an endless loop: the next statement needs a state of its own. */
    private dead;
    private inlineDepth;
    private scratchUsed;
    /** The program's outermost scope: what a function body closes over. */
    private topScope;
    constructor(c: Compiler, m: Machine);
    run(statements: TS.Statement[]): void;
    private lastLine;
    /** "L12: while (x < 3)" — the comment a generated trigger carries. */
    private label;
    private line;
    private live;
    private block;
    private statement;
    private declare;
    private kindOf;
    private expressionStatement;
    private ifStatement;
    private whileStatement;
    private doStatement;
    private forStatement;
    private inline;
    private assignNumber;
    /** `c + Σ ±v` over death counters, or null (with a diagnostic). */
    private linear;
    private assignBool;
    /** A condition as a `Bool` tree; may emit steps (temps for variable comparisons, a randomize). */
    private bool;
    private boolInner;
    private comparison;
}
