import { type Scenario } from "../formats/chk/scenario";
import { type UnitRecord } from "../formats/chk/sections/objects";
import { type UnitsDat } from "../formats/dat/dat";
/**
 * Unit edits as invertible change lists, in the same spirit as terrain's `TileChange`.
 * `before`/`after` are whole records: null `before` is an insertion at `index`, null
 * `after` a removal, both set a replacement. Removals are listed highest index first so
 * that applying them in order keeps the remaining indices valid; undo walks the list
 * backwards and so re-inserts lowest first.
 */
export interface UnitChange {
    index: number;
    before: UnitRecord | null;
    after: UnitRecord | null;
}
export declare const TILE_PX = 32;
export declare function applyUnitChanges(scn: Scenario, changes: UnitChange[], direction?: "do" | "undo"): void;
export interface UnitGeometry {
    building: boolean;
    flyer: boolean;
    /** StarEdit placement box, pixels. */
    placeW: number;
    placeH: number;
    /** Collision extents from the centre, pixels. */
    left: number;
    up: number;
    right: number;
    down: number;
}
/** Sizes from units.dat, or a one-tile box when the tables are not loaded. */
export declare function unitGeometry(units: UnitsDat | null, unitId: number): UnitGeometry;
export interface PixelBox {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
/** The unit's collision box around its position; what selection and hit-testing use. */
export declare function unitBox(g: UnitGeometry, x: number, y: number): PixelBox;
/** The placement box (tile-aligned for buildings) around its position. */
export declare function placementBox(g: UnitGeometry, x: number, y: number): PixelBox;
/**
 * Where a unit dropped at map pixel (px, py) lands. Buildings (and everything else with
 * the building flag: resources, start locations, beacons) snap their placement box to the
 * tile grid, which is why a Command Center's stored centre is always tile*32 + 64/48.
 * Other units go exactly where the pointer is. Everything stays inside the map. With
 * `snap` off a building lands at the pointer too, its box merely kept inside the map.
 */
export declare function snapPlacement(g: UnitGeometry, px: number, py: number, mapW: number, mapH: number, snap?: boolean): {
    x: number;
    y: number;
};
/**
 * Draw order: ground units and buildings by y (the game's painter's order, so a unit
 * lower on the screen overlaps one above it), then flyers by y on top of everything.
 */
export declare function drawOrder(scn: Scenario, units: UnitsDat | null): number[];
/** Index of the topmost unit whose box contains map pixel (px, py), or -1. */
export declare function unitAt(scn: Scenario, units: UnitsDat | null, px: number, py: number): number;
/** Indices of units whose boxes intersect the pixel rectangle. */
export declare function unitsInBox(scn: Scenario, units: UnitsDat | null, box: PixelBox): number[];
export { UnitRelation, UnitState, UnitUsed, UnitValid } from "../formats/chk/sections/objects";
export declare const DEFAULT_MINERALS = 1500;
export declare const DEFAULT_GAS = 5000;
export declare function isResource(unitId: number): boolean;
/** Serial ids only need to be unique within the map; StarEdit hands them out increasing. */
export declare function nextSerial(scn: Scenario): number;
/**
 * A fresh record the way StarEdit writes one: 100% vitals, and the "valid"/"used" masks
 * describing only what applies to this unit type — a mineral field gets a resource
 * amount, a Templar an energy value, a marine neither. Start locations are all zeros.
 */
export declare function makeUnit(units: UnitsDat | null, unitId: number, owner: number, x: number, y: number, serial: number): UnitRecord;
/** Append records to the end of the list. */
export declare function addUnits(scn: Scenario, records: UnitRecord[]): UnitChange[];
/** Remove the units at `indices`, highest first so the earlier indices stay valid. */
export declare function removeUnits(scn: Scenario, indices: number[]): UnitChange[];
/** Replace fields on the units at `indices`; unchanged records produce no entry. */
export declare function updateUnits(scn: Scenario, indices: number[], patch: (u: UnitRecord) => Partial<UnitRecord>): UnitChange[];
/**
 * Shift units by a pixel delta. Buildings keep their tile alignment by re-snapping the
 * moved centre; everything is clamped to the map.
 */
export declare function moveUnits(scn: Scenario, units: UnitsDat | null, indices: number[], dx: number, dy: number, snap?: boolean): UnitChange[];
