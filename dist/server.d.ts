import { delayCode } from "@degreesign/utils";
import { APIData, ListenerSpecs } from "./types";
declare const ff: (res: any) => any, // cut connection
rf: (res: any, data: any, success?: boolean) => any, 
/** Sanitise strings check */
chkStg: (txt?: string) => string, 
/** Shorten Text */
txtShort: (txt?: string, len?: number) => string, 
/** Validate Length */
validLen: (len: number, txt?: string, checkNeg?: boolean) => boolean | "" | undefined, 
/** Validate Length */
validLenEq: (len: number, txt?: string, checkNeg?: boolean) => boolean | "" | undefined, 
/** Generate API Code */
genAPI: (length: number) => string, 
/** Random code */
genRandomCodeSize: () => string, 
/** Short code */
genShortCode: () => string, 
/** Verify API Code */
verAPI: (auth: string, t: string) => boolean | undefined, 
/** Captcha Verification */
capVerify: (token?: string) => Promise<boolean | undefined>, 
/** fetch data */
getData: (url: string, body?: any, headersData?: any, noCache?: boolean) => Promise<any>, 
/** Start Listener */
startListener: <T>({ port, allowedOrigins, listenProcessor, listeners, }: {
    port: number;
    allowedOrigins?: string[];
    listenProcessor: (p: APIData<T>) => any;
    listeners: ListenerSpecs<T>[];
}) => void;
export { ff, rf, chkStg, txtShort, validLen, validLenEq, capVerify, genAPI, genRandomCodeSize, verAPI, genShortCode, getData, delayCode, startListener, };
