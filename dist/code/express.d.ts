import { delayCode } from "@degreesign/utils";
import { APIData, ListenerSpecs } from "./types";
declare const ff: (res: any) => any, // cut connection
rf: (res: any, data: any, success?: boolean) => any, 
/** Start Listener */
startListener: <T>({ port, allowedOrigins, listenProcessor, listeners, }: {
    port: number;
    allowedOrigins?: string[];
    listenProcessor: (p: APIData<T>) => any;
    listeners: ListenerSpecs<T>[];
}) => void;
export { ff, rf, delayCode, startListener, };
