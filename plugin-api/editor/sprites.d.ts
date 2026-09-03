/**
 * Sprite (THG2) edits as invertible change lists, in the spirit of `UnitChange`.
 *
 * A THG2 record is either a *pure sprite* — a sprites.dat entry drawn where it stands,
 * no unit behind it (tree canopies, markers, glows) — or a *unit sprite*, which the game
 * turns into a unit of that type on load (StarEdit uses these for Installation doors and
 * traps, and gives them the `Disabled` flag so a door starts closed). Both kinds are
 * placed at any pixel; there is no collision or terrain rule to check.
 *
 * `before`/`after` are whole records: null `before` is an insertion at `index`, null
 * `after` a removal, both set a replacement. Removals are listed highest index first so
 * that applying them in order keeps the remaining indices valid; undo walks the list
 * backwards and so re-inserts lowest first.
 */
import { type Scenario } from "../formats/chk/scenario";
import { type SpriteRecord } from "../formats/chk/sections/objects";
export interface SpriteChange {
    index: number;
    before: SpriteRecord | null;
    after: SpriteRecord | null;
}
/** Insert / remove / replace on an in-place list; removals are listed highest index first. */
export declare function applyList<T>(list: T[], changes: readonly {
    index: number;
    before: T | null;
    after: T | null;
}[], direction: "do" | "undo"): void;
export declare function applySpriteChanges(scn: Scenario, changes: readonly SpriteChange[], direction?: "do" | "undo"): void;
export type SpriteKind = "pure" | "unit";
export declare function spriteKind(r: SpriteRecord): SpriteKind;
/**
 * A fresh record the way StarEdit writes one it did not get from a doodad: a pure sprite
 * carries just the `PureSprite` bit, a unit sprite none (plus `Disabled` when asked for).
 * Doodad overlays are the exception — they copy the doodad's whole CV5 flag word — and
 * are made by `editor/doodads.ts#makeOverlaySprite`.
 */
export declare function makeSprite(kind: SpriteKind, id: number, owner: number, x: number, y: number, opts?: {
    flipped?: boolean;
    disabled?: boolean;
}): SpriteRecord;
/** Keep a sprite's position on the map. */
export declare function clampSprite(px: number, py: number, mapW: number, mapH: number): {
    x: number;
    y: number;
};
/**
 * The rectangle a sprite's graphic covers, relative to its position. A GRP's frames share
 * one box centred on the position; a frame's opaque pixels occupy a smaller rectangle
 * inside it, so `offsetX`/`offsetY` (default: centred) place that tight rectangle.
 */
export interface SpriteSize {
    width: number;
    height: number;
    offsetX?: number;
    offsetY?: number;
}
export interface SpriteBox {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
/** When the graphic is not loaded, a sprite is one tile around its position. */
export declare const FALLBACK_SIZE: SpriteSize;
/**
 * The box a sprite occupies: its graphic's rectangle around the position, which is also
 * where the viewport draws it. `sizeOf` supplies the dimensions (the hook reads the loaded
 * GRP's frame; tests pass a constant).
 */
export declare function spriteBox(r: SpriteRecord, size: SpriteSize): SpriteBox;
/**
 * The tight rectangle of one frame inside a GRP box `boxW`×`boxH` whose centre sits on the
 * sprite's position; `flip` mirrors it the way the game mirrors facings 17–31.
 */
export declare function frameSize(boxW: number, boxH: number, frame: {
    x: number;
    y: number;
    width: number;
    height: number;
}, flip: boolean): SpriteSize;
export type SizeOf = (r: SpriteRecord) => SpriteSize;
/** Painter's order: by y, then by index (matches `MapViewport`'s ordering of THG2 records). */
export declare function spriteDrawOrder(scn: Scenario): number[];
/** Index of the topmost sprite whose box contains map pixel (px, py), or -1. */
export declare function spriteAt(scn: Scenario, px: number, py: number, sizeOf: SizeOf): number;
/** Indices of sprites whose boxes intersect the pixel rectangle (given in any corner order). */
export declare function spritesInBox(scn: Scenario, box: SpriteBox, sizeOf: SizeOf): number[];
/** Append records to the end of the list. */
export declare function addSprites(scn: Scenario, records: SpriteRecord[]): SpriteChange[];
/** Remove the sprites at `indices`, highest first so the earlier indices stay valid. */
export declare function removeSprites(scn: Scenario, indices: number[]): SpriteChange[];
/** Replace fields on the sprites at `indices`; unchanged records produce no entry. */
export declare function updateSprites(scn: Scenario, indices: number[], patch: (r: SpriteRecord) => Partial<SpriteRecord>): SpriteChange[];
/** Shift sprites by a pixel delta, clamped to the map. */
export declare function moveSprites(scn: Scenario, indices: number[], dx: number, dy: number): SpriteChange[];
