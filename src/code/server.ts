import {
    IncomingMessage,
    OutgoingHttpHeaders,
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
    ProcessReq,
    ServerMethods
} from "./types"

const
    homePath = `/`,
    GET: ServerMethods = `GET`,
    POST: ServerMethods = `POST`,
    headerStr = `Access-Control-Allow-`,
    originHeader = `${headerStr}Origin`,
    Content_Type = `Content-Type`,
    application_json = `application/json`,
    x_forwarded_for = `x-forwarded-for`,
    cf_connecting_ip = `cf-connecting-ip`,
    content_type = `content-type`,
    content_length = `content-length`,
    allowMethodsHeader = `${headerStr}Methods`,
    allowMethodsValue = `${GET}, ${POST}`,
    allowHeadersHeader = `${headerStr}Headers`,
    acceptedHeader: OutgoingHttpHeaders = {
        [Content_Type]: application_json
    },
    payloadTooLargeResponse = JSON.stringify({ success: false, error: `payload too large` }),
    invalidJsonResponse = JSON.stringify({ success: false, error: `invalid json` }),
    FAILED_REASON = `failed, reason:`,
    /** Connection End */
    ff = (res: ServerResponse<IncomingMessage>) => {
        if (!res) return
        try {
            res.writeHead(504);
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
            res.writeHead(200, acceptedHeader);
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
                                res.setHeader(originHeader, origin)
                            };
                            res.setHeader(allowMethodsHeader, allowMethodsValue);
                            res.setHeader(allowHeadersHeader, Content_Type);

                            // respond to OPTIONS
                            const isPOST = req.method == POST;
                            if (!isPOST && req.method != GET) {
                                res.writeHead(204);
                                res.end();
                                return
                            };

                            // read route
                            const
                                rawUrl = req.url || homePath,
                                queryIdx = rawUrl.indexOf(`?`),
                                rawPath = queryIdx == -1 ? rawUrl
                                    : (
                                        rawUrl.slice(0, queryIdx)
                                        || homePath
                                    );
                            let handler = routes[rawPath];
                            if (!handler) handler = routes[rawPath.toLowerCase()];

                            if (
                                !handler // verify route
                                || req.method != handler.method // verify method
                            ) {
                                res.writeHead(404);
                                res.end();
                                return
                            };

                            try {

                                const
                                    // read IP
                                    ips: string = req.headers[x_forwarded_for]?.toString()
                                        || req.socket.remoteAddress
                                        || req.headers[cf_connecting_ip]?.toString()
                                        || ``,

                                    // req type
                                    reqProcess = req as ProcessReq;

                                if (isPOST) {
                                    // reject oversized payloads up front
                                    if (
                                        Number(req.headers[content_length])
                                        > maxBodySize
                                    ) {
                                        res.writeHead(413, acceptedHeader);
                                        res.end(payloadTooLargeResponse);
                                        return
                                    };

                                    // read body
                                    let body = ``;
                                    let size = 0;
                                    const chunks: Buffer[] = [];
                                    for await (const chunk of req) {
                                        size += chunk.length;
                                        if (size > maxBodySize) {
                                            res.writeHead(413, acceptedHeader);
                                            res.end(payloadTooLargeResponse);
                                            req.destroy();
                                            return
                                        };
                                        chunks.push(chunk);
                                    };
                                    body = Buffer.concat(chunks).toString()?.trim();

                                    // add body
                                    if (
                                        req.headers[content_type]
                                            ?.toLowerCase()
                                            ?.includes(application_json)
                                    ) {
                                        // json body
                                        try {
                                            reqProcess.body = JSON.parse(body);
                                        } catch {
                                            res.writeHead(400, acceptedHeader);
                                            res.end(invalidJsonResponse);
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
                        () => console.log(logTime(), `Server Online`, port)
                    );
                },
                processor = ({
                    method,
                    endPoint,
                    description,
                    process,
                }: ServerRouteInputs) => {
                    if (endPoint == homePath || !endPoint) endPoint = ``;
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