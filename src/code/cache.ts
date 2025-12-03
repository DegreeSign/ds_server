import { serverConfig } from "./config";
import { safeFolder, wrtJ, redJ } from "./disk";

const
    /** Ready Live Cache */
    liveCache: { [key: string]: any } = {},
    /** Save Cache */
    saveCache = (
        key: string,
        data: any
    ) => {
        liveCache[key] = data;
        if (key?.includes(`/`)) {
            const targetFolder = key.substring(0, key.lastIndexOf('/'));
            safeFolder(`${serverConfig.cacheDir}${targetFolder}`);
        };
        wrtJ(`${serverConfig.cacheDir}${key}.json`, data);
    },
    /** Read Cache */
    readCache = (
        key: string
    ) => {
        if (!liveCache[key])
            liveCache[key] = redJ(`${serverConfig.cacheDir}${key}.json`, true);
        return liveCache[key]
    };

export {
    saveCache,
    readCache,
}