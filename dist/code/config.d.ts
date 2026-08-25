import { ServerConfig } from "./types";
declare const logTime: () => string, 
/** configurations */
serverConfig: ServerConfig, getServerConfig: () => ServerConfig, setServerConfig: ({ cacheDir, encryptionKey, encryptionSalt, captchaSecret, sanitisationString, sanitisationStringExtended, overrideUserAgent, maxBodySizeMB, requestTimeoutMs, headersTimeoutMs, keepAliveTimeoutMs, maxRequestsPerSocket, }: Partial<ServerConfig>) => void;
export { logTime, serverConfig, getServerConfig, setServerConfig, };
