export type DialogId = "newMap" | "openMap" | "saveAs" | "exportImage" | "mapProperties" | "resizeMap" | "mapRevision" | "playerSettings" | "forceSettings" | "playerColors" | "unitSettings" | "upgradeSettings" | "techSettings" | "stringEditor" | "soundEditor" | "switches" | "locationList" | "unitProperties" | "locationProperties" | "spriteProperties" | "triggerEditor" | "textTriggerEditor" | "scriptEditor" | "missionBriefing" | "symmetry" | "gridSettings" | "preferences" | "shortcuts" | "validateMap" | "statistics" | "importTriggers" | "exportTriggers" | "importStrings" | "exportStrings" | "find" | "about" | "confirmClose" | "notImplemented" | "plugins" | "confirmPlugin" | "pluginDialog";
export interface DialogEntry {
    id: DialogId;
    key: number;
    /** Free-form payload for dialogs that need context (e.g. which unit). */
    payload?: Record<string, unknown>;
}
export declare const dialogStackAtom: import("jotai").PrimitiveAtom<DialogEntry[]> & {
    init: DialogEntry[];
};
/** Push a dialog onto the stack (dialogs may stack, e.g. Player Colors from Player Settings). Returns its key. */
export declare const openDialogAtom: import("jotai").WritableAtom<null, [id: DialogId, payload?: Record<string, unknown> | undefined], number> & {
    init: null;
};
/** Close the top-most dialog, or a specific one by key. */
export declare const closeDialogAtom: import("jotai").WritableAtom<null, [key?: number | undefined], void> & {
    init: null;
};
export interface PanelVisibility {
    palette: boolean;
    minimap: boolean;
    properties: boolean;
    layers: boolean;
    toolbar: boolean;
    statusbar: boolean;
}
export declare const panelsAtom: import("jotai").PrimitiveAtom<PanelVisibility> & {
    init: PanelVisibility;
};
export declare const leftDockWidthAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
export declare const rightDockWidthAtom: import("jotai").PrimitiveAtom<number> & {
    init: number;
};
/** Transient status-bar message ("Ready", "Saved", …). */
export declare const statusMessageAtom: import("jotai").PrimitiveAtom<string> & {
    init: string;
};
