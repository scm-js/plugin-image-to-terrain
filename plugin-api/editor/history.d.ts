/**
 * The undo model's unit of work, and how one is applied in either direction.
 *
 * Every layer's edit is an invertible change list (`TileChange`, `UnitChange`, …); an
 * entry bundles the lists one user action touched so a stroke that paints terrain, lifts
 * the doodads it painted over and removes the units it stranded undoes as one step. The
 * lists are applied in a fixed order going forward and in reverse coming back, so each
 * list only has to be consistent with the state the ones before it leave behind.
 */
import { type Scenario } from "../formats/chk/scenario";
import { type TileChange } from "./terrain";
import { type UnitChange } from "./units";
import { type DoodadChange } from "./doodads";
import { type SpriteChange } from "./sprites";
import { type LocationChange } from "./locations";
/** The change lists of one edit; `HistoryEntry` adds the label. */
export interface HistoryEdit {
    changes: TileChange[];
    /** The isometric brush's changes to `scenario.isom`, undone together with the tiles. */
    isom?: TileChange[];
    /**
     * Set when the edit gave a map an ISOM section it did not have (Rebuild ISOM). Undo
     * removes the section again rather than leaving an all-zero one behind.
     */
    createdIsom?: Uint16Array;
    /** Unit placements, moves and deletions (see editor/units.ts). */
    units?: UnitChange[];
    /**
     * Doodad tiles stamped into or lifted off MTXM alone — TILE keeps the ground beneath
     * (see editor/doodads.ts). Applied after `changes`, so a terrain stroke that removes
     * the doodads it painted over restores their remaining cells on top of its own edit.
     */
    doodadTiles?: TileChange[];
    /** DD2 record insertions, removals and replacements. */
    doodads?: DoodadChange[];
    /** THG2 record changes: the Sprites layer's edits, and a doodad's overlay sprite coming and going with it. */
    sprites?: SpriteChange[];
    /** MRGN slot replacements — create, move, resize, rename, delete (see editor/locations.ts); a rename may carry a string. */
    locations?: LocationChange[];
    /** Fog of war edits to `scenario.mask` (see editor/fog.ts); `at` indexes the MASK byte. */
    fog?: TileChange[];
    /**
     * Set when the edit gave a map a MASK section it did not have (the first fog stroke
     * on such a map). Undo removes the section again.
     */
    createdMask?: Uint8Array;
}
export interface HistoryEntry extends HistoryEdit {
    label: string;
}
/**
 * Apply an entry in either direction. The parts are applied in a fixed order going
 * forward and in reverse coming back, so a step that both paints terrain and lifts the
 * doodads it painted over undoes cleanly (doodad cells first, then the terrain).
 */
export declare function applyEntry(scn: Scenario, entry: HistoryEdit, direction: "do" | "undo"): void;
export declare const touchesDoodads: (entry: HistoryEdit) => boolean;
export declare const hasEdits: (entry: HistoryEdit) => boolean;
