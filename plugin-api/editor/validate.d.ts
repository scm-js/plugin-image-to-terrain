/**
 * Tools ▸ Check Map: what would stop the game loading the map, what will surprise a
 * player, and what is merely worth knowing. Pure over the scenario (plus the archive
 * extras for sound paths and the ISOM health the hook already measured), so the checks
 * are testable; `ValidateMapDialog` renders the list and jumps to the targets.
 */
import { type Scenario } from "../formats/chk/scenario";
import type { DialogId } from "../components/dialogs/ids";
import type { IsomStatus } from "./isom";
export type IssueLevel = "error" | "warn" | "info";
export type IssueTarget = {
    kind: "location";
    index: number;
} | {
    kind: "unit";
    index: number;
} | {
    kind: "trigger";
    index: number;
} | {
    kind: "dialog";
    id: DialogId;
};
export interface Issue {
    level: IssueLevel;
    text: string;
    where: string;
    target?: IssueTarget;
}
export interface ValidateContext {
    /** Non-scenario archive members, for the sound paths triggers play. */
    extras?: Map<string, Uint8Array>;
    /** The ISOM health `useIsomStatus` measured; omitted = not checked. */
    isom?: IsomStatus;
}
/** The game keeps at most this many units in play; StarEdit refuses to place more. */
export declare const UNIT_LIMIT = 1700;
/** String slots the game's fixed table holds. */
export declare const STR_CAPACITY = 1024;
export declare const STRX_CAPACITY = 65535;
export declare function validateScenario(scn: Scenario, ctx?: ValidateContext): Issue[];
/** Only the issues about triggers, briefings and switches — Triggers ▸ Validate Triggers. */
export declare function triggerIssues(issues: Issue[]): Issue[];
export declare function issueCounts(issues: Issue[]): Record<IssueLevel, number>;
