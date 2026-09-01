/**
 * Cut / Copy / Paste: a rectangle of the map lifted into a `Clip` and stamped back down
 * anywhere, as one undo step each way.
 *
 * A clip is self-contained — tiles, ground, doodad / unit / sprite records and locations
 * with their positions made relative to the rectangle's top-left, plus the fog bytes —
 * so it survives the map it came from being closed. Which parts a copy captures and a
 * paste writes is the palette's *Include* set (`ClipParts`); a part that was never
 * captured is simply not there to paste.
 *
 * Terrain is carried as two layers, MTXM (`tiles`, the picture) and TILE (`ground`, the
 * terrain under the doodads), so a paste with doodads reproduces both sections as they
 * were, and a paste *without* them lays down the ground the doodads stood on rather than
 * half a tree. Doodads travel as records and are re-stamped from the catalogue at the
 * destination (overlay sprites regenerated, as `placeDoodad` does), units get fresh
 * serials with their add-on / nydus links remapped, and locations take free slots — the
 * only part that can run out of room. Objects belong to the rectangle by their anchor:
 * a unit or sprite by its centre, a doodad or location when its whole box is inside.
 *
 * `pasteClip` and `removeObjects` *apply* what they build, list by list, in the order
 * `editor/history.ts#applyEntry` replays them (terrain, doodad tiles, doodads, sprites,
 * units, locations, fog): every list is computed against the state the ones before it
 * leave behind, which is what makes the whole entry undo and redo cleanly. Nothing here
 * touches ISOM — like the Rect and Tile brushes, a paste is a non-isometric edit.
 */
import { type Scenario } from "../formats/chk/scenario";
import { type DoodadRecord, type LocationRecord, type SpriteRecord, type UnitRecord } from "../formats/chk/sections/objects";
import type { Tileset } from "../formats/tileset/decode";
import { type DoodadCatalogue } from "../formats/tileset/doodads";
import { type Rect } from "./terrain";
import type { HistoryEdit } from "./history";
export type ClipPart = "terrain" | "doodads" | "units" | "sprites" | "locations" | "fog";
export declare const CLIP_PARTS: readonly ClipPart[];
export type ClipParts = Record<ClipPart, boolean>;
/** What a copy takes by default: the picture and everything standing on it; locations and fog on request. */
export declare const DEFAULT_CLIP_PARTS: ClipParts;
export declare const ALL_CLIP_PARTS: ClipParts;
/** Whether a paste adds to what is in the target area or clears its objects first. */
export type PasteMode = "merge" | "replace";
export interface ClipLocation {
    /** Bounds in map pixels relative to the clip's origin (an inverted box keeps its inversion). */
    left: number;
    top: number;
    right: number;
    bottom: number;
    elevationFlags: number;
    name: string;
}
export interface Clip {
    /** Size in tiles. */
    width: number;
    height: number;
    /** ERA of the source map: tile ids mean nothing on another tileset. */
    era: number;
    /** MTXM ids, row-major, or null when terrain was not included. */
    tiles: Uint16Array | null;
    /** TILE ids (the ground under the doodads), alongside `tiles`. */
    ground: Uint16Array | null;
    /** Records with positions relative to the origin in map pixels. */
    doodads: DoodadRecord[];
    units: UnitRecord[];
    sprites: SpriteRecord[];
    locations: ClipLocation[];
    /** MASK bytes, row-major, or null when fog was not included. */
    fog: Uint8Array | null;
}
/** Indices of the objects a region (or a selection) holds. */
export interface ObjectSelection {
    units: number[];
    sprites: number[];
    doodads: number[];
    locations: number[];
}
export declare const EMPTY_SELECTION: ObjectSelection;
export declare function selectionSize(sel: ObjectSelection): number;
/** A rectangle from two tile corners (inclusive), the way a marquee reports them. */
export declare function tileRect(a: {
    x: number;
    y: number;
}, b: {
    x: number;
    y: number;
}): Rect;
/** The part of `rect` inside the map (possibly empty: x1 <= x0). */
export declare function clampRect(rect: Rect, scn: {
    width: number;
    height: number;
}): Rect;
export declare const rectEmpty: (r: Rect) => boolean;
/**
 * The objects a tile rectangle holds: units and sprites by their centre, doodads and
 * locations when their whole box is inside. A doodad's overlay sprite is the doodad's,
 * not a sprite of its own, so it is left out of `sprites`.
 */
export declare function regionObjects(scn: Scenario, rect: Rect, catalogue: DoodadCatalogue): ObjectSelection;
/** The smallest tile rectangle holding every object of a selection, or null for an empty one. */
export declare function selectionRect(scn: Scenario, sel: ObjectSelection, catalogue: DoodadCatalogue): Rect | null;
/** Copy a tile rectangle (clamped to the map) with the parts asked for; null when nothing of the rectangle is on the map. */
export declare function copyRegion(scn: Scenario, rect: Rect, parts: ClipParts, catalogue: DoodadCatalogue): Clip | null;
/**
 * Copy a selection of objects (an object layer's Ctrl+C): the clip's rectangle is their
 * bounding box and it carries just those objects — never terrain or fog, which are not
 * something one selects. Null for an empty selection.
 */
export declare function copyObjects(scn: Scenario, sel: ObjectSelection, parts: ClipParts, catalogue: DoodadCatalogue): Clip | null;
/** What a clip holds, for the palette and the status bar: "12×8 tiles · 5 units · 2 doodads". */
export declare function clipSummary(clip: Clip): string;
/**
 * Take a selection of objects off the map, applied: doodads with their tiles and overlay
 * sprites (`removeDoodads`), then the remaining sprites, units and locations. Sprite
 * indices shift when an overlay goes, so the sprites to remove are followed by identity.
 */
export declare function removeObjects(scn: Scenario, sel: ObjectSelection, catalogue: DoodadCatalogue, tileset: Tileset | null, random?: () => number): HistoryEdit;
export interface PasteOptions {
    parts: ClipParts;
    mode: PasteMode;
    catalogue: DoodadCatalogue;
    tileset: Tileset | null;
    random?: () => number;
}
export interface PasteCounts {
    tiles: number;
    doodads: number;
    units: number;
    sprites: number;
    locations: number;
    fog: number;
    /** Objects the paste cleared out of the way (replace mode) or that a new tile stranded. */
    removed: number;
}
export interface PasteResult {
    edit: HistoryEdit;
    counts: PasteCounts;
    /** Things that could not be pasted, in words. */
    notes: string[];
}
/**
 * Stamp `clip` with its top-left tile at (tx, ty), applied. Anything that would land
 * off the map is skipped — tiles cell by cell, objects whole — and the result says so.
 */
export declare function pasteClip(scn: Scenario, clip: Clip, tx: number, ty: number, opts: PasteOptions): PasteResult;
/** A location record placed from a clip entry, for previews. */
export declare function clipLocationBounds(l: ClipLocation, tx: number, ty: number): LocationRecord;
