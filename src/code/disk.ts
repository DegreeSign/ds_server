import {
	existsSync,
    mkdirSync,
    rmSync,
    statSync,
    writeFileSync,
    readFileSync,
    createWriteStream,
    unlink,
} from 'node:fs';
import https from 'https'
import http from 'http'
import { seoDt, objLen } from "@degreesign/utils";

const
    /** Validate Folder */
    safeFolder = (targetFolder: string) => {
        try {
            if (!existsSync(targetFolder)) // if dir does not exist
                mkdirSync(targetFolder, { recursive: true }); // create dir 
            return true
        } catch (e) {
            console.log(seoDt(), `safeFolder failed`, e);
            return false
        };
    },
    /** Delete Folder */
    delFolder = (targetFolder: string) => {
        try {
            if (existsSync(targetFolder)) // if dir exist
                rmSync(targetFolder, { recursive: true, force: true });
            return true
        } catch (e) {
            console.log(seoDt(), `delFolder failed`, e);
            return false
        };
    },
    /** File Stats */
    fileStats = (targetFile: string) => {
        try {
            return statSync(targetFile);
        } catch (e) {
            console.log(seoDt(), `fileStats failed`, e);
            return
        };
    },
    /** Write to files */
    wrt = (file: string, code: any) => {
        try {
            return code ? (
                writeFileSync(file, code, `utf8`),
                true
            ) : (
                console.log(seoDt(), `no data to write to`, file),
                false
            )
        } catch {
            console.log(seoDt(), `failed to write to`, file);
            return false
        };
    },
    /** Write JSON to files */
    wrtJ = (file: string, code: any) => {
        try {
            if (objLen(code)) {
                const codeStr = JSON.stringify(code)
                return codeStr ? (
                    wrt(file, codeStr) ? 1
                        : (
                            console.log(seoDt(), `error writing to:`, file),
                            0
                        )
                ) : (
                    console.log(seoDt(), `no JSON data to write.`, file),
                    0
                );
            } else {
                console.log(seoDt(), `no JSON data to write.`, file);
                return 0;
            };
        } catch (e) {
            console.log(seoDt(), `major error writing to:`, file);
            return 0
        };
    },
    /** Read files */
    red = (file: string, disableLog?: boolean) => {
        try {
            return readFileSync(file, `utf8`);
        } catch (e) {
            if (!disableLog) console.log(seoDt(), `no data to read at`, file);
            return undefined;
        };
    },
    /** Read JSON files */
    redJ = (file: string, disableLog?: boolean) => {
        try {
            const data = red(file, disableLog)
            return data ? JSON.parse(data) : undefined;
        } catch (e) {
            if (!disableLog) console.log(seoDt(), `no JSON data to read:`, file);
            return undefined
        };
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
    wrt,
    wrtJ,
    red,
    redJ,
    safeFolder,
    delFolder,
    fileStats,
    saveFileLocally,
}