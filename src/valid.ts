import { Buffer } from "buffer"
import fs from "fs"
import { execSync } from "child_process"
import {
	createHmac,
	createCipheriv,
	createDecipheriv,
	Encoding,
	CipherKey,
	BinaryLike
} from 'node:crypto';
import https from 'https'
import http from 'http'
import { StringObj, objLen, seoDt, tN } from "@degreesign/utils"
import { ServerConfig } from "./types";

const
	/** configurations */
	serverConfig: ServerConfig = {
		cacheDir: `/root/server_cache/cache/`,
		encryptionKey: ``,
		encryptionSalt: ``,
		captchaSecret: ``,
		/** Sanitise strings check */
		sanitisationString: ``,
		/** Sanitise strings check (extended) */
		sanitisationStringExtended: ``,
		/** Override requests user agent */
		overrideUserAgent: ``,
	},
	getServerConfig = (): ServerConfig => serverConfig,
	setServerConfig = ({
		cacheDir,
		encryptionKey,
		encryptionSalt,
		captchaSecret,
		sanitisationString,
		sanitisationStringExtended,
		overrideUserAgent,
	}: ServerConfig) => {
		if (cacheDir != undefined)
			serverConfig.cacheDir = cacheDir;

		if (encryptionKey != undefined)
			serverConfig.encryptionKey = encryptionKey;

		if (encryptionSalt != undefined)
			serverConfig.encryptionSalt = encryptionSalt;

		if (captchaSecret != undefined)
			serverConfig.captchaSecret = captchaSecret;

		if (sanitisationString != undefined)
			serverConfig.sanitisationString = sanitisationString;

		if (sanitisationStringExtended != undefined)
			serverConfig.sanitisationStringExtended = sanitisationStringExtended;

		if (overrideUserAgent != undefined)
			serverConfig.overrideUserAgent = overrideUserAgent;
	},
	/** Cache Folder */
	cacheKeys: StringObj = {},
	getCacheKeys = (): StringObj => cacheKeys,
	addCacheKey = (customKey: string) => {
		cacheKeys[customKey] = customKey;
	},
	removeCacheKey = (customKey: string) => {
		delete cacheKeys[customKey];
	},
	/** Validate Folder */
	safeFolder = (targetFolder: string) => {
		try {
			if (!fs.existsSync(targetFolder)) // if dir does not exist
				fs.mkdirSync(targetFolder, { recursive: true }); // create dir 
			return true
		} catch (e) {
			console.log(seoDt(), `safeFolder failed`, e);
			return false
		};
	},
	/** Delete Folder */
	delFolder = (targetFolder: string) => {
		try {
			if (fs.existsSync(targetFolder)) // if dir exist
				fs.rmSync(targetFolder, { recursive: true, force: true });
			return true
		} catch (e) {
			console.log(seoDt(), `delFolder failed`, e);
			return false
		};
	},
	/** File Stats */
	fileStats = (targetFile: string) => {
		try {
			return fs.statSync(targetFile);
		} catch (e) {
			console.log(seoDt(), `fileStats failed`, e);
			return
		};
	},
	/** Write to files */
	wrt = (file: string, code: any) => {
		try {
			return code ? (
				fs.writeFileSync(file, code, `utf8`),
				true
			) : (
				console.log(tN(), `no data to write to`, file),
				false
			)
		} catch {
			console.log(tN(), `failed to write to`, file);
			return false
		};
	},
	/** Write JSON to files */
	wrtJ = (file: string, code: any) => {
		try {
			if (objLen(code)) {
				const codeStr = JSON.stringify(code)
				return codeStr ? (
					wrt(file, codeStr) ? 1
						: (
							console.log(tN(), `error writing to:`, file),
							0
						)
				) : (
					console.log(tN(), `no JSON data to write.`, file),
					0
				);
			} else {
				console.log(tN(), `no JSON data to write.`, file);
				return 0;
			};
		} catch (e) {
			console.log(tN(), `major error writing to:`, file);
			return 0
		};
	},
	/** Read files */
	red = (file: string, disableLog?: boolean) => {
		try {
			return fs.readFileSync(file, `utf8`);
		} catch (e) {
			if (!disableLog) console.log(tN(), `no data to read at`, file);
			return undefined;
		};
	},
	/** Read JSON files */
	redJ = (file: string, disableLog?: boolean) => {
		try {
			const data = red(file, disableLog)
			return data ? JSON.parse(data) : undefined;
		} catch (e) {
			if (!disableLog) console.log(tN(), `no JSON data to read:`, file);
			return undefined
		};
	},
	/** Ready Live Cache */
	liveCache: { [key: string]: any } = {},
	/** Save Cache */
	saveCache = (
		key: string,
		data: any
	) => {
		liveCache[key] = data;
		if (key?.includes(`/`)) {
			const targetFolder = key.substring(0, key.lastIndexOf('/'));
			safeFolder(`${serverConfig.cacheDir}${targetFolder}`);
		};
		wrtJ(`${serverConfig.cacheDir}${key}.json`, data);
	},
	/** Read Cache */
	readCache = (
		key: string
	) => {
		if (!liveCache[key])
			liveCache[key] = redJ(`${serverConfig.cacheDir}${key}.json`, true);
		return liveCache[key]
	},
	cmd = (command: string) => {
		try {
			return execSync(command, { encoding: `utf-8` }) || 1;
		} catch (e) {
			console.log(tN(), e);
			return 0
		};
	},

	// encode 🔗
	algorithm = `aes-256-cbc`,
	inputEncoding: Encoding = `utf-8`,
	outputEncoding: Encoding = `hex`,
	k: CipherKey = serverConfig.encryptionKey,
	v: BinaryLike = Buffer.from(serverConfig.encryptionSalt, outputEncoding),
	/** encrypt data */
	en = (data?: string): string => {
		try {
			if (data) {
				const e = createCipheriv(algorithm, k, v);
				return e.update(data.toString(), inputEncoding, outputEncoding) +
					e.final(outputEncoding)
			};
		} catch (e) {
			console.log(`en failed`, e);
		};
		return ``
	},
	/** decrypt data */
	de = (dataEN?: string): string => {
		try {
			if (dataEN) {
				const e = createDecipheriv(algorithm, k, v);
				return e.update(dataEN.toString(), outputEncoding, inputEncoding) +
					e.final(inputEncoding)
			};
		} catch (e) {
			console.log(`de failed`, e);
		};
		return ``
	},
	hmacValid = (parm: {
		data: string,
		secret: string,
		algorithm?: `sha512` | 'sha256',
	}) => {
		try {
			return createHmac(parm.algorithm || `sha512`, parm.secret)
				.update(parm.data)
				.digest(`hex`);
		} catch (e) {
			console.log(`HMAC error`, e)
			return ``
		}
	},

	/** Save file locally */
	saveFileLocally = ({
		url,
		filePath
	}: {
		url: string,
		filePath: string,
	}): Promise<boolean> => {
		return new Promise((resolve) => {

			try {
				const
					// Determine the protocol (http or https)
					protocol = url?.startsWith('https') ? https : http,
					// Create a writable stream to save the file locally
					fileStream = fs.createWriteStream(filePath);

				// Fetch the file
				protocol.get(url, (response) => {
					if (response.statusCode !== 200) { // Check if the request was successful
						console.log(`Failed to download file.`, response?.statusCode || response);
						resolve(false);
						return;
					};
					response.pipe(fileStream); // Pipe the file data to the file stream
					fileStream.on('finish', () => { // Handle stream finish event
						fileStream.close();
						resolve(true);
					});
				}).on('error', (err) => {
					// Handle errors during the request
					fs.unlink(filePath, () => { }); // Delete the file if it was partially written
					console.log(`Failed to save file.`, err?.message || err);
					resolve(false);
				});
			} catch {
				resolve(false);
			};
		});
	};

export {
	serverConfig,
	getServerConfig,
	setServerConfig,
	wrt,
	wrtJ,
	red,
	redJ,
	safeFolder,
	delFolder,
	fileStats,
	saveCache,
	readCache,
	cacheKeys,
	getCacheKeys,
	addCacheKey,
	removeCacheKey,
	en,
	de,
	hmacValid,
	cmd,
	saveFileLocally,
};