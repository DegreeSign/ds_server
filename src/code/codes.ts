import speakeasy from "speakeasy"
import { seoDt } from "@degreesign/utils";

const
    /** Generate API Code */
    genAPI = (
        length: number
    ) => speakeasy.generateSecret({ length }).base32,
    /** Random code */
    genRandomCodeSize = () => genAPI(Math.floor(Math.random() * 11 + 20)),
    /** Short code */
    genShortCode = () => genAPI(4),
    /** Verify API Code */
    verAPI = (auth: string, t: string) => {
        try {
            return speakeasy.totp
                .verify({
                    secret: auth,
                    encoding: `base32`,
                    token: t
                });
        } catch (e) {
            console.log(seoDt(), `Verifying auth code failed`, e);
            return undefined
        };
    };

export {
    genAPI,
    genRandomCodeSize,
    genShortCode,
    verAPI,
}