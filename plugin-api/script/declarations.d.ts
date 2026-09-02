import { type ScriptNames } from "./names";
export declare const DECLARATIONS_FILE = "scm-triggers.d.ts";
/** The whole declaration file for a set of names. */
export declare function generateDeclarations(names?: ScriptNames): string;
