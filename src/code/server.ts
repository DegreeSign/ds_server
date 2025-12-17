import { parse } from "url"
import { createServer } from "http"
import { logTime } from "./config";
import {
    APIData,
    ServerFunctions,
    ListenerSpecs,
    ServerRouteInputs,
    ServerRoute,
    ProcessInputs,
    ProcessReq
} from "./types"

const
    /** Connection End */
    ff = (res: any) => {
        if (res) {
            res.writeHead(504);
            res.end();
        } else console.log(logTime(), `error cutting connection`);
    },
    /** Connection Response */
    rf = (res: any, data: any, success?: boolean) => {
        if (res) {
            res.writeHead(200, { 'Content-Type': `application/json` });
            res.end(JSON.stringify({
                ...success == undefined ? {
                    success: data?.e == undefined
                } : { success },
                ...data,
            }));
        } else console.log(logTime(), `error sending data`);
    },
    /** Server system */
    serverSetup = (
        port: number,
        allowedOrigins?: string[],
    ): ServerFunctions | undefined => {
        try {
            const
                /** routes endpoints */
                routes: Map<string, ServerRoute> = new Map(),
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
                                res.setHeader(`Access-Control-Allow-Origin`, origin)
                            };
                            res.setHeader(`Access-Control-Allow-Methods`, `POST`);
                            res.setHeader(`Access-Control-Allow-Headers`, `Content-Type`);

                            // verify method
                            if (req.method !== `POST`) {
                                res.writeHead(204);
                                res.end();
                                return
                            };

                            // read route
                            const
                                parsedUrl = parse(req.url || ``, true),
                                path = parsedUrl.pathname || `/`,
                                handler = routes.get(path);
                            if (!handler) {
                                res.writeHead(404);
                                res.end();
                                return
                            };

                            try {

                                // read IP
                                const ips: string = req.headers[`x-forwarded-for`]?.toString()
                                    || req.socket.remoteAddress
                                    || req.headers[`cf-connecting-ip`]?.toString()
                                    || ``;

                                // read body
                                let body = ``;
                                for await (const chunk of req)
                                    body += chunk.toString();
                                body = body?.trim();

                                // add body
                                const reqProcess = req as ProcessReq;
                                reqProcess.body =

                                    // json body
                                    req.headers[`content-type`]
                                        ?.toLowerCase()
                                        ?.includes(`application/json`)
                                        ? JSON.parse(body)

                                        // others
                                        : body;

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
                        () => console.log(logTime(), `Server online`, port)
                    );
                },
                post = ({
                    endPoint,
                    description,
                    process,
                }: ServerRouteInputs) =>
                    routes.set(`/${endPoint}`, { description, process });

            return {
                /** Listen to Post requests */
                post,
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
                endPoint,
                task,
                fun
            }: ListenerSpecs<T>) => serverObj?.post({
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