import { IncomingMessage, ServerResponse } from "http";
import { APIData, ListenerSpecs } from "./types";
declare const 
/** Connection End */
ff: (res: ServerResponse<IncomingMessage>) => void, 
/** Connection Response */
rf: (res: ServerResponse<IncomingMessage>, data: any, success?: boolean) => void, 
/** Start Listener */
startListener: <T>({ port, allowedOrigins, listenProcessor, listeners, }: {
    port: number;
    allowedOrigins?: string[];
    listenProcessor: (p: APIData<T>) => any;
    listeners: ListenerSpecs<T>[];
}) => void;
export { ff, rf, startListener, };
