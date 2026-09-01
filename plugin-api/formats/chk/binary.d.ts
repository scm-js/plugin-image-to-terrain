/** Little-endian readers/writers over a Uint8Array. StarCraft data is LE throughout. */
export declare class Reader {
    private view;
    readonly bytes: Uint8Array;
    pos: number;
    constructor(bytes: Uint8Array);
    get remaining(): number;
    u8(): number;
    i8(): number;
    u16(): number;
    i16(): number;
    u32(): number;
    i32(): number;
    slice(len: number): Uint8Array<ArrayBufferLike>;
    skip(len: number): void;
}
export declare class Writer {
    private buf;
    private view;
    private len;
    constructor(capacity?: number);
    /** Bytes written so far. */
    get length(): number;
    private need;
    u8(v: number): this;
    i8(v: number): this;
    u16(v: number): this;
    i16(v: number): this;
    u32(v: number): this;
    i32(v: number): this;
    bytes(src: Uint8Array): this;
    /** Repeat a byte `count` times. */
    fill(value: number, count: number): this;
    finish(): Uint8Array<ArrayBuffer>;
}
