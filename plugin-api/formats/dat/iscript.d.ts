/**
 * `scripts\iscript.bin` — the bytecode that animates every image in the game.
 *
 *   u16 at 0            offset of the entry table
 *   entry table         (u16 iscript id, u16 header offset) pairs, ended by id 0xFFFF
 *   header              "SCPE", u8 type, 3 unused bytes, then u16 animation offsets — how
 *                       many depends on the type (see ANIM_COUNT_BY_TYPE); 0 = no such animation
 *   code                one byte opcode followed by its arguments (see OPCODES)
 *
 * images.dat maps each image to an iscript id. Every unit's main image, its overlays and
 * its shadow each run their own script; opcodes like `imgol` spawn further images with
 * their own scripts. Opcode names and argument layouts follow the community
 * disassemblers (PyICE / IceCC / OpenBW), and `tests/iscript.test.ts` walks the real file
 * to confirm every reachable instruction decodes. These projects are format references;
 * their code is not included here. Sources and licenses: ../../../ATTRIBUTION.md
 *
 * This module has no imports on purpose: `scripts/extract-units.mjs` loads it straight
 * into Node (which strips the types) to work out which graphics the scripts can reach.
 */
/** Animation slots, in header order. */
export declare const Anim: {
    readonly Init: 0;
    readonly Death: 1;
    readonly GndAttkInit: 2;
    readonly AirAttkInit: 3;
    readonly Unused1: 4;
    readonly GndAttkRpt: 5;
    readonly AirAttkRpt: 6;
    readonly CastSpell: 7;
    readonly GndAttkToIdle: 8;
    readonly AirAttkToIdle: 9;
    readonly Unused2: 10;
    readonly Walking: 11;
    readonly WalkingToIdle: 12;
    readonly SpecialState1: 13;
    readonly SpecialState2: 14;
    readonly AlmostBuilt: 15;
    readonly Built: 16;
    readonly Landing: 17;
    readonly LiftOff: 18;
    readonly IsWorking: 19;
    readonly WorkingToIdle: 20;
    readonly WarpIn: 21;
    readonly Unused3: 22;
    /** What StarEdit plays after Init — the tanks and Goliath have one, adding their turret as an overlay. */
    readonly StarEditInit: 23;
    readonly Disable: 24;
    readonly Burrow: 25;
    readonly UnBurrow: 26;
    readonly Enable: 27;
};
/** How many animation offsets a header of each type carries. */
export declare const ANIM_COUNT_BY_TYPE: Readonly<Record<number, number>>;
export declare const Op: {
    readonly playfram: 0;
    readonly playframtile: 1;
    readonly sethorpos: 2;
    readonly setvertpos: 3;
    readonly setpos: 4;
    readonly wait: 5;
    readonly waitrand: 6;
    readonly goto: 7;
    readonly imgol: 8;
    readonly imgul: 9;
    readonly imgolorig: 10;
    readonly switchul: 11;
    readonly __0c: 12;
    readonly imgoluselo: 13;
    readonly imguluselo: 14;
    readonly sprol: 15;
    readonly highsprol: 16;
    readonly lowsprul: 17;
    readonly uflunstable: 18;
    readonly spruluselo: 19;
    readonly sprul: 20;
    readonly sproluselo: 21;
    readonly end: 22;
    readonly setflipstate: 23;
    readonly playsnd: 24;
    readonly playsndrand: 25;
    readonly playsndbtwn: 26;
    readonly domissiledmg: 27;
    readonly attackmelee: 28;
    readonly followmaingraphic: 29;
    readonly randcondjmp: 30;
    readonly turnccwise: 31;
    readonly turncwise: 32;
    readonly turn1cwise: 33;
    readonly turnrand: 34;
    readonly setspawnframe: 35;
    readonly sigorder: 36;
    readonly attackwith: 37;
    readonly attack: 38;
    readonly castspell: 39;
    readonly useweapon: 40;
    readonly move: 41;
    readonly gotorepeatattk: 42;
    readonly engframe: 43;
    readonly engset: 44;
    readonly __2d: 45;
    readonly nobrkcodestart: 46;
    readonly nobrkcodeend: 47;
    readonly ignorerest: 48;
    readonly attkshiftproj: 49;
    readonly tmprmgraphicstart: 50;
    readonly tmprmgraphicend: 51;
    readonly setfldirect: 52;
    readonly call: 53;
    readonly return: 54;
    readonly setflspeed: 55;
    readonly creategasoverlays: 56;
    readonly pwrupcondjmp: 57;
    readonly trgtrangecondjmp: 58;
    readonly trgtarccondjmp: 59;
    readonly curdirectcondjmp: 60;
    readonly imgulnextid: 61;
    readonly __3e: 62;
    readonly liftoffcondjmp: 63;
    readonly warpoverlay: 64;
    readonly orderdone: 65;
    readonly grdsprol: 66;
    readonly __43: 67;
    readonly dogrddamage: 68;
};
/**
 * Argument layout per opcode: `b` u8, `s` s8, `w` u16, `N` a u8 count followed by that
 * many u16s. Indexed by opcode; a hole means the byte is not an opcode.
 */
export declare const OPCODE_ARGS: readonly (string | undefined)[];
export interface IscriptHeader {
    id: number;
    type: number;
    /** Code offset per animation slot (see `Anim`); 0 when the header has no such animation. */
    anims: number[];
}
export interface IscriptBin {
    data: Uint8Array;
    headers: Map<number, IscriptHeader>;
}
export declare function decodeIscript(data: Uint8Array): IscriptBin;
/** Code offset of animation `anim` in script `id`, or 0 when absent. */
export declare function animOffset(bin: IscriptBin, id: number, anim: number): number;
export interface Instruction {
    op: number;
    args: number[];
    /** Offset of the following instruction. */
    next: number;
}
/** Decode the instruction at `pc`, or null when the byte is not an opcode. */
export declare function readInstruction(data: Uint8Array, pc: number): Instruction | null;
/** The opcodes that create another image on the same sprite, with the image id in args[0]. */
export declare const IMAGE_SPAWN_OPS: ReadonlySet<number>;
/**
 * Every instruction reachable from animation `anim` of script `id`, following jumps and
 * calls but not falling through `end`/`return`. Used by the extract script and tests.
 */
export declare function walkAnimation(bin: IscriptBin, id: number, anim: number, visit: (ins: Instruction, pc: number) => void): void;
