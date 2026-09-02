import { type UnitAssets } from "../formats/units/load";
export declare const SPRITE_COUNT = 517;
export interface SpriteEntry {
    id: number;
    label: string;
    /** Palette group: "Units", "Effects", or "Doodads · <tileset>". */
    group: string;
    imageId: number;
    /** The unit drawn with this sprite, or NO_UNIT. */
    unitId: number;
}
export interface SpriteGroup {
    label: string;
    ids: number[];
}
export interface SpriteCatalogue {
    entries: SpriteEntry[];
    groups: SpriteGroup[];
}
export declare function spriteCatalogue(assets: UnitAssets): SpriteCatalogue;
/** "Terran Marine", "JUbush01", or "Sprite #n" when the tables are not loaded. */
export declare function spriteLabel(assets: UnitAssets | null, id: number): string;
