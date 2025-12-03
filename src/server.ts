import fetch from "node-fetch"
import express from "express"
import cors from "cors"
import { verify } from "hcaptcha"
import speakeasy from "speakeasy"
import { delayCode, seoDt, tN } from "@degreesign/utils"
import { APIData, ExpressServerFunctions, ListenerSpecs } from "./types"
import { serverConfig } from "./valid"

const
    // Server 💻
    ff = (res: any) => res ? res.status(504).send()
        : console.log(tN(), `error cutting connection`), // cut connection
    rf = (res: any, data: any, success?: boolean) => res ? res.status(200).send({
        ...success == undefined ? {
            success: data?.e == undefined
        } : { success },
        ...data,
    }) : console.log(tN(), `error sending data`), // send a message
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

    /** Sanitise strings check */
    chkStg = (txt?: string) =>
        (typeof txt == `string` || typeof txt == `number`)
            && (Number(txt) || Number(txt) == 0 || !txt.match(serverConfig.sanitisationString)) ? (txt + ``) : ``,
    /** Shorten Text */
    txtShort = (txt?: string, len = 15) =>
        txt && typeof txt == `string` ? txt.slice(txt.length - len)
            : ``,
    /** Validate Length */
    validLen = (len: number, txt?: string, checkNeg?: boolean) =>
        txt && typeof txt == `string` && txt.length < len && (
            !checkNeg || !txt.match(serverConfig.sanitisationStringExtended)
        ),
    /** Validate Length */
    validLenEq = (len: number, txt?: string, checkNeg?: boolean) =>
        txt && typeof txt == `string` && txt.length == len && (
            !checkNeg || !txt.match(serverConfig.sanitisationStringExtended)
        ),
    /** Generate API Code */
    genAPI = (
        length: number
    ) => speakeasy.generateSecret({ length }).base32,
    /** Random code */
    genRandomCodeSize = () => genAPI(Math.floor(Math.random() * 11 + 20)),
    /** Short code */
    genShortCode = () => genAPI(4),
    /** Verify API Code */
    verAPI = (auth: string, t: string) => {
        try {
            return speakeasy.totp
                .verify({
                    secret: auth,
                    encoding: `base32`,
                    token: t
                });
        } catch (e) {
            console.log(tN(), `Verifying auth code failed`, e);
            return undefined
        };
    },

    // Captcha System
    /** Captcha Verification */
    capVerify = async (token?: string) => {
        try {
            if (token) {
                const capRes = await verify(serverConfig.captchaSecret, token)
                return capRes.success === true
            };
        } catch (e) {
            console.log(`Captcha Function Failed`, e);
        };
        return
    },

    /** fetch data */
    getData = async (
        url: string,
        body?: any,
        headersData?: any,
        noCache: boolean = true
    ): Promise<any> => {
        try {
            const headers = headersData || {};
            if (noCache) {
                headers.cache = `no-store`;
                headers[`Content-Type`] = `application/json`;
                if (serverConfig.overrideUserAgent)
                    headers[`User-Agent`] = serverConfig.overrideUserAgent;
            };
            const
                raw = await fetch(
                    url,
                    {
                        method: body ? `POST` : `GET`,
                        headers,
                        body
                    }
                ),
                status = raw?.status,
                data = status == 200
                    || status == 201
                    || status == 202
                    ? await raw?.json() : undefined;

            return data
        } catch (e) {
            console.log(seoDt(), `fetching data error`, e);
            return undefined
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
    chkStg,
    txtShort,
    validLen,
    validLenEq,
    capVerify,
    genAPI,
    genRandomCodeSize,
    verAPI,
    genShortCode,
    getData,
    delayCode,
    startListener,
}