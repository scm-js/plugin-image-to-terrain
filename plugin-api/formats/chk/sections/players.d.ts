export declare const PLAYER_SLOTS = 12;
/** Forces only cover the eight playable slots. */
export declare const FORCE_SLOTS = 8;
/** OWNR / IOWN controller byte. */
export declare const PlayerType: {
    readonly Inactive: 0;
    readonly ComputerGame: 1;
    readonly Occupied: 2;
    readonly Rescuable: 3;
    readonly ComputerUnused: 4;
    readonly Computer: 5;
    readonly Human: 6;
    readonly Neutral: 7;
    readonly Closed: 8;
    readonly Observer: 9;
    readonly PlayerLeft: 10;
    readonly ComputerLeft: 11;
};
export type PlayerType = (typeof PlayerType)[keyof typeof PlayerType];
/** SIDE race byte. */
export declare const PlayerRace: {
    readonly Zerg: 0;
    readonly Terran: 1;
    readonly Protoss: 2;
    readonly Independent: 3;
    readonly Neutral: 4;
    readonly UserSelectable: 5;
    readonly Random: 6;
    readonly Inactive: 7;
};
export type PlayerRace = (typeof PlayerRace)[keyof typeof PlayerRace];
export declare function decodeBytes(data: Uint8Array, count: number): number[];
export declare function encodeBytes(values: number[], count: number): Uint8Array;
export interface Forces {
    /** Force index (0-3) each of the 8 playable slots belongs to. */
    playerForce: number[];
    /** String index of each force's name. */
    nameIndex: number[];
    /** Bit 0 random start, 1 allied, 2 allied victory, 3 shared vision. */
    flags: number[];
}
export declare function decodeForces(data: Uint8Array): Forces;
export declare function encodeForces(forces: Forces): Uint8Array;
export declare function defaultForces(): Forces;
/** FORC per-force flag bits. */
export declare const ForceFlag: {
    readonly RandomStart: 1;
    readonly Allied: 2;
    readonly AlliedVictory: 4;
    readonly SharedVision: 8;
};
/** How Remastered picks each of the eight playable slots' colour. */
export declare const ColorMode: {
    /** A random entry from the predefined table. */
    readonly Random: 0;
    /** Whatever the player chose in the lobby. */
    readonly PlayerChoice: 1;
    /** The RGB triple stored alongside. */
    readonly Custom: 2;
    /** The COLR byte, as every older client reads it (StarEdit's default). */
    readonly Palette: 3;
};
export type ColorMode = (typeof ColorMode)[keyof typeof ColorMode];
export interface PlayerRgb {
    /** `[r, g, b]` for each of the 8 playable slots; only read when `mode` is `Custom`. */
    rgb: [number, number, number][];
    /** A `ColorMode` per slot. */
    mode: number[];
}
export declare function decodePlayerRgb(data: Uint8Array): PlayerRgb;
export declare function encodePlayerRgb(colors: PlayerRgb): Uint8Array;
/** What StarEdit writes: every slot on its COLR colour, RGB zeroed. */
export declare function defaultPlayerRgb(): PlayerRgb;
