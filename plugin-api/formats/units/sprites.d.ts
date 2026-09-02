import { type UnitAssets } from "./load";
import { type TeamColorSpec } from "./teamColor";
/**
 * One frame of one image rendered for one team colour and palette, as a canvas the size
 * of the GRP's full box (so it is drawn centred on the image's position).
 */
export interface ImageFrame {
    image: HTMLCanvasElement;
    width: number;
    height: number;
    /** Fire and other remapped effects brighten what is under them rather than covering it. */
    additive: boolean;
}
/** Kept for callers that only need the unit's default picture. */
export type UnitSprite = ImageFrame;
/**
 * The frame the editor shows: the unit's default facing for directional GRPs (a random
 * facing is shown as "up", frame 0, which is also what buildings and doodads use).
 */
export declare function editorFrame(assets: UnitAssets, unitId: number, imageId: number): {
    frame: number;
    flip: boolean;
};
/**
 * Frame `frame` of image `imageId` in team colour `team`, drawn through `palette`
 * (256 RGBA entries — the current tileset's, keyed by `paletteKey`, which is also the
 * tileset name the remap tables are fetched for). Returns null while anything it needs is
 * still loading, or when the image has no drawable graphic; `onGrpLoaded` fires when it is
 * worth asking again.
 */
export declare function getImageFrame(assets: UnitAssets, imageId: number, frame: number, flip: boolean, team: TeamColorSpec, palette: Uint8Array, paletteKey: string): ImageFrame | null;
/** The unit type's main graphic in its editor pose — what previews and the placement ghost show. */
export declare function getUnitSprite(assets: UnitAssets, unitId: number, team: TeamColorSpec, palette: Uint8Array, paletteKey: string): UnitSprite | null;
/** The turret (or other subunit) drawn on top of a unit, or NO_UNIT. */
export declare function subunitOf(assets: UnitAssets, unitId: number): number;
