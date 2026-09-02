import { type IsomCheck } from "../editor/isom";
/** Above this share of rects disagreeing with their tiles, the ISOM is reported as stale. */
export declare const STALE_ISOM_SHARE = 0.02;
export type IsomStatus = {
    kind: "no-map";
} | {
    kind: "loading";
} | {
    kind: "no-tileset";
}
/** The map has no ISOM section (or a truncated one): the brush has nothing to work on. */
 | {
    kind: "missing";
} | {
    kind: "ready";
    check: IsomCheck;
    stale: boolean;
};
/**
 * Whether the open map can be painted isometrically, and how well its ISOM section
 * describes its tiles. Measured when a map opens (and after Rebuild ISOM), the way
 * SCMDraft checks on load — not after every stroke.
 */
export declare function useIsomStatus(): IsomStatus;
/**
 * Reconstruct the ISOM section from the tiles — for maps that arrived without one, or
 * whose ISOM no longer matches after Rect/Tile edits. One undoable step.
 */
export declare function useIsomRebuild(): () => void;
