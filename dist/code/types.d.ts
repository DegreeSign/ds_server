import { IncomingMessage, ServerResponse } from "http";
interface ProcessReq extends IncomingMessage {
    body: any;
}
interface ProcessInputs {
    ips: string;
    req: ProcessReq;
    res: ServerResponse<IncomingMessage>;
}
interface ServerRoute {
    description: string;
    process: (params: ProcessInputs) => any;
}
interface ServerRouteInputs extends ServerRoute {
    endPoint: string;
}
interface ServerFunctions {
    post: (params: ServerRouteInputs) => void;
    start: () => void;
}
interface APIData<T> extends ProcessInputs {
    endPoint: string;
    fun: (p: T) => any;
}
interface ListenerSpecs<T> {
    endPoint: string;
    task: string;
    fun: (p: T) => any;
}
interface ServerConfig {
    cacheDir: string;
    encryptionKey: string;
    encryptionSalt: string;
    captchaSecret: string;
    sanitisationString: string;
    sanitisationStringExtended: string;
    overrideUserAgent: string;
}
interface ServerConfigObj {
    cacheDir?: string;
    encryptionKey?: string;
    encryptionSalt?: string;
    captchaSecret?: string;
    sanitisationString?: string;
    sanitisationStringExtended?: string;
    overrideUserAgent?: string;
}
export { ProcessReq, ProcessInputs, ServerRoute, ServerRouteInputs, ServerFunctions, APIData, ListenerSpecs, ServerConfig, ServerConfigObj, };
