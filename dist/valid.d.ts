import fs from "fs";
declare const 
/** configurations */
serverConfig: {
    cacheDir: string;
    encryptionKey: string;
    encryptionSalt: string;
    captchaSecret: string;
    /** Sanitise strings check */
    sanitisationString: string;
    /** Sanitise strings check (extended) */
    sanitisationStringExtended: string;
    /** Override requests user agent */
    overrideUserAgent: string;
}, 
/** Cache Folder */
cacheKeys: {
    exampleKey: string;
}, 
/** Validate Folder */
safeFolder: (targetFolder: string) => boolean, 
/** Delete Folder */
delFolder: (targetFolder: string) => boolean, 
/** File Stats */
fileStats: (targetFile: string) => fs.Stats | undefined, 
/** Write to files */
wrt: (file: string, code: any) => boolean, 
/** Write JSON to files */
wrtJ: (file: string, code: any) => 0 | 1, 
/** Read files */
red: (file: string, disableLog?: boolean) => string | undefined, 
/** Read JSON files */
redJ: (file: string, disableLog?: boolean) => any, 
/** Save Cache */
saveCache: (key: string, data: any) => void, 
/** Read Cache */
readCache: (key: string) => any, cmd: (command: string) => string | 0 | 1, 
/** encrypt data */
en: (data?: string) => string, 
/** decrypt data */
de: (dataEN?: string) => string, hmacValid: (parm: {
    data: string;
    secret: string;
    algorithm?: `sha512` | "sha256";
}) => string, 
/** Save file locally */
saveFileLocally: ({ url, filePath }: {
    url: string;
    filePath: string;
}) => Promise<boolean>;
export { wrt, wrtJ, red, redJ, safeFolder, delFolder, fileStats, saveCache, readCache, cacheKeys, serverConfig, en, de, hmacValid, cmd, saveFileLocally, };
