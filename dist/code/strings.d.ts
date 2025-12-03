declare const 
/** Sanitise strings check */
chkStg: (txt?: string) => string, 
/** Shorten Text */
txtShort: (txt?: string, len?: number) => string, 
/** Validate Length */
validLen: (len: number, txt?: string, checkNeg?: boolean) => boolean | "" | undefined, 
/** Validate Length */
validLenEq: (len: number, txt?: string, checkNeg?: boolean) => boolean | "" | undefined;
export { chkStg, txtShort, validLen, validLenEq, };
