/**
 * TRIG / MBRF: triggers and mission briefings, 2400 bytes each.
 *
 * Both sections share one record layout — sixteen 20-byte conditions, sixty-four 32-byte
 * actions, an execution-flag word, 27 player-group bytes and the game's "current action"
 * byte — and differ only in what the condition/action type bytes mean (a briefing's
 * conditions are all `ConditionType.Briefing` and its actions index `BriefingActionType`).
 *
 * Records are kept close to the bytes: every field of a condition/action is a plain number
 * and the *meaning* of a field for a given type (which of them is the location, which the
 * player, …) lives in `src/data/triggerDefs.ts`, so the codec never has to know a Bring
 * from a Set Deaths. The decoded lists drop only *trailing* empty slots; anything after a
 * type-0 entry that the game would never reach is preserved so a map round-trips.
 *
 * Format reference: https://wiki.staredit.net/wiki/Scenario.chk#.22TRIG.22_-_Triggers
 */
import { Reader, Writer } from "../binary";
export declare const TRIGGER_STRIDE = 2400;
export declare const CONDITION_STRIDE = 20;
export declare const ACTION_STRIDE = 32;
export declare const MAX_CONDITIONS = 16;
export declare const MAX_ACTIONS = 64;
/** Player-group bytes per trigger (`PlayerGroup` indices). */
export declare const PLAYER_GROUP_COUNT = 27;
export interface ConditionRecord {
    /** 1-based location number, 0 = none. */
    location: number;
    /** `PlayerGroup`. */
    player: number;
    amount: number;
    unitId: number;
    /** `Comparison` for numeric conditions; `SwitchState` for Switch. */
    comparison: number;
    /** `ConditionType`. */
    type: number;
    /** `ResourceType` / `ScoreType` / switch number, per type. */
    resource: number;
    /** `ConditionFlag` bits. */
    flags: number;
    /** EUD mask word; 0 in ordinary maps. */
    mask: number;
}
export interface ActionRecord {
    /** 1-based source location, 0 = none. */
    location: number;
    /** String index for text / comment / leaderboard label, 0 = none. */
    text: number;
    /** String index of the WAV file name, 0 = none. */
    wav: number;
    /** Milliseconds for Wait / Transmission / Talking Portrait; WAV duration for Play WAV. */
    time: number;
    /** `PlayerGroup` (first). */
    player: number;
    /** Second player / destination location / amount / AI script code, per type. */
    target: number;
    /** Unit id / `ScoreType` / `ResourceType` / `AllianceStatus`, per type. */
    unitId: number;
    /** `ActionType` (or `BriefingActionType` in MBRF). */
    type: number;
    /** Unit count (0 = all) / `SetModifier` / `SwitchAction` / `Order` / `UnitState`, per type. */
    modifier: number;
    /** `ActionFlag` bits. */
    flags: number;
    padding: number;
    /** EUD mask word; 0 in ordinary maps. */
    mask: number;
}
export interface TriggerRecord {
    conditions: ConditionRecord[];
    actions: ActionRecord[];
    /** `TriggerFlag` bits. */
    flags: number;
    /** 27 bytes, one per `PlayerGroup`; non-zero = the trigger runs for that group. */
    players: number[];
    /** The game's bookkeeping byte (offset 2399); StarEdit writes 0. */
    currentAction: number;
}
export declare const ConditionType: {
    readonly None: 0;
    readonly CountdownTimer: 1;
    readonly Command: 2;
    readonly Bring: 3;
    readonly Accumulate: 4;
    readonly Kill: 5;
    readonly CommandTheMost: 6;
    readonly CommandTheMostAt: 7;
    readonly MostKills: 8;
    readonly HighestScore: 9;
    readonly MostResources: 10;
    readonly Switch: 11;
    readonly ElapsedTime: 12;
    readonly Briefing: 13;
    readonly Opponents: 14;
    readonly Deaths: 15;
    readonly CommandTheLeast: 16;
    readonly CommandTheLeastAt: 17;
    readonly LeastKills: 18;
    readonly LowestScore: 19;
    readonly LeastResources: 20;
    readonly Score: 21;
    readonly Always: 22;
    readonly Never: 23;
};
export declare const ActionType: {
    readonly None: 0;
    readonly Victory: 1;
    readonly Defeat: 2;
    readonly PreserveTrigger: 3;
    readonly Wait: 4;
    readonly PauseGame: 5;
    readonly UnpauseGame: 6;
    readonly Transmission: 7;
    readonly PlayWav: 8;
    readonly DisplayText: 9;
    readonly CenterView: 10;
    readonly CreateUnitWithProperties: 11;
    readonly SetMissionObjectives: 12;
    readonly SetSwitch: 13;
    readonly SetCountdownTimer: 14;
    readonly RunAiScript: 15;
    readonly RunAiScriptAt: 16;
    readonly LeaderboardControl: 17;
    readonly LeaderboardControlAt: 18;
    readonly LeaderboardResources: 19;
    readonly LeaderboardKills: 20;
    readonly LeaderboardPoints: 21;
    readonly KillUnit: 22;
    readonly KillUnitAt: 23;
    readonly RemoveUnit: 24;
    readonly RemoveUnitAt: 25;
    readonly SetResources: 26;
    readonly SetScore: 27;
    readonly MinimapPing: 28;
    readonly TalkingPortrait: 29;
    readonly MuteUnitSpeech: 30;
    readonly UnmuteUnitSpeech: 31;
    readonly LeaderboardComputerPlayers: 32;
    readonly LeaderboardGoalControl: 33;
    readonly LeaderboardGoalControlAt: 34;
    readonly LeaderboardGoalResources: 35;
    readonly LeaderboardGoalKills: 36;
    readonly LeaderboardGoalPoints: 37;
    readonly MoveLocation: 38;
    readonly MoveUnit: 39;
    readonly LeaderboardGreed: 40;
    readonly SetNextScenario: 41;
    readonly SetDoodadState: 42;
    readonly SetInvincibility: 43;
    readonly CreateUnit: 44;
    readonly SetDeaths: 45;
    readonly Order: 46;
    readonly Comment: 47;
    readonly GiveUnits: 48;
    readonly ModifyHitPoints: 49;
    readonly ModifyEnergy: 50;
    readonly ModifyShields: 51;
    readonly ModifyResourceAmount: 52;
    readonly ModifyHangarCount: 53;
    readonly PauseTimer: 54;
    readonly UnpauseTimer: 55;
    readonly Draw: 56;
    readonly SetAllianceStatus: 57;
    readonly DisableDebugMode: 58;
    readonly EnableDebugMode: 59;
};
export declare const BriefingActionType: {
    readonly None: 0;
    readonly Wait: 1;
    readonly PlayWav: 2;
    readonly TextMessage: 3;
    readonly MissionObjectives: 4;
    readonly ShowPortrait: 5;
    readonly HidePortrait: 6;
    readonly DisplaySpeakingPortrait: 7;
    readonly Transmission: 8;
    readonly SkipTutorialEnabled: 9;
};
/** The 27 player-group slots of a trigger, and the values conditions/actions store. */
export declare const PlayerGroup: {
    readonly Player1: 0;
    readonly Player2: 1;
    readonly Player3: 2;
    readonly Player4: 3;
    readonly Player5: 4;
    readonly Player6: 5;
    readonly Player7: 6;
    readonly Player8: 7;
    readonly Player9: 8;
    readonly Player10: 9;
    readonly Player11: 10;
    readonly Player12: 11;
    readonly None: 12;
    readonly CurrentPlayer: 13;
    readonly Foes: 14;
    readonly Allies: 15;
    readonly NeutralPlayers: 16;
    readonly AllPlayers: 17;
    readonly Force1: 18;
    readonly Force2: 19;
    readonly Force3: 20;
    readonly Force4: 21;
    readonly Unused1: 22;
    readonly Unused2: 23;
    readonly Unused3: 24;
    readonly Unused4: 25;
    readonly NonAlliedVictoryPlayers: 26;
};
export declare const Comparison: {
    readonly AtLeast: 0;
    readonly AtMost: 1;
    readonly Exactly: 10;
};
export declare const SwitchState: {
    readonly Set: 2;
    readonly Cleared: 3;
};
export declare const SwitchAction: {
    readonly Set: 4;
    readonly Clear: 5;
    readonly Toggle: 6;
    readonly Randomize: 11;
};
export declare const SetModifier: {
    readonly SetTo: 7;
    readonly Add: 8;
    readonly Subtract: 9;
};
/** Set Doodad State / Set Invincibility. */
export declare const UnitState: {
    readonly Enable: 4;
    readonly Disable: 5;
    readonly Toggle: 6;
};
export declare const Order: {
    readonly Move: 0;
    readonly Patrol: 1;
    readonly Attack: 2;
};
export declare const AllianceStatus: {
    readonly Enemy: 0;
    readonly Ally: 1;
    readonly AlliedVictory: 2;
};
export declare const ResourceType: {
    readonly Ore: 0;
    readonly Gas: 1;
    readonly OreAndGas: 2;
};
export declare const ScoreType: {
    readonly Total: 0;
    readonly Units: 1;
    readonly Buildings: 2;
    readonly UnitsAndBuildings: 3;
    readonly Kills: 4;
    readonly Razings: 5;
    readonly KillsAndRazings: 6;
    readonly Custom: 7;
};
/** Unit ids beyond units.dat that conditions and actions accept. */
export declare const UnitClass: {
    readonly Any: 228;
    readonly Men: 229;
    readonly Buildings: 230;
    readonly Factories: 231;
};
export declare const ConditionFlag: {
    /** Game bookkeeping. */
    readonly Unknown: 1;
    readonly Disabled: 2;
    readonly AlwaysDisplay: 4;
    readonly UnitPropertiesUsed: 8;
    readonly UnitTypeUsed: 16;
    readonly UnitIdUsed: 32;
};
export declare const ActionFlag: {
    /** Ignore a Wait / Transmission once (game bookkeeping). */
    readonly IgnoreWaitOnce: 1;
    readonly Disabled: 2;
    readonly AlwaysDisplay: 4;
    readonly UnitPropertiesUsed: 8;
    readonly UnitTypeUsed: 16;
    readonly UnitIdUsed: 32;
};
export declare const TriggerFlag: {
    /** Game bookkeeping: every condition was met this cycle. */
    readonly ConditionsMet: 1;
    /** Ignore Defeat / Draw for this trigger. */
    readonly IgnoreGameEnd: 2;
    /** Same as a Preserve Trigger action. */
    readonly Preserve: 4;
    /** The trigger never runs. */
    readonly Disabled: 8;
    /** Skip Wait / text / view actions for the rest of this loop (game bookkeeping). */
    readonly IgnoreDisplay: 16;
    /** Game bookkeeping. */
    readonly Paused: 32;
    /** Game bookkeeping. */
    readonly WaitSkipDisabled: 64;
};
export declare function emptyCondition(): ConditionRecord;
export declare function emptyAction(): ActionRecord;
export declare function emptyTrigger(): TriggerRecord;
export declare function decodeTrigger(r: Reader): TriggerRecord;
export declare function decodeTriggers(data: Uint8Array): TriggerRecord[];
export declare function encodeTrigger(w: Writer, t: TriggerRecord): void;
export declare function encodeTriggers(triggers: TriggerRecord[]): Uint8Array;
/** Deep copy, for working copies and duplicates. */
export declare function cloneTrigger(t: TriggerRecord): TriggerRecord;
export declare const SWITCH_COUNT = 256;
export declare function decodeSwitchNames(data: Uint8Array): number[];
export declare function encodeSwitchNames(names: number[]): Uint8Array;
