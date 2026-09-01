export declare const WAV_SLOTS = 512;
export declare const WAV_SIZE: number;
export declare function decodeWavs(data: Uint8Array): number[];
export declare function encodeWavs(wavs: number[]): Uint8Array;
/** An empty table. */
export declare function defaultWavs(): number[];
