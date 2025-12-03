import { ServerConfig, ServerConfigObj } from "./types";

const
    /** configurations */
    serverConfig: ServerConfig = {
        cacheDir: `/root/server_cache/cache/`,
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
        if (cacheDir != undefined)
            serverConfig.cacheDir = cacheDir;

        if (encryptionKey != undefined)
            serverConfig.encryptionKey = encryptionKey;

        if (encryptionSalt != undefined)
            serverConfig.encryptionSalt = encryptionSalt;

        if (captchaSecret != undefined)
            serverConfig.captchaSecret = captchaSecret;

        if (sanitisationString != undefined)
            serverConfig.sanitisationString = sanitisationString;

        if (sanitisationStringExtended != undefined)
            serverConfig.sanitisationStringExtended = sanitisationStringExtended;

        if (overrideUserAgent != undefined)
            serverConfig.overrideUserAgent = overrideUserAgent;
    };

export {
    serverConfig,
    getServerConfig,
    setServerConfig,
}