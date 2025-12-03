import { verify } from "hcaptcha"
import { serverConfig } from "./config";

const
    /** Captcha Verification */
    capVerify = async (token?: string) => {
        try {
            if (token) {
                const capRes = await verify(serverConfig.captchaSecret, token)
                return capRes.success === true
            };
        } catch (e) {
            console.log(`Captcha Function Failed`, e);
        };
        return
    };

export {
    capVerify,
}