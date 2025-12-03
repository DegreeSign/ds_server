declare const 
/** Generate API Code */
genAPI: (length: number) => string, 
/** Random code */
genRandomCodeSize: () => string, 
/** Short code */
genShortCode: () => string, 
/** Verify API Code */
verAPI: (auth: string, t: string) => boolean | undefined;
export { genAPI, genRandomCodeSize, genShortCode, verAPI, };
