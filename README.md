# DegreeSign Server SDK

> **Zero-framework, TypeScript REST API server SDK built directly on Node's native `node:http` module — routing, CORS, JSON body parsing, AES-256 encryption, HMAC, hCaptcha, TOTP, cache and file helpers in one non-opinionated package.**

[![npm version](https://img.shields.io/npm/v/@degreesign/server.svg)](https://www.npmjs.com/package/@degreesign/server)
[![npm downloads](https://img.shields.io/npm/dm/@degreesign/server.svg)](https://www.npmjs.com/package/@degreesign/server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/DegreeSign/ds_server/pulls)

## Table of Contents

- [What is DegreeSign Server SDK?](#what-is-degreesign-server-sdk)
- [Why DegreeSign Server SDK?](#why-degreesign-server-sdk)
- [Architecture](#architecture)
- [Installation](#installation)
  - [npm](#npm)
  - [yarn](#yarn)
  - [pnpm](#pnpm)
- [Quick Start](#quick-start)
  - [1. Start a server](#1-start-a-server)
  - [2. Configure the server](#2-configure-the-server)
  - [3. Call it from the client](#3-call-it-from-the-client)
  - [4. Encryption, captcha and TOTP codes](#4-encryption-captcha-and-totp-codes)
  - [5. Files, cache and outbound HTTP](#5-files-cache-and-outbound-http)
- [API Reference](#api-reference)
  - [Server](#server)
  - [Configuration](#configuration)
  - [Types](#types)
  - [Encryption and HMAC](#encryption-and-hmac)
  - [Captcha](#captcha)
  - [API codes and TOTP](#api-codes-and-totp)
  - [Strings and validation](#strings-and-validation)
  - [Files, cache and disk](#files-cache-and-disk)
  - [Outbound HTTP and process](#outbound-http-and-process)
- [Deployment behind Apache (HTTPS reverse proxy)](#deployment-behind-apache-https-reverse-proxy)
- [Faster Request Header (frontend only)](#faster-request-header-frontend-only)
- [FAQ](#faq)
- [Keywords](#keywords)
- [Change Log](#change-log)
- [License](#license)

## What is DegreeSign Server SDK?

DegreeSign Server SDK is a lightweight **TypeScript REST API server SDK** that lets you stand up a working HTTP API server in a few lines of code **without Express or any other web framework**. It is built directly on Node's native `http` module — importing `IncomingMessage`, `ServerResponse` and `createServer` — and works with Node primitives such as `Buffer`, `req.socket`, `server.listen()`, `requestTimeout`, `headersTimeout` and `keepAliveTimeout`. Alongside the framework-free router it bundles a set of small, server-side helpers for encryption, HMAC, captcha verification, TOTP codes, string sanitisation, file/cache access and outbound HTTP, all behind the same package. It is framework-free, dependency-light, fully typed, and designed to run behind a TLS-terminating reverse proxy.

## Why DegreeSign Server SDK?

- **Free forever under MIT.** No paid tier, trial, seat limit or usage cap — use it in personal and commercial projects.
- **No signup or account required.** Install from npm and start building — there is no registration, account, API key or license key.
- **No Express, no framework lock-in.** Runs on `node:http` primitives, so there is nothing to rewrite when Node evolves.
- **Instant REST API setup.** Register `GET` / `POST` routes with a plain array of objects and go live with `startListener`.
- **Automatic JSON handling.** Request bodies are parsed as JSON when the `Content-Type` is `application/json`; query strings are parsed into an object for `GET`.
- **CORS built in.** `OPTIONS` preflight responses are handled automatically and `allowedOrigins` restricts cross-origin access.
- **Secure by default.** Configurable body limits (`maxBodySizeMB`), request/header timeouts and slowloris/slow-body protection.
- **Batteries included.** AES-256-CBC encryption, HMAC, hCaptcha verification, TOTP/API codes, sanitisation, cache, disk and download helpers ship in the box.
- **Fully typed in TypeScript.** Written in TypeScript and ships declaration files for excellent autocomplete and IntelliSense.
- **Tiny and tree-shakeable.** Bundled, minified, marked side-effect free, and published with a single dependency tree.
- **Easy to monitor.** Logging, processing and response helpers (`rf`, `ff`) make consistent JSON responses trivial.

## Architecture

[`docs/architecture.html`](https://degreesign.github.io/ds_server/architecture.html) — published by GitHub Pages from the `docs/` directory — is a self-contained dependency map of the package: bands from the host boundary to the build, every module and meaningful function with its real line and signature, the typed relations between them, the primary request flow and the request-outcome states. Open it offline in a browser — no server, network or build step.

## Installation

### npm

```bash
npm install @degreesign/server
```

### yarn

```bash
yarn add @degreesign/server
```

### pnpm

```bash
pnpm add @degreesign/server
```

## Quick Start

The example below is complete and copy-paste ready. It starts a CORS-aware REST API with a `GET` health route and a `POST` echo route on port `1234`.

### 1. Start a server

```ts
import {
    startListener,
    rf,
    APIData,
    ListenerSpecs,
    ProcessInputs,
} from "@degreesign/server";

interface AccessData extends ProcessInputs {
    body: any;
}

// Runs for every request: logging, auth, rate limiting, etc.
const listenProcessor = ({ endPoint, ips, req, res, fun }: APIData<AccessData>) => {
    console.log(`processing`, endPoint);
    fun({ ips, req, res, body: req.body });
};

const listeners: ListenerSpecs<AccessData>[] = [
    {
        method: `GET`,
        endPoint: `health`, // GET /health -> { success: true, ... }
        task: `health check`,
        fun: ({ res }) => rf(res, { status: `ok`, uptime: process.uptime() }),
    },
    {
        method: `POST`,
        endPoint: `test`, // POST /test -> { success: true, received: { ... } }
        task: `testing API`,
        fun: ({ res, body }) => rf(res, { received: body }),
    },
];

startListener<AccessData>({
    port: 1234,
    allowedOrigins: [`https://example.com`, `http://localhost:1234`],
    listenProcessor,
    listeners,
});
```

### 2. Configure the server

`setServerConfig` tunes the server and the helper behaviour. Every field is optional and merged into the live `serverConfig` object.

```ts
import { setServerConfig } from "@degreesign/server";

setServerConfig({
    encryptionKey: process.env.ENCRYPTION_KEY,
    encryptionSalt: process.env.ENCRYPTION_SALT,
    captchaSecret: process.env.CAPTCHA_SECRET,
    cacheDir: `./.cache`,
    maxBodySizeMB: 10,
    requestTimeoutMs: 30_000,
    headersTimeoutMs: 60_000,
    keepAliveTimeoutMs: 5_000,
    maxRequestsPerSocket: 0, // 0 = unlimited
});
```

### 3. Call it from the client

```ts
// POST JSON — parsed into req.body on the server
const res = await fetch(`http://localhost:1234/test`, {
    method: `POST`,
    headers: { "Content-Type": `application/json` },
    body: JSON.stringify({ hello: `world` }),
});

console.log(await res.json()); // { success: true, received: { hello: "world" } }
```

### 4. Encryption, captcha and TOTP codes

```ts
import {
    setServerConfig,
    en,
    de,
    hmacValid,
    capVerify,
    genAPI,
    verAPI,
    genShortCode,
} from "@degreesign/server";

setServerConfig({
    encryptionKey: `your-32-character-encryption-key`,
    encryptionSalt: `your-encryption-salt`,
    captchaSecret: `your-hcaptcha-secret`,
});

const token = en(`secret payload`);       // hex ciphertext
const plain = de(token);                  // "secret payload"

const signature = hmacValid({ data: `payload`, secret: `shared-secret` });

const human = await capVerify(hCaptchaToken, clientIP); // bind to visitor IP, not a proxy

const secret = genAPI(20);                // base32 secret, longer than 20 chars
const valid = verAPI(secret, userCode);   // true | false
const shortCode = genShortCode();         // 7 chars, about 32 bits, not for auth
```

### 5. Files, cache and outbound HTTP

```ts
import {
    wrtJ,
    redJ,
    saveCache,
    readCache,
    saveFileLocally,
    getData,
} from "@degreesign/server";

wrtJ(`data.json`, { hello: `world` });
const data = redJ(`data.json`);

saveCache(`sessions`, { user: 1 });
const sessions = readCache(`sessions`);

await saveFileLocally({ url: `https://example.com/logo.png`, filePath: `./logo.png` });

const api = await getData(`https://api.example.com/data`);
```

## API Reference

### Server

| Export | Signature | Description |
| --- | --- | --- |
| `startListener` | `startListener<T>(options: { port: number; allowedOrigins?: string[]; listenProcessor: (p: APIData<T>) => any; listeners: ListenerSpecs<T>[] }): void` | Registers every listener and starts the native `http` server on `port`. Default listener method is `POST`. |
| `rf` | `rf(res: ServerResponse, data: any, success?: boolean): void` | Sends a `200` JSON response shaped `{ success, ...data }`. When `success` is omitted it is derived from the absence of a `.e` property. |
| `ff` | `ff(res: ServerResponse): void` | Safely ends a connection with HTTP `504 Gateway Timeout`; used for failed or timed-out requests. Destroys the connection instead when headers were already sent. |

### Configuration

| Export | Signature | Description |
| --- | --- | --- |
| `serverConfig` | `ServerConfig` | The live, mutable configuration object used across the SDK. |
| `getServerConfig` | `getServerConfig(): ServerConfig` | Returns the current configuration object. |
| `setServerConfig` | `setServerConfig(config: Partial<ServerConfig>): void` | Merges a partial configuration; only valid values are applied. |

`ServerConfig` accepts the following fields: `cacheDir`, `encryptionKey`, `encryptionSalt`, `captchaSecret`, `sanitisationString`, `sanitisationStringExtended`, `overrideUserAgent`, `maxBodySizeMB`, `requestTimeoutMs`, `headersTimeoutMs`, `keepAliveTimeoutMs` and `maxRequestsPerSocket`. `requestTimeoutMs` values below `5000` ms are ignored.

### Types

| Export | Description |
| --- | --- |
| `ServerConfig` | Configuration shape controlling encryption, captcha, cache, sanitisation and request hardening. |
| `ProcessInputs` | Base request context: `ips` (resolved client IP), `req` (`IncomingMessage` with parsed `body`) and `res` (`ServerResponse`). |
| `APIData<T>` | Per-request object handed to `listenProcessor`: extends `ProcessInputs` with `endPoint` and the route's `fun`. |
| `ListenerSpecs<T>` | Route definition: `method` (`GET` \| `POST`, default `POST`), `endPoint`, `task` and processing `fun`. |

### Encryption and HMAC

| Export | Signature | Description |
| --- | --- | --- |
| `en` | `en(data?: string): string` | Encrypts a UTF-8 string with `aes-256-cbc` and returns hex ciphertext. |
| `de` | `de(dataEN?: string): string` | Decrypts hex ciphertext produced by `en` back to a UTF-8 string. |
| `hmacValid` | `hmacValid({ data: string; secret: string; algorithm?: "sha512" \| "sha256" }): string` | Returns a hex HMAC digest, defaulting to `sha512`. |

### Captcha

| Export | Signature | Description |
| --- | --- | --- |
| `capVerify` | `capVerify(token?: string, remoteIP?: string): Promise<boolean>` | Verifies an hCaptcha token against `captchaSecret`, optionally passing `remoteIP` (sent as `remoteip` so hCaptcha can cross-check the token was solved from that address; an extra abuse signal, not a guaranteed rejection). Pass the real visitor IP, never a proxy address; returns `false` on missing tokens, errors or timeout. |

### API codes and TOTP

| Export | Signature | Description |
| --- | --- | --- |
| `genAPI` | `genAPI(length: number): string` | Generates a base32 secret from `length` bytes of randomness; the returned string is longer than `length`. |
| `genRandomCodeSize` | `genRandomCodeSize(): string` | Generates a base32 secret with a random length between 20 and 30. |
| `genShortCode` | `genShortCode(): string` | Generates a short base32 code (7 chars, about 32 bits); not for authentication. |
| `verAPI` | `verAPI(auth: string, t: string): boolean` | Verifies a TOTP token against a base32 secret. |

### Strings and validation

| Export | Signature | Description |
| --- | --- | --- |
| `chkStg` | `chkStg(txt?: string): string` | Sanitises a value against `sanitisationString`, returning a safe string or an empty string. |
| `txtShort` | `txtShort(txt?: string, len = 15): string` | Returns the last `len` characters of a string (useful for masking identifiers). |
| `validLen` | `validLen(len: number, txt?: string, checkNeg?: boolean): boolean` | Validates that a string is shorter than `len`, optionally rejecting matches of `sanitisationStringExtended`. |
| `validLenEq` | `validLenEq(len: number, txt?: string, checkNeg?: boolean): boolean` | Validates that a string is exactly `len` characters, optionally rejecting matches of `sanitisationStringExtended`. |

### Files, cache and disk

Re-exported from `@degreesign/cache` for convenience.

| Export | Signature | Description |
| --- | --- | --- |
| `wrt` | `wrt(file: string, code: any): boolean` | Writes a value to a file. |
| `wrtJ` | `wrtJ(file: string, code: any): 0 \| 1` | Writes a value to a file as JSON. |
| `red` | `red(file: string, disableLog?: boolean): string \| undefined` | Reads a file as a string. |
| `redJ` | `redJ(file: string, disableLog?: boolean): any` | Reads and parses a JSON file. |
| `safeFolder` | `safeFolder(targetFolder: string): boolean` | Ensures/validates a folder path is safe to use. |
| `delFolder` | `delFolder(targetFolder: string): boolean` | Deletes a folder. |
| `delFile` | `delFile(file: string): true \| undefined` | Deletes a file. |
| `fileStats` | `fileStats(targetFile: string): Stats \| undefined` | Returns `fs.Stats` for a file. |
| `saveCache` | `saveCache(key: string, data: any): void` | Writes a value to the cache directory under `key`. |
| `readCache` | `readCache(key: string): any` | Reads a value from the cache directory by `key`. |

### Outbound HTTP and process

| Export | Signature | Description |
| --- | --- | --- |
| `getData` | `getData(url: string, body?: any, headersData?: any, noCache = true): Promise<any>` | Fetches JSON over HTTP/HTTPS; sends `POST` when a `body` is given, otherwise `GET`. Returns parsed JSON for `200`/`201`/`202`, else `undefined`. |
| `saveFileLocally` | `saveFileLocally({ url: string; filePath: string }): Promise<boolean>` | Streams a remote file to a local path through a temporary file that atomically replaces the target; resolves `true` on success, `false` on HTTP errors, write failures or a stalled connection. |
| `cmd` | `cmd(command: string): string \| number` | Runs a shell command with `execSync`, returning its output, `1` when empty, or `0` on error. |

## Deployment behind Apache (HTTPS reverse proxy)

The SDK serves plain HTTP/1.1 and is meant to run behind a TLS-terminating reverse proxy. Let Apache own HTTPS and proxy cleartext HTTP to the SDK's port.

### Apache Config

Enable the required modules (`a2enmod ssl proxy proxy_http headers rewrite`):

```apache
# Server IP and Node port
Define main_ip 127.0.0.1
Define port_api 1234

# Publicly accessible static files directory served directly by Apache
<Directory /var/www/public_data>
	Options -Indexes +FollowSymLinks
	AllowOverride All
	Require all granted
</Directory>

# HTTPS virtual host
<VirtualHost *:443>

    # Restrict Access
	<IfModule mod_headers.c>
		Header set Cache-Control "max-age=86400, public"
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteCond %{HTTP:Origin} ^(https://example\.com|http://localhost:${port_api}|https://localhost:${port_api})$ [NC]
            RewriteRule ^ - [E=ORIGIN:%{HTTP:Origin}]
            Header set Access-Control-Allow-Origin "%{ORIGIN}e" env=ORIGIN
        </IfModule>
    </IfModule>

    # Allow Unrestricted (useful for third-party access to a certain directory in public files)
    <Directory /var/www/public_data/shared>
		Header set Access-Control-Allow-Origin *
		Options -Indexes
	</Directory>

	# SSL (obtained from a trusted CA)
	SSLEngine on
	SSLCertificateFile /etc/cer/example/public.crt
	SSLCertificateKeyFile /etc/cer/example/private.key

	# Server data
	ServerName api.example.com
	ServerAdmin admin@example.com
	DocumentRoot /var/www/public_data
	ErrorDocument 404 https://example.com

	# Node ports
	ProxyPreserveHost On
	ProxyPass /api http://${main_ip}:${port_api}
	ProxyPassReverse /api http://${main_ip}:${port_api}
</VirtualHost>
```

### Node listener

```ts
const port = 1234;
startListener<AccessData>({
    port,
    allowedOrigins: [`https://example.com`, `http://localhost:${port}`, `https://localhost:${port}`],
    listenProcessor,
    listeners,
});
```

Notes:

- `mod_proxy` adds `X-Forwarded-For`; the SDK reads it to resolve the client IP.
- `ProxyPass` strips the matched prefix, so register routes without `/api` (e.g. `/test`, not `/api/test`).
- The SDK binds all interfaces; firewall its port so only the proxy can reach it.
- Keep `ProxyPass` on `http://` — the SDK does not terminate TLS.

## Faster Request Header (frontend only)

To make browsers skip the `OPTIONS` (preflight) call, send the request with `Content-Type: text/plain;charset=UTF-8;type=application/json`. Because `text/plain` is a CORS "simple request" content type, the browser sends the request directly without a preflight.

```ts
const FASTER_HEADER: OutgoingHttpHeaders = {
    [`Content-Type`]: `text/plain;charset=UTF-8;type=application/json`,
};

fetch(`https://api.example.com/api/test`, {
    method: `POST`,
    headers: FASTER_HEADER,
    body: JSON.stringify({ hello: `world` }),
});
```

## FAQ

### What is DegreeSign Server SDK?

It is a TypeScript SDK for building a lightweight **REST API server** directly on Node's native `node:http` module, plus a small toolkit of server-side helpers (encryption, HMAC, hCaptcha, TOTP, sanitisation, cache, files and outbound HTTP).

### Is DegreeSign Server SDK free?

Yes — it is **free forever**. It is open source and released under the **MIT License**, free for personal and commercial use, with no paid tier, trial period, seat limit or usage cap.

### Do I need an account or signup to use it?

No. There is **no signup, account, registration, API key or license key** required — install it from npm and start building. Any optional third-party feature you enable (such as hCaptcha) uses your own provider credentials.

### Does it work on Node.js and in the browser?

It is a **Node.js server SDK** (Node.js 18+ is required) and runs wherever Node's `http`, `fs`, `crypto` and `child_process` built-ins are available. It is **not** a browser library — it serves the API that browser apps call.

### Does it have any dependencies?

Yes. Runtime dependencies are `@degreesign/cache`, `@degreesign/utils` and `speakeasy`. It does **not** depend on Express, Koa, Fastify or any other web framework.

### Does it support TypeScript?

Yes. The entire SDK is written in **TypeScript** and ships type declarations (`dist/index.d.ts`), providing full autocomplete and type safety for `startListener`, `APIData`, `ListenerSpecs`, `ServerConfig` and every helper.

### Which frameworks does it work with?

The server is **framework-free**, so it works with any frontend or client: React, Vue, Angular, Svelte, Next.js, React Native, plain `fetch`, `curl` and more. Use it as the backend and call it over HTTP.

### Do I need Express to use it?

No. Express is not required and is not a dependency. Routing, CORS, JSON parsing and request hardening are all handled by the SDK on top of `node:http`.

### Which HTTP methods are supported?

`GET` and `POST` are supported for routes. The SDK responds automatically to `OPTIONS` preflight requests and answers other methods with `204 No Content`.

### How do I enable CORS?

Pass `allowedOrigins` to `startListener`. Matching origins receive `Access-Control-Allow-Origin`; `OPTIONS` responses are handled automatically.

### How do I prevent oversized uploads and slowloris attacks?

Configure `maxBodySizeMB`, `requestTimeoutMs`, `headersTimeoutMs`, `keepAliveTimeoutMs` and `maxRequestsPerSocket` via `setServerConfig`. Oversized bodies return `413`, invalid JSON returns `400`, and the timeouts protect against slowloris/slow-body attacks.

### How should I deploy it?

Run it behind an HTTPS reverse proxy such as Apache or Nginx that terminates TLS and forwards plain HTTP to the SDK's port. See [Deployment behind Apache](#deployment-behind-apache-https-reverse-proxy).

## Keywords

REST API server SDK · Node.js API server · TypeScript server framework · framework-free HTTP server · `node:http` · `createServer` · no Express · zero framework · API routing · GET and POST routes · CORS · OPTIONS preflight · JSON body parsing · request hardening · slowloris protection · max body size · AES-256-CBC encryption · HMAC · hCaptcha verification · TOTP · one-time passwords · API codes · string sanitisation · input validation · server-side cache · file helpers · disk utilities · outbound HTTP · TypeScript types · tree-shakeable · lightweight backend · DegreeSign.

## Change Log

[Change Log](changes.md)

## License

[MIT](LICENSE) © DegreeSign
