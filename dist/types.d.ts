interface ExpressServerFunctions {
    post: (route: string, description: string, process: (ips: string, req: any, res: any) => any) => void;
    start: () => void;
}
interface APIData<T> {
    ips: string;
    req: any;
    res: any;
    fun: (p: T) => any;
}
interface ListenerSpec<T> {
    type: string;
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
export { ExpressServerFunctions, APIData, ListenerSpec, ServerConfig, };
