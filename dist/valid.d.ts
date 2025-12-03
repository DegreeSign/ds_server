import fs from "fs";
import { StringObj } from "@degreesign/utils";
import { ServerConfig } from "./types";
declare const 
/** configurations */
serverConfig: ServerConfig, getServerConfig: () => ServerConfig, setServerConfig: ({ cacheDir, encryptionKey, encryptionSalt, captchaSecret, sanitisationString, sanitisationStringExtended, overrideUserAgent, }: ServerConfig) => void, 
/** Cache Folder */
cacheKeys: StringObj, getCacheKeys: () => StringObj, addCacheKey: (customKey: string) => void, removeCacheKey: (customKey: string) => void, 
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
export { serverConfig, getServerConfig, setServerConfig, wrt, wrtJ, red, redJ, safeFolder, delFolder, fileStats, saveCache, readCache, cacheKeys, getCacheKeys, addCacheKey, removeCacheKey, en, de, hmacValid, cmd, saveFileLocally, };
