import {
    createWriteStream,
    existsSync,
    realpathSync,
    rename,
    statSync,
    unlink,
    WriteStream,
} from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream';
import https from 'https'
import http from 'http'
import { logTime, serverConfig } from "./config";

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
            console.log(logTime(), `fetching data error`, e);
            return
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
                    // Preserve an existing target, including symlinks
                    exists = existsSync(filePath),
                    // Write through a symlink instead of replacing it
                    targetPath = exists ? realpathSync(filePath) : filePath,
                    // Download to a temporary file first
                    tempPath = `${targetPath}.${randomUUID()}.tmp`,
                    // Preserve the target permissions
                    mode = exists ? statSync(targetPath).mode & 0o777 : 0o666;

                let
                    // Settle the download once
                    settled = false,
                    // Active temp file stream
                    stream: WriteStream | undefined;

                // Clean up and settle the download
                const finish = (success: boolean, trace?: any) => {
                    if (settled) return
                    settled = true
                    const settle = () => {
                        if (trace) console.log(`Failed to save file.`, trace?.message || trace);
                        resolve(success)
                    };
                    if (success) return settle()
                    // remove the temp file only after the stream closed its handle
                    const removeTemp = () => unlink(tempPath, settle);
                    if (!stream || stream.closed) return removeTemp()
                    stream.once('close', removeTemp);
                    stream.destroy();
                };

                // Fetch the file
                const request = protocol.get(url, (response) => {
                    if (response.statusCode !== 200) { // Check if the request was successful
                        console.log(`Failed to download file.`, response?.statusCode || response);
                        response.on('error', () => { });
                        response.destroy();
                        finish(false);
                        return;
                    };

                    stream = createWriteStream(tempPath, { mode });

                    // Stream into a temp file, then replace the target
                    pipeline(response, stream, (error) => {
                        if (error) {
                            finish(false, error);
                            return;
                        };

                        rename(tempPath, targetPath, (renameError) => finish(!renameError, renameError));
                    });
                });

                request.setTimeout(serverConfig.requestTimeoutMs, () => {
                    request.destroy(new Error(`download timeout`));
                });

                request.on('error', (err) => finish(false, err));
            } catch {
                resolve(false);
            };
        });
    };

export {
    getData,
    saveFileLocally,
}