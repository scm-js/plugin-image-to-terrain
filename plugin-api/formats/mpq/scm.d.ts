import { Archive } from "mopaq";
/** Where StarCraft keeps the scenario inside the archive. */
export declare const SCENARIO_PATH = "staredit\\scenario.chk";
/** True when the buffer starts with an MPQ header (possibly at a 512-byte boundary). */
export declare function looksLikeMpq(bytes: Uint8Array): boolean;
/** How the members of a map archive are compressed. */
export type ArchiveCompression = "none" | "zlib" | "pkware";
/** How the scenario was stored in the archive it came from — what Save offers to keep. */
export interface MemberInfo {
    /** `other` is a method this library can read but not write (bzip2, Huffman…). */
    compression: ArchiveCompression | "other";
    encrypted: boolean;
    /** Bytes the member occupies in the archive and bytes it decompresses to. */
    storedSize: number;
    size: number;
    sectorSize: number;
}
export interface LoadedMap {
    chk: Uint8Array;
    /** Absent when the file was a bare .chk. */
    archive: Archive | null;
    /** Files listed in the archive, when it carries a (listfile). */
    files: string[] | null;
    /** How scenario.chk was stored; null for a bare .chk. */
    scenarioInfo: MemberInfo | null;
}
/**
 * Read a .scm/.scx (or a bare .chk) into raw scenario bytes.
 *
 * The archive is kept so a later save can carry across the map's other files —
 * custom sounds and graphics live alongside scenario.chk and are easy to lose.
 */
export declare function loadMap(bytes: Uint8Array): Promise<LoadedMap>;
/** What the block table says about a member, in the editor's terms. */
export declare function memberInfo(archive: Archive, name: string): MemberInfo | null;
export interface SaveOptions {
    /**
     * Extra archive members to carry across, name → bytes. Typically the non-scenario
     * files read out of the map that was opened.
     */
    extras?: Map<string, Uint8Array>;
    /**
     * How every member is compressed. `pkware` is what StarEdit writes and the one method
     * every StarCraft build reads; `zlib` is smaller but needs 1.16.1 or Remastered; `none`
     * (the default) is readable by anything that opens an MPQ at all.
     */
    compress?: ArchiveCompression;
    /** Encrypt the members as StarEdit does — a Storm feature every build reads. Default off. */
    encrypt?: boolean;
    /** Sector size; StarEdit's 4096 by default. */
    sectorSize?: number;
    /** Write a (listfile) naming the members (default on). The game never reads it. */
    listfile?: boolean;
}
/** The sector size Blizzard's own maps carry. */
export declare const STAREDIT_SECTOR_SIZE = 4096;
/**
 * Wrap scenario bytes back into a .scx/.scm archive.
 *
 * Uncompressed by default — pre-1.16 StarCraft builds only understand a subset of MPQ
 * compressions, and an uncompressed map opens everywhere. `compress: "pkware"` is the
 * other universally readable choice, because it is what the game's own maps use.
 */
export declare function saveMap(chk: Uint8Array, options?: SaveOptions): Promise<Uint8Array>;
/**
 * Pull every listed member except scenario.chk out of an opened archive. A member that
 * cannot be read (a compression this build has no decoder for, a corrupt sector) is
 * skipped rather than fatal — and named in `problems`, since Save writes the archive from
 * what was read and the member would be gone from the file.
 */
export declare function readExtras(archive: Archive, files: string[] | null, problems?: string[]): Promise<Map<string, Uint8Array>>;
export declare class MapLoadError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
