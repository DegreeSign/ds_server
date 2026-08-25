# DegreeSign Server SDK
DegreeSign Server SDK is a TypeScript library for instant express server setup to provide REST API for any project.

## Change Log
[Change Log](changes.md)

## Setup
Install using `yarn add @degreesign/server` or `npm install @degreesign/server` 

```ts
import {
    APIData,
    ListenerSpecs,
    ProcessInputs,
    rf,
    startListener
} from "@degreesign/server"

interface AccessData extends ProcessInputs {
    body: any;
}

const
    listenProcessor = ({
        endPoint,
        ips,
        req,
        res,
        fun,
    }: APIData<AccessData>) => {
        console.log(`processing`, endPoint);
        fun({ ips, req, res, body: req.body });
    },
    listeners: ListenerSpecs<AccessData>[] = [{
        method: `POST`,
        endPoint: `test`,
        task: `testing API`,
        fun: (p) => {
            console.log(`received`, Object.keys(p.req.body));
            rf(p.res, p.req.body);
        },
    }];

startListener<AccessData>({
    port: 1234,
    listenProcessor,
    listeners,
});
```

## Faster Request Header (Frontend only)
To make browsers skip the `OPTIONS` (preflight) call, send the request with `Content-Type: text/plain;charset=UTF-8;type=application/json`. Because `text/plain` is a CORS "simple request" content type, the browser sends the request directly without a preflight.

```ts
const FASTER_HEADER: OutgoingHttpHeaders = {
    [`Content-Type`]: `text/plain;charset=UTF-8;type=application/json`,
};

fetch(`https://api.example.com/test`, {
    method: `POST`,
    headers: FASTER_HEADER,
    body: JSON.stringify({ hello: `world` }),
});
```