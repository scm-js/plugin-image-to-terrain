/**
 * A trigger-cycle interpreter: runs a trigger list the way the game does for one player,
 * cycle by cycle, modelling exactly the state the structured level is built on — death
 * counters, switches, the preserve flag — and logging every other action as an event.
 *
 * It exists so the compiler can be *tested* (a program's triggers are run and the log
 * asserted, in `tests/script-structured.test.ts`) and so the Script editor can show what
 * a program does before the map is ever loaded in the game. It is not the game: Wait
 * takes no time, conditions about units (Bring, Command, …) are answered by a callback
 * (`false` by default), and only the one player runs.
 *
 * Semantics modelled: the list is walked in order once per cycle; a trigger runs when the
 * player owns it (or it is for All Players) and every enabled condition holds; actions run
 * in order; a trigger without the Preserve flag or a Preserve Trigger action runs once.
 * Deaths add wraps at 2³², subtract stops at 0 — the game's behaviour.
 */
import { type ActionRecord, type ConditionRecord, type TriggerRecord } from "../formats/chk/sections/triggers";
import type { ScriptString } from "./compiler";
export interface SimulationEvent {
    /** 0-based cycle. */
    cycle: number;
    /** Index of the trigger in the list. */
    trigger: number;
    action: ActionRecord;
    /** The action's text, when it has one and the simulation can resolve it. */
    text?: string;
}
export interface SimulationOptions {
    /** The player the triggers run as (0-based); default: the first player any trigger is owned by. */
    player?: number;
    /** Conditions the simulation does not model (Bring, Command, …). Default: false. */
    condition?: (c: ConditionRecord, sim: Simulation) => boolean;
    /** For Randomize Switch; default Math.random. */
    random?: () => number;
    /** Text of a string id — the compiler's local table, or a function over the map's. */
    strings?: ScriptString[] | ((index: number) => string | null);
    /** Stop a cycle after this many trigger runs (a runaway guard); default 100 000. */
    maxRunsPerCycle?: number;
}
export declare class Simulation {
    readonly triggers: TriggerRecord[];
    readonly player: number;
    readonly events: SimulationEvent[];
    readonly switches: Uint8Array<ArrayBuffer>;
    private readonly deaths;
    private readonly done;
    private readonly options;
    cycle: number;
    constructor(triggers: TriggerRecord[], options?: SimulationOptions);
    death(player: number, unit: number): number;
    setDeath(player: number, unit: number, value: number): void;
    /** `CurrentPlayer` is the running player; groups fall back to the running player too. */
    private resolvePlayer;
    text(index: number): string | undefined;
    /** Run one trigger cycle. */
    step(): void;
    run(cycles: number): this;
    private condition;
    private action;
}
/** Compile-result convenience: run a script's triggers for `cycles` cycles. */
export declare function simulate(triggers: TriggerRecord[], cycles: number, options?: SimulationOptions): Simulation;
