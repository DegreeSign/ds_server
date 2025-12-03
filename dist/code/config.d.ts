import { ServerConfig, ServerConfigObj } from "./types";
declare const 
/** configurations */
serverConfig: ServerConfig, getServerConfig: () => ServerConfig, setServerConfig: ({ cacheDir, encryptionKey, encryptionSalt, captchaSecret, sanitisationString, sanitisationStringExtended, overrideUserAgent, }: ServerConfigObj) => void;
export { serverConfig, getServerConfig, setServerConfig, };
