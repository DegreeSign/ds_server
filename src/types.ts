interface ExpressServerFunctions {
    post: (route: string, description: string, process: (ips: string, req: any, res: any) => any) => void;
    start: () => void;
}

interface APIData {
    ips: string,
    body: any,
    res: any,
}

interface ListenerSpec {
    type: string,
    task: string,
    fun: Function,
}

export {
    ExpressServerFunctions,
    APIData,
    ListenerSpec,
}