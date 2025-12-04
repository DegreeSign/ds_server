import {
    createWriteStream,
    unlink,
} from 'node:fs';
import https from 'https'
import http from 'http'
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
    },

    /** Save file locally */
    saveFileLocally = ({
        url,
        filePath
    }: {
        url: string,
        filePath: string,
    }): Promise<boolean> => {
        return new Promise((resolve) => {

            try {
                const
                    // Determine the protocol (http or https)
                    protocol = url?.startsWith('https') ? https : http,
                    // Create a writable stream to save the file locally
                    fileStream = createWriteStream(filePath);

                // Fetch the file
                protocol.get(url, (response) => {
                    if (response.statusCode !== 200) { // Check if the request was successful
                        console.log(`Failed to download file.`, response?.statusCode || response);
                        resolve(false);
                        return;
                    };
                    response.pipe(fileStream); // Pipe the file data to the file stream
                    fileStream.on('finish', () => { // Handle stream finish event
                        fileStream.close();
                        resolve(true);
                    });
                }).on('error', (err) => {
                    // Handle errors during the request
                    unlink(filePath, () => { }); // Delete the file if it was partially written
                    console.log(`Failed to save file.`, err?.message || err);
                    resolve(false);
                });
            } catch {
                resolve(false);
            };
        });
    };

export {
    getData,
    saveFileLocally,
}