import {
    IncomingMessage,
    ServerResponse,
    createServer
} from "http"
import { logTime, serverConfig } from "./config";
import {
    APIData,
    ServerFunctions,
    ListenerSpecs,
    ServerRouteInputs,
    ServerRouteObj,
    ProcessInputs,
    ProcessReq
} from "./types"
import {
    HOME_PATH,
    QUERY_CHAR,
    GET,
    POST,
    ORIGIN_HEADER,
    CONTENT_TYPE,
    APPLICATION_JSON,
    X_FORWARDED_FOR,
    CF_CONNECTING_IP,
    CONTENT_TYPE_LOWERCASE,
    CONTENT_LENGTH,
    ALLOW_METHODS_HEADER,
    ALLOW_METHODS_VALUE,
    ALLOW_HEADERS_HEADER,
    ACCEPTED_HEADER,
    PAYLOAD_TOO_LARGE_RESPONSE,
    INVALID_JSON_RESPONSE,
    FAILED_REASON,
    SERVER_ONLINE_MESSAGE,
    STATUS_OK,
    STATUS_NO_CONTENT,
    STATUS_NOT_FOUND,
    STATUS_PAYLOAD_TOO_LARGE,
    STATUS_BAD_REQUEST,
    STATUS_GATEWAY_TIMEOUT,
} from "./constants"

const
    /** Connection End */
    ff = (res: ServerResponse<IncomingMessage>) => {
        if (!res) return
        try {
            res.writeHead(STATUS_GATEWAY_TIMEOUT);
            res.end();
        } catch (e) { };
    },
    /** Connection Response */
    rf = (
        res: ServerResponse<IncomingMessage>,
        data: any,
        success?: boolean
    ) => {
        if (!res) return
        try {
            res.writeHead(STATUS_OK, ACCEPTED_HEADER);
            const successState =
                success === undefined ? data?.e == undefined : success;
            res.end(JSON.stringify({ success: successState, ...data }));
        } catch (e) { ff(res); };
    },
    /** Server system */
    serverSetup = (
        port: number,
        allowedOrigins?: string[],
    ): ServerFunctions | undefined => {
        try {
            const
                /** routes endpoints */
                routes: ServerRouteObj = {},
                maxBodySize = serverConfig.maxBodySizeMB * 1024 * 1024,
                start = () => {

                    // create server
                    const server = createServer(async (req, res) => {

                        try {

                            // setup response
                            const origin = req.headers.origin
                            if (
                                origin
                                && (
                                    !allowedOrigins?.length
                                    || allowedOrigins.includes(origin)
                                )
                            ) {
                                res.setHeader(ORIGIN_HEADER, origin)
                            };
                            res.setHeader(ALLOW_METHODS_HEADER, ALLOW_METHODS_VALUE);
                            res.setHeader(ALLOW_HEADERS_HEADER, CONTENT_TYPE);

                            // respond to OPTIONS
                            const isPOST = req.method == POST;
                            if (!isPOST && req.method != GET) {
                                res.writeHead(STATUS_NO_CONTENT);
                                res.end();
                                return
                            };

                            // read route
                            const
                                rawUrl = req.url || HOME_PATH,
                                queryIdx = rawUrl.indexOf(QUERY_CHAR),
                                rawPath = queryIdx == -1 ? rawUrl
                                    : (
                                        rawUrl.slice(0, queryIdx)
                                        || HOME_PATH
                                    );
                            let handler = routes[rawPath];
                            if (!handler) handler = routes[rawPath.toLowerCase()];

                            if (
                                !handler // verify route
                                || req.method != handler.method // verify method
                            ) {
                                res.writeHead(STATUS_NOT_FOUND);
                                res.end();
                                return
                            };

                            try {

                                const
                                    // read IP
                                    ips: string = req.headers[X_FORWARDED_FOR]?.toString()
                                        || req.socket.remoteAddress
                                        || req.headers[CF_CONNECTING_IP]?.toString()
                                        || ``,

                                    // req type
                                    reqProcess = req as ProcessReq;

                                if (isPOST) {
                                    // reject oversized payloads up front
                                    if (
                                        Number(req.headers[CONTENT_LENGTH])
                                        > maxBodySize
                                    ) {
                                            res.writeHead(STATUS_PAYLOAD_TOO_LARGE, ACCEPTED_HEADER);
                                        res.end(PAYLOAD_TOO_LARGE_RESPONSE);
                                        return
                                    };

                                    // read body
                                    let body = ``;
                                    let size = 0;
                                    const chunks: Buffer[] = [];
                                    for await (const chunk of req) {
                                        size += chunk.length;
                                        if (size > maxBodySize) {
                                        res.writeHead(STATUS_PAYLOAD_TOO_LARGE, ACCEPTED_HEADER);
                                            res.end(PAYLOAD_TOO_LARGE_RESPONSE);
                                            req.destroy();
                                            return
                                        };
                                        chunks.push(chunk);
                                    };
                                    body = Buffer.concat(chunks).toString()?.trim();

                                    // add body
                                    if (
                                        req.headers[CONTENT_TYPE_LOWERCASE]
                                            ?.toLowerCase()
                                            ?.includes(APPLICATION_JSON)
                                    ) {
                                        // json body
                                        try {
                                            reqProcess.body = JSON.parse(body);
                                        } catch {
                                            res.writeHead(STATUS_BAD_REQUEST, ACCEPTED_HEADER);
                                            res.end(INVALID_JSON_RESPONSE);
                                            return
                                        };
                                    } else {
                                        // others
                                        reqProcess.body = body;
                                    };
                                } else {
                                    // query parameters
                                    reqProcess.body = Object.fromEntries(
                                        queryIdx == -1
                                            ? new URLSearchParams()
                                            : new URLSearchParams(rawUrl.slice(queryIdx + 1))
                                    );
                                };

                                // process
                                handler.process({
                                    ips,
                                    req: reqProcess,
                                    res
                                });

                            } catch (e) {
                                console.log(logTime(), handler.description, FAILED_REASON, e);
                                ff(res)
                                return
                            };
                        } catch (e) {
                            /** Ignore calls that fail setup */
                        };
                    });

                    // harden against slow-body / slowloris
                    server.requestTimeout = serverConfig.requestTimeoutMs;
                    server.headersTimeout = serverConfig.headersTimeoutMs;
                    server.keepAliveTimeout = serverConfig.keepAliveTimeoutMs;
                    server.maxRequestsPerSocket = serverConfig.maxRequestsPerSocket;

                    // start server
                    server.listen(
                        port,
                        () => console.log(logTime(), SERVER_ONLINE_MESSAGE, port)
                    );
                },
                processor = ({
                    method,
                    endPoint,
                    description,
                    process,
                }: ServerRouteInputs) => {
                    if (endPoint == HOME_PATH || !endPoint) endPoint = ``;
                    routes[`/${endPoint}`?.toLowerCase()] = { method, description, process };
                };

            return {
                /** Listen to requests */
                processor,
                /** Go live 📶 */
                start
            };
        } catch (e) {
            console.log(e);
            return
        }
    },
    /** Start Listener */
    startListener = <T>({
        port,
        allowedOrigins,
        listenProcessor,
        listeners,
    }: {
        port: number;
        allowedOrigins?: string[];
        listenProcessor: (p: APIData<T>) => any;
        listeners: ListenerSpecs<T>[];
    }) => {
        const
            /** Server object */
            serverObj = serverSetup(port, allowedOrigins),
            /** API listener */
            listenAPI = ({
                method = POST,
                endPoint,
                task,
                fun
            }: ListenerSpecs<T>) => serverObj?.processor({
                method,
                endPoint,
                description: `REST API ${task} failed`,
                process: ({
                    ips,
                    req,
                    res,
                }: ProcessInputs) => {
                    listenProcessor({
                        endPoint,
                        ips,
                        req,
                        res,
                        fun
                    });
                }
            });

        // setup all listeners
        for (let i = 0; i < listeners.length; i++)
            listenAPI(listeners[i]);

        // start server
        serverObj?.start();
    };

export {
    ff,
    rf,
    startListener,
}