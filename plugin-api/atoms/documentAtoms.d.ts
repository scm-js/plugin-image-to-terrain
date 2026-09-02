import { type Scenario } from "../formats/chk/scenario";
import { type HistoryEntry } from "../editor/history";
import { type ScriptState } from "../editor/script";
import { type ResizeResult } from "../editor/resize";
/** The open scenario, or null when nothing real is loaded (the skeleton's blank state). */
export declare const scenarioAtom: import("jotai").PrimitiveAtom<Scenario | null> & {
    init: Scenario | null;
};
/** Non-scenario archive members, carried across on save so custom assets survive. */
export declare const archiveExtrasAtom: import("jotai").PrimitiveAtom<Map<string, Uint8Array<ArrayBufferLike>>> & {
    init: Map<string, Uint8Array<ArrayBufferLike>>;
};
/** Problems the parser noticed — surfaced rather than swallowed. */
export declare const scenarioWarningsAtom: import("jotai").Atom<string[]>;
/** File names opened this session, most recent first. */
export declare const recentFilesAtom: import("jotai").PrimitiveAtom<string[]> & {
    init: string[];
};
/** Bumped whenever terrain changes, so the viewport knows to repaint. */
export declare const terrainRevisionAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Bumped whenever `scenario.units` changes (place, move, delete, undo), for the same reason. */
export declare const unitsRevisionAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Bumped whenever `scenario.doodads` or `scenario.sprites` changes (the lists are mutated in place); the Sprites layer's repaint trigger too. */
export declare const doodadsRevisionAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Bumped whenever `scenario.locations` changes (the slots are replaced in place); `locationsAtom` re-derives from it. */
export declare const locationsRevisionAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Bumped when the ISOM section is replaced wholesale (Rebuild ISOM), so its health is re-read. */
export declare const isomRevisionAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/**
 * Bumped after a settings dialog writes to the scenario — players, forces, colours,
 * revision, unit settings (see editor/settings.ts). Those edits are outside the undo
 * model, and the scenario is mutated in place, so this is how the chrome learns of them.
 */
export declare const settingsRevisionAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/**
 * Bumped after a trigger dialog replaces `scenario.triggers` / `scenario.briefing`
 * (editor/triggers.ts) — like settings, a dialog transaction outside the undo model.
 */
export declare const triggersRevisionAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
export declare const commitTriggersAtom: import("jotai").WritableAtom<null, [], void> & {
    init: null;
};
/**
 * The trigger script's source, manifest and generated block (editor/script.ts), re-read
 * whenever the triggers or the archive extras change.
 */
export declare const scriptStateAtom: import("jotai").Atom<ScriptState>;
/**
 * Record that a settings dialog changed the scenario. Player colours reach every drawn
 * unit and sprite, so the object layers repaint too.
 */
export declare const commitSettingsAtom: import("jotai").WritableAtom<null, [], void> & {
    init: null;
};
export interface ResizeRequest {
    width: number;
    height: number;
    /** 3×3 anchor grid, 4 = centre. */
    anchor: number;
    /** ISOM terrain id to fill the new area with (the tileset's default when omitted). */
    terrainId?: number;
    clampLocations: boolean;
}
/**
 * Scenario ▸ Resize / Crop Map. Not an undoable edit: the history is dropped, every
 * selection cleared and every revision bumped, since the whole document moved. Null
 * when there is no map.
 */
export declare const resizeDocumentAtom: import("jotai").WritableAtom<null, [req: ResizeRequest], ResizeResult | null> & {
    init: null;
};
export declare const tilesetFileNameAtom: import("jotai").Atom<"badlands" | "platform" | "install" | "ashworld" | "jungle" | "desert" | "ice" | "twilight">;
export interface LoadedDocument {
    scenario: Scenario;
    extras: Map<string, Uint8Array>;
    fileName: string | null;
}
/**
 * Install a freshly parsed scenario, mirroring the fields the existing UI atoms read.
 * Those atoms stay the editor's source of truth for display; `scenarioAtom` is the
 * source of truth for what gets written back out.
 */
export declare const loadDocumentAtom: import("jotai").WritableAtom<null, [doc: LoadedDocument], void> & {
    init: null;
};
/**
 * Install a scenario parsed again from edited bytes — a plugin's raw section edit — in
 * place of the open one: the same file name and archive extras, the map marked modified,
 * and, as with Resize, the history dropped and every selection cleared, since any part
 * of the document may have changed. The mirror atoms are refilled from the new object.
 */
export declare const replaceScenarioAtom: import("jotai").WritableAtom<null, [scenario: Scenario], void> & {
    init: null;
};
export declare const closeDocumentAtom: import("jotai").WritableAtom<null, [], void> & {
    init: null;
};
export type { HistoryEntry };
export declare const undoStackAtom: import("jotai").PrimitiveAtom<HistoryEntry[]> & {
    init: HistoryEntry[];
};
export declare const redoStackAtom: import("jotai").PrimitiveAtom<HistoryEntry[]> & {
    init: HistoryEntry[];
};
/**
 * Record an edit that has already been applied to the scenario, so the viewport can
 * paint live during a stroke and the whole stroke still undoes as one step.
 */
export declare const commitEditAtom: import("jotai").WritableAtom<null, [entry: HistoryEntry], void> & {
    init: null;
};
/**
 * Record a finished terrain edit the way a brush stroke is recorded. Doodads the edit
 * painted over come off the map in the same undo step (their remaining cells go back to
 * the ground, their records and overlay sprites go), and with "remove stranded units"
 * on so do units the new terrain can no longer hold; the status line says how many of
 * each. The entry's own lists must already be applied to the scenario. Shared by
 * `useTerrainTools` and the plugin host so a plugin's edit behaves exactly like a stroke.
 */
export declare const commitTerrainAtom: import("jotai").WritableAtom<null, [req: {
    entry: HistoryEntry;
    summary: string;
}], void> & {
    init: null;
};
export declare const undoAtom: import("jotai").WritableAtom<string | null, [], string | null>;
export declare const redoAtom: import("jotai").WritableAtom<string | null, [], string | null>;
/** The Start Location unit id, which the editor draws as a player marker. */
export declare const START_LOCATION_UNIT = 214;
export interface ViewLocation {
    index: number;
    name: string;
    /** Tile coordinates (fractional when the box is not tile-aligned); MRGN stores pixels. */
    x: number;
    y: number;
    w: number;
    h: number;
    /** The normalised box in map pixels. */
    left: number;
    top: number;
    right: number;
    bottom: number;
    /** Non-zero when some elevations are excluded (see `Elevation`). */
    elevationFlags: number;
    /** The file stores right < left or bottom < top — a deliberate trick in some maps. */
    inverted: boolean;
}
/** The locations to draw: every slot in use except Anywhere, in slot order. */
export declare const locationsAtom: import("jotai").Atom<ViewLocation[]>;
export interface ViewStartLocation {
    player: number;
    /** Tile coordinates; UNIT stores pixel centres. */
    x: number;
    y: number;
}
export declare const startLocationsAtom: import("jotai").Atom<ViewStartLocation[]>;
/** Remove the selected doodads (tiles, DD2 records and overlay sprites) as one undo step. Returns how many went. */
export declare const deleteSelectedDoodadsAtom: import("jotai").WritableAtom<null, [], number> & {
    init: null;
};
/** Remove the selected sprites as one undo step. Returns how many went. */
export declare const deleteSelectedSpritesAtom: import("jotai").WritableAtom<null, [], number> & {
    init: null;
};
/** Remove the selected units as one undo step. Returns how many went. */
export declare const deleteSelectedUnitsAtom: import("jotai").WritableAtom<null, [], number> & {
    init: null;
};
/** Blank the selected slots (Anywhere is skipped) as one undo step. Returns how many went. */
export declare const deleteSelectedLocationsAtom: import("jotai").WritableAtom<null, [], number> & {
    init: null;
};
/** Shift the selected locations by a pixel delta (the arrow keys) as one undo step. Returns how many moved. */
export declare const nudgeSelectedLocationsAtom: import("jotai").WritableAtom<null, [d: {
    dx: number;
    dy: number;
}], number> & {
    init: null;
};
