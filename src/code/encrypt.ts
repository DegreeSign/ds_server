import {
	createHmac,
	createCipheriv,
	createDecipheriv,
	Encoding,
	BinaryLike
} from 'node:crypto';
import { Buffer } from "buffer"
import { serverConfig } from "./config";

let saltKey: BinaryLike;

const
	algorithm = `aes-256-cbc`,
	inputEncoding: Encoding = `utf-8`,
	outputEncoding: Encoding = `hex`,
	salt = (): BinaryLike => {
		if (!saltKey && serverConfig.encryptionSalt)
			saltKey = Buffer.from(serverConfig.encryptionSalt, outputEncoding)
		return saltKey;
	},
	/** encrypt data */
	en = (data?: string): string => {
		try {
			if (data) {
				const e = createCipheriv(algorithm, serverConfig.encryptionKey, salt());
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
				const e = createDecipheriv(algorithm, serverConfig.encryptionKey, salt());
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
	};

export {
	en,
	de,
	hmacValid,
};