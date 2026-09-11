# DegreeSign Server SDK
DegreeSign Server SDK is a TypeScript library for standing up a lightweight REST API server directly on Node's native `http` module — no Express or other web framework required.

The runtime is intentionally native-API-oriented: it imports `IncomingMessage`, `ServerResponse`, and `createServer` from `http`, and works with Node primitives such as `Buffer`, `req.socket`, `server.listen()`, `requestTimeout`, `headersTimeout`, and `keepAliveTimeout`. It also bundles a set of small server-side helpers (encryption, HMAC, captcha verification, TOTP codes, string sanitisation, file/cache and HTTP utilities) behind the same package.

## Features
- Framework-free HTTP server built on `node:http` (`createServer`, `IncomingMessage`, `ServerResponse`)
- Route registration for `GET` / `POST` with automatic JSON body parsing and query handling
- CORS handling plus built-in `OPTIONS` responses
- Request hardening: `maxBodySizeMB`, `requestTimeoutMs`, `headersTimeoutMs`, `keepAliveTimeoutMs`, `maxRequestsPerSocket` (returns `413` for oversized bodies, `400` for invalid JSON, and guards against slowloris/slow-body attacks)
- Encryption/decryption (`aes-256-cbc`), HMAC, hCaptcha verification, TOTP code generation/verification
- String sanitisation and validation helpers
- File, cache, and outbound HTTP helpers

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

## Configuration
Use `setServerConfig` to tune the server and helper behaviour:

```ts
import { setServerConfig } from "@degreesign/server"

setServerConfig({
    encryptionKey: process.env.ENCRYPTION_KEY,
    encryptionSalt: process.env.ENCRYPTION_SALT,
    captchaSecret: process.env.CAPTCHA_SECRET,
    maxBodySizeMB: 10,
    requestTimeoutMs: 30000,
    headersTimeoutMs: 60000,
    keepAliveTimeoutMs: 5000,
    maxRequestsPerSocket: 0,
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