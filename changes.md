## DegreeSign Server SDK - Change Log

### 0.4.0
Added server config options for request hardening: `maxBodySizeMB`, `requestTimeoutMs`, `headersTimeoutMs`, `keepAliveTimeoutMs`, and `maxRequestsPerSocket`. Requests exceeding the body limit now return `413`, and invalid JSON returns `400`. Added slowloris/slow-body protection via server timeout settings. `ServerConfigObj` merged into `ServerConfig` (now accepts `Partial<ServerConfig>`).

### 0.3.3
`method` added to `ListenerSpecs` interface, to accept support for legacy `GET`