import {
    IncomingMessage,
    OutgoingHttpHeaders,
    ServerResponse,
    createServer
} from "http"
import { logTime } from "./config";
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
    baseFallbackURL = `http://localhost/`,
    GET: ServerMethods = `GET`,
    POST: ServerMethods = `POST`,
    headerStr = `Access-Control-Allow-`,
    originHeader = `${headerStr}Origin`,
    Content_Type = `Content-Type`,
    application_json = `application/json`,
    x_forwarded_for = `x-forwarded-for`,
    cf_connecting_ip = `cf-connecting-ip`,
    content_type = `content-type`,
    standardHeaders = new Headers({
        [`${headerStr}Methods`]: POST,
        [`${headerStr}Headers`]: Content_Type
    }),
    acceptedHeader: OutgoingHttpHeaders = {
        [Content_Type]: application_json
    },
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
            res.end(JSON.stringify({
                ...success == undefined ? {
                    success: data?.e == undefined
                } : { success },
                ...data,
            }));
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
                            res.setHeaders(standardHeaders);

                            // read route
                            const
                                parsedUrl = new URL(req.url || homePath, baseFallbackURL),
                                path = (parsedUrl?.pathname || homePath)?.toLowerCase(),
                                handler = routes[path];

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

                                if (req.method == POST) {
                                    // read body
                                    let body = ``;
                                    for await (const chunk of req)
                                        body += chunk.toString();
                                    body = body?.trim();

                                    // add body
                                    reqProcess.body =

                                        // json body
                                        req.headers[content_type]
                                            ?.toLowerCase()
                                            ?.includes(application_json)
                                            ? JSON.parse(body)

                                            // others
                                            : body;
                                } else {
                                    // query parameters
                                    reqProcess.body =
                                        Object.fromEntries(parsedUrl.searchParams);
                                };

                                // process
                                handler.process({
                                    ips,
                                    req: reqProcess,
                                    res
                                });

                            } catch (e) {
                                console.log(logTime(), `${handler.description} failed, reason:`, e);
                                ff(res)
                                return
                            };
                        } catch (e) {
                            /** Ignore calls that fail setup */
                        };
                    });

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