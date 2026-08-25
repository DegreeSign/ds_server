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
    /** Cache directory path */
    cacheDir: string;
    /** Encryption key */
    encryptionKey: string;
    /** Encryption salt */
    encryptionSalt: string;
    /** hCaptcha secret key */
    captchaSecret: string;
    /** Sanitise strings check */
    sanitisationString: string;
    /** Sanitise strings check (extended) */
    sanitisationStringExtended: string;
    /** Override requests user agent */
    overrideUserAgent: string;
    /** Max request body size in MB */
    maxBodySizeMB: number;
    /** Max time to receive request body (slow-body) in ms */
    requestTimeoutMs: number;
    /** Max time to receive request headers (slowloris) in ms */
    headersTimeoutMs: number;
    /** Keep-alive idle timeout in ms */
    keepAliveTimeoutMs: number;
    /** Max requests per keep-alive socket (0 = unlimited) */
    maxRequestsPerSocket: number;
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
}