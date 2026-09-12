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
        endPoint: `test`, // Accessible at https://api.example.com/api/test
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

## Faster Request Header (Frontend only)
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