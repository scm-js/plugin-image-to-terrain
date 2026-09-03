export declare const CUWP_SLOTS = 64;
export declare const CUWP_STRIDE = 20;
export declare const UPRP_SIZE: number;
export declare const UPUS_SIZE = 64;
/** `validProperties` bits: which special states the slot sets (the state itself is in `stateFlags`). */
export declare const CuwpValid: {
    readonly Cloak: 1;
    readonly Burrow: 2;
    readonly InTransit: 4;
    readonly Hallucinated: 8;
    readonly Invincible: 16;
};
/** `validFields` bits: which of the numeric fields the slot applies. `Owner` is never used by the game. */
export declare const CuwpField: {
    readonly Owner: 1;
    readonly HitPoints: 2;
    readonly Shields: 4;
    readonly Energy: 8;
    readonly Resources: 16;
    readonly Hangar: 32;
};
/** `stateFlags` bits. */
export declare const CuwpState: {
    readonly Cloaked: 1;
    readonly Burrowed: 2;
    readonly InTransit: 4;
    readonly Hallucinated: 8;
    readonly Invincible: 16;
};
export interface CuwpSlot {
    /** `CuwpValid` bits. */
    validProperties: number;
    /** `CuwpField` bits. */
    validFields: number;
    /** Unused by the game; StarEdit writes 0. */
    owner: number;
    hitPointsPercent: number;
    shieldsPercent: number;
    energyPercent: number;
    resources: number;
    hangar: number;
    /** `CuwpState` bits. */
    stateFlags: number;
    /** The record's last four bytes, kept for fidelity. */
    unused: number;
}
export declare function blankCuwpSlot(): CuwpSlot;
/** A slot as StarEdit stores one nobody has touched: every field zero. */
export declare function emptyCuwpSlot(): CuwpSlot;
export declare function decodeCuwp(data: Uint8Array): CuwpSlot[];
export declare function encodeCuwp(slots: readonly CuwpSlot[]): Uint8Array;
export declare function decodeCuwpUsed(data: Uint8Array): boolean[];
export declare function encodeCuwpUsed(used: readonly boolean[]): Uint8Array;
export declare function defaultCuwp(): CuwpSlot[];
export declare function defaultCuwpUsed(): boolean[];
/** Whether the slot sets anything at all — the game's view, independent of UPUS. */
export declare function cuwpSlotActive(s: CuwpSlot): boolean;
/** A one-line reading of a slot for lists: `HP 50%, shields 100%, cloaked`. */
export declare function describeCuwpSlot(s: CuwpSlot): string;
