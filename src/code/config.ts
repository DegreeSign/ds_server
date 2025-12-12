import { getCacheDir, setCacheDir } from "@degreesign/cache";
import { ServerConfig, ServerConfigObj } from "./types";

const
    logTime = () => new Date().toUTCString(),
    /** configurations */
    serverConfig: ServerConfig = {
        cacheDir: getCacheDir(),
        encryptionKey: ``,
        encryptionSalt: ``,
        captchaSecret: ``,
        /** Sanitise strings check */
        sanitisationString: ``,
        /** Sanitise strings check (extended) */
        sanitisationStringExtended: ``,
        /** Override requests user agent */
        overrideUserAgent: ``,
    },
    getServerConfig = (): ServerConfig => serverConfig,
    setServerConfig = ({
        cacheDir,
        encryptionKey,
        encryptionSalt,
        captchaSecret,
        sanitisationString,
        sanitisationStringExtended,
        overrideUserAgent,
    }: ServerConfigObj) => {
        if (typeof cacheDir == `string`) {
            setCacheDir(cacheDir);
            serverConfig.cacheDir = cacheDir;
        };

        if (typeof encryptionKey == `string`)
            serverConfig.encryptionKey = encryptionKey;

        if (typeof encryptionSalt == `string`)
            serverConfig.encryptionSalt = encryptionSalt;

        if (typeof captchaSecret == `string`)
            serverConfig.captchaSecret = captchaSecret;

        if (typeof sanitisationString == `string`)
            serverConfig.sanitisationString = sanitisationString;

        if (typeof sanitisationStringExtended == `string`)
            serverConfig.sanitisationStringExtended = sanitisationStringExtended;

        if (typeof overrideUserAgent == `string`)
            serverConfig.overrideUserAgent = overrideUserAgent;
    };

export {
    logTime,
    serverConfig,
    getServerConfig,
    setServerConfig,
}