import { seoDt } from "@degreesign/utils";
import { serverConfig } from "./config";

const
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
    };

export {
    getData
}