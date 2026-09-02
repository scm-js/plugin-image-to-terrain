/**
 * Edit ▸ Find: a text search over what is on the map, returning things the dialog can
 * jump to. Pure, so the matching is testable; names that need the game data (sprites)
 * come in through a callback.
 */
import type { Scenario } from "../formats/chk/scenario";
import { type SpriteRecord } from "../formats/chk/sections/objects";
export type FindKind = "units" | "locations" | "sprites" | "strings" | "triggers";
export declare const FIND_KINDS: {
    value: FindKind;
    label: string;
}[];
export interface FindResult {
    kind: FindKind;
    /** Index into the list the kind names (unit / sprite / trigger index, location slot, string index). */
    index: number;
    label: string;
    detail: string;
    /** Tile coordinates to centre on, where the thing has a position. */
    x?: number;
    y?: number;
}
export interface FindOptions {
    kind: FindKind;
    query: string;
    matchCase?: boolean;
    /** Display name of a sprite record (needs the game data); the id when omitted. */
    spriteName?: (r: SpriteRecord) => string;
    limit?: number;
}
/** Every string index a trigger's conditions and actions refer to (text, comments, labels, wav paths). */
export declare function triggerStrings(t: Scenario["triggers"][number]): number[];
export declare function findInScenario(scn: Scenario, options: FindOptions): FindResult[];
