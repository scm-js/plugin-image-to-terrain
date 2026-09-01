/**
 * Terrain sections. MTXM is what the game renders; TILE is StarEdit's copy of the grid
 * *without* doodads (the ground under each doodad), and ISOM is the isometric edit
 * history that lets the ISOM brush keep working. Editors that touch terrain must keep
 * all three consistent or the map looks correct in game but re-edits wrong.
 */
export declare function decodeTiles(data: Uint8Array, width: number, height: number): Uint16Array;
export declare function encodeTiles(tiles: Uint16Array): Uint8Array;
/** ISOM is a (width/2 + 1) x (height + 1) grid of 4 uint16 per cell. */
export declare function isomSize(width: number, height: number): number;
export declare function decodeIsom(data: Uint8Array, width: number, height: number): Uint16Array;
export declare function encodeIsom(isom: Uint16Array): Uint8Array;
/** MASK is one byte per tile: bits 0-7 hide the tile from that player. */
export declare function decodeMask(data: Uint8Array, width: number, height: number): Uint8Array;
/** Split an MTXM tile id into its CV5 group and the megatile slot within it. */
export declare function tileGroup(id: number): number;
export declare function tileSubIndex(id: number): number;
