import { getCacheDir, setCacheDir } from "@degreesign/cache";
import { ServerConfig } from "./types";

const
    logTime = () => new Date().toUTCString(),
    /** configurations */
    serverConfig: ServerConfig = {
        cacheDir: getCacheDir(),
        encryptionKey: ``,
        encryptionSalt: ``,
        captchaSecret: ``,
        sanitisationString: ``,
        sanitisationStringExtended: ``,
        overrideUserAgent: ``,
        maxBodySizeMB: 10,
        requestTimeoutMs: 30000,
        headersTimeoutMs: 60000,
        keepAliveTimeoutMs: 5000,
        maxRequestsPerSocket: 0,
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
        maxBodySizeMB,
        requestTimeoutMs,
        headersTimeoutMs,
        keepAliveTimeoutMs,
        maxRequestsPerSocket,
    }: Partial<ServerConfig>) => {
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

        if (typeof maxBodySizeMB == `number` && maxBodySizeMB > 0)
            serverConfig.maxBodySizeMB = maxBodySizeMB;

        if (typeof requestTimeoutMs == `number` && requestTimeoutMs > 0)
            serverConfig.requestTimeoutMs = requestTimeoutMs;

        if (typeof headersTimeoutMs == `number` && headersTimeoutMs > 0)
            serverConfig.headersTimeoutMs = headersTimeoutMs;

        if (typeof keepAliveTimeoutMs == `number` && keepAliveTimeoutMs > 0)
            serverConfig.keepAliveTimeoutMs = keepAliveTimeoutMs;

        if (typeof maxRequestsPerSocket == `number` && maxRequestsPerSocket >= 0)
            serverConfig.maxRequestsPerSocket = maxRequestsPerSocket;
    };

export {
    logTime,
    serverConfig,
    getServerConfig,
    setServerConfig,
}