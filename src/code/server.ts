import express from "express"
import cors from "cors"
import { delayCode, seoDt } from "@degreesign/utils"
import { APIData, ExpressServerFunctions, ListenerSpecs } from "./types"

const
    // Server 💻
    ff = (res: any) => res ? res.status(504).send()
        : console.log(seoDt(), `error cutting connection`), // cut connection
    rf = (res: any, data: any, success?: boolean) => res ? res.status(200).send({
        ...success == undefined ? {
            success: data?.e == undefined
        } : { success },
        ...data,
    }) : console.log(seoDt(), `error sending data`), // send a message
    /** Server system (Express) */
    expressServer = (
        port: number,
        allowedOrigins?: string[],
    ): ExpressServerFunctions | undefined => {
        try {
            const
                app = express(),
                start = () => {
                    app.listen(
                        port,
                        () => console.log(seoDt(), `Server online`, port)
                    )
                },
                post = (
                    route: string,
                    description: string,
                    process: (
                        ips: string,
                        req: any,
                        res: any,
                    ) => any
                ) => {
                    app.post(`/` + route, (req: any, res: any) => {
                        try {
                            const ips: string = req.headers[`x-forwarded-for`]
                                || req.socket.remoteAddress
                                || req.headers[`cf-connecting-ip`];
                            process(ips, req, res);
                        } catch (e) {
                            console.log(seoDt(), description + `, reason: ` + e);
                            ff(res);
                        };
                    });
                };

            // Setup 🔧
            app.use(express.urlencoded({ extended: true }));
            app.use(express.json());
            app.use(cors({ methods: `POST` }));
            app.use((req: any, res: any, next: Function) => {
                const ori = req.headers.origin;
                if (
                    ori
                    && (
                        !allowedOrigins?.length
                        || allowedOrigins.includes(ori)
                    )
                ) {
                    res.setHeader(`Access-Control-Allow-Origin`, ori);
                };

                // run function
                next();
            });

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
            serverObj = expressServer(port, allowedOrigins),
            /** API listener */
            listenAPI = ({
                endPoint,
                task,
                fun
            }: ListenerSpecs<T>) =>
                serverObj?.post(endPoint, `REST API ${task} failed`, (
                    ips: string,
                    req: any,
                    res: any,
                ) => {
                    listenProcessor({
                        endPoint,
                        ips,
                        req,
                        res,
                        fun
                    });
                });
        for (let i = 0; i < listeners.length; i++) {
            const listenerSpecs = listeners[i];
            listenAPI(listenerSpecs);
        };
        serverObj?.start();
    };

export {
    ff,
    rf,
    delayCode,
    startListener,
}