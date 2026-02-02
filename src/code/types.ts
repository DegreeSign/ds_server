import { IncomingMessage, ServerResponse } from "http";

interface ProcessReq extends IncomingMessage {
    body: any;
}

interface ProcessInputs {
    ips: string;
    req: ProcessReq;
    res: ServerResponse<IncomingMessage>;
}

type ServerMethods = `GET` | `POST`;

interface ServerRoute {
    /** Route Method */
    method: ServerMethods;
    /** Route Description */
    description: string;
    /** Route Process */
    process: (params: ProcessInputs) => any;
}

interface ServerRouteObj {
    [endPoint: string]: ServerRoute;
}

interface ServerRouteInputs extends ServerRoute {
    /** Route Endpoint */
    endPoint: string;
}

interface ServerFunctions {
    /** Server Method Processor */
    processor: (params: ServerRouteInputs) => void;
    /** Server Start */
    start: () => void;
}

interface APIData<T> extends ProcessInputs {
    endPoint: string;
    fun: (p: T) => any;
}

interface ListenerSpecs<T> {
    /** Route Method */
    method?: ServerMethods;
    /** Route Endpoint */
    endPoint: string;
    /** Route Description */
    task: string;
    /** Route Processing Function */
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

export {
    ProcessReq,
    ProcessInputs,
    ServerMethods,
    ServerRoute,
    ServerRouteObj,
    ServerRouteInputs,
    ServerFunctions,
    APIData,
    ListenerSpecs,
    ServerConfig,
    ServerConfigObj,
}