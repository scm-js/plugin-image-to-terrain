/**
 * Location (MRGN) edits as invertible change lists.
 *
 * MRGN is a fixed table of slots — 64 in original maps, 255 in Brood War — so unlike
 * units and sprites nothing is ever inserted or removed: a "new" location fills the
 * lowest unused slot and "deleting" one blanks its slot. A `LocationChange` is therefore
 * always a replacement, `before` and `after` both whole records, and selection indices
 * survive every edit. Naming a location may also add a string to the table (`string`),
 * which undo takes out again; like StarEdit, an identical string already in the table
 * is reused rather than stored twice.
 *
 * Slot 63 — "Anywhere", the 64th location — is special: it is the location every
 * trigger's "Anywhere" refers to, StarEdit pins it to the map bounds and refuses to move,
 * resize, rename or delete it, and some maps deliberately depend on it being exactly
 * that. Nothing here changes it except `restoreAnywhere`, and `locationAt` never picks
 * it, so a click on the map cannot land on it.
 */
import { type Scenario } from "../formats/chk/scenario";
import { type LocationRecord } from "../formats/chk/sections/objects";
export interface LocationStringChange {
    index: number;
    before: string | null;
    after: string | null;
}
export interface LocationChange {
    index: number;
    before: LocationRecord;
    after: LocationRecord;
    /** A string slot the edit adds (a name no existing string matched); removed again on undo. */
    string?: LocationStringChange;
}
/** StarEdit writes 64 slots for original / hybrid maps and 255 for Brood War ones. */
export declare const ORIGINAL_LOCATION_SLOTS = 64;
export declare const BW_LOCATION_SLOTS = 255;
export declare const ANYWHERE_NAME = "Anywhere";
export declare function blankLocation(): LocationRecord;
/** How many slots the map's MRGN has room for (a longer table than expected is kept as it is). */
export declare function locationCapacity(scn: Scenario): number;
/**
 * Grow a short table to its capacity with blank slots. Blank slots mean nothing to the
 * game, so this is not an undoable edit — it just makes room. True when it grew.
 */
export declare function ensureLocationSlots(scn: Scenario): boolean;
export interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export declare function normalizeBounds(b: Bounds): Bounds;
/** MRGN allows right < left / bottom < top; the game reads such a location as its normalised box, and some maps use the trick. */
export declare function isInverted(r: Bounds): boolean;
/** A record's box, normalised. */
export declare function boundsOf(r: Bounds): Bounds;
export declare function clampBounds(b: Bounds, scn: {
    width: number;
    height: number;
}): Bounds;
export declare function sameBounds(a: Bounds, b: Bounds): boolean;
/** Round to the nearest multiple of `step` (0 = no snapping). */
export declare function snapTo(v: number, step: number): number;
/**
 * The box a create-drag from `from` to `to` makes. With snapping on it is every grid cell
 * the drag touched, so a drag inside one tile makes a one-tile location the way StarEdit
 * does; without, the raw pixel rectangle.
 */
export declare function dragBounds(from: {
    px: number;
    py: number;
}, to: {
    px: number;
    py: number;
}, step: number, scn: {
    width: number;
    height: number;
}): Bounds;
export type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
export declare const HANDLES: readonly Handle[];
export declare function handlePoint(b: Bounds, h: Handle): {
    x: number;
    y: number;
};
/** The handle within `tolerance` map pixels of the point, corners winning over edges. */
export declare function handleAt(b: Bounds, px: number, py: number, tolerance: number): Handle | null;
export declare const HANDLE_CURSOR: Record<Handle, string>;
/** `origin` with the edge(s) the handle owns moved to the (snapped) pointer; crossing an edge flips the box. */
export declare function resizeBounds(origin: Bounds, h: Handle, px: number, py: number, step: number): Bounds;
/** The location's name, or StarEdit's default for its slot. */
export declare function locationName(scn: Scenario, index: number): string;
/** Indices of the slots in use, Anywhere included. */
export declare function usedLocations(scn: Scenario): number[];
/**
 * The location under a map pixel: the *smallest* one containing it, so a small location
 * inside a big one can still be picked; equal areas go to the higher slot. Anywhere is
 * never picked.
 */
export declare function locationAt(scn: Scenario, px: number, py: number): number;
/** The lowest unused slot other than Anywhere, or -1 when the table is full. */
export declare function firstFreeSlot(scn: Scenario): number;
export declare function anywhereBounds(scn: {
    width: number;
    height: number;
}): Bounds;
/** Whether slot 63 is what StarEdit keeps it as: named, and exactly the map. */
export declare function isAnywhereIntact(scn: Scenario): boolean;
/**
 * Put Anywhere back in slot 63 — the map's bounds and a name — when it is missing or
 * has drifted. The existing name and elevation flags are kept when there are any; only
 * an unnamed slot gets "Anywhere". Null when it is already intact.
 */
export declare function restoreAnywhere(scn: Scenario, pending?: LocationStringChange[]): LocationChange | null;
/**
 * A new location in the lowest free slot, named `Location <slot>` unless told otherwise.
 * A map whose Anywhere is missing gets it back in the same step. `index` is -1 when every
 * slot is taken (call `ensureLocationSlots` first so a short table has its full capacity).
 */
export declare function addLocation(scn: Scenario, bounds: Bounds, name?: string, elevationFlags?: number): {
    index: number;
    changes: LocationChange[];
};
/**
 * Shift locations by a pixel delta, clamped so the whole group stays on the map. An
 * inverted box keeps its inversion: all four edges move together.
 */
export declare function moveLocations(scn: Scenario, indices: number[], dx: number, dy: number): LocationChange[];
/** Give a location new bounds (normalised and clamped); a zero-area box or no change yields nothing. */
export declare function resizeLocation(scn: Scenario, index: number, bounds: Bounds): LocationChange[];
export interface LocationPatch {
    name?: string;
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
    elevationFlags?: number;
}
/**
 * Change any of a location's fields as one step. Bounds are taken as given (not
 * normalised — the properties dialog may set an inverted box on purpose) but clamped
 * to the map; an empty name clears the string reference. Nothing for Anywhere.
 */
export declare function editLocation(scn: Scenario, index: number, patch: LocationPatch): LocationChange | null;
/** Blank the slots at `indices`; the name strings stay in the table (StarEdit leaves them too). */
export declare function removeLocations(scn: Scenario, indices: number[]): LocationChange[];
export declare function applyLocationChanges(scn: Scenario, changes: readonly LocationChange[], direction?: "do" | "undo"): void;
