import { ServerConfig, ServerConfigObj } from "./types";
declare const logTime: () => string, 
/** configurations */
serverConfig: ServerConfig, getServerConfig: () => ServerConfig, setServerConfig: ({ cacheDir, encryptionKey, encryptionSalt, captchaSecret, sanitisationString, sanitisationStringExtended, overrideUserAgent, }: ServerConfigObj) => void;
export { logTime, serverConfig, getServerConfig, setServerConfig, };
