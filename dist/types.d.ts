interface ExpressServerFunctions {
    post: (route: string, description: string, process: (ips: string, req: any, res: any) => any) => void;
    start: () => void;
}
interface APIData<T> {
    endPoint: string;
    ips: string;
    req: any;
    res: any;
    fun: (p: T) => any;
}
interface ListenerSpecs<T> {
    endPoint: string;
    task: string;
    fun: (p: T) => any;
}
interface ServerConfig {
    cacheDir: string;
    encryptionKey: string;
    encryptionSalt: string;
    captchaSecret: string;
    sanitisationString: string;
    sanitisationStringExtended: string;
    overrideUserAgent: string;
}
export { ExpressServerFunctions, APIData, ListenerSpecs, ServerConfig, };
