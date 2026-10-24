declare const 
/** Generate API Code */
genAPI: (length: number) => string, 
/** Random code */
genRandomCodeSize: () => string, 
/** Short code, not for auth */
genShortCode: () => string, 
/** Verify API Code */
verAPI: (auth: string, t: string) => boolean;
export { genAPI, genRandomCodeSize, genShortCode, verAPI, };
