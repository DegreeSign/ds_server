import { logTime, serverConfig } from "./config";
import { CONTENT_TYPE, POST } from "./constants";
import { CaptchaResponse } from "./types";

const
    CAPTCHA_URL = `https://hcaptcha.com/siteverify`,
    CAPTCHA_HEADER = {
        [CONTENT_TYPE]: `application/x-www-form-urlencoded`
    },
    /** Captcha Verification */
    capVerify = async (token?: string, remoteIP?: string): Promise<boolean> => {
        try {
            if (!token || typeof token != `string`) return false

            const
                body = new URLSearchParams({
                    secret: serverConfig.captchaSecret,
                    response: token
                });

            if (remoteIP) body.set(`remoteip`, remoteIP);

            const response = await fetch(CAPTCHA_URL, {
                method: POST,
                headers: CAPTCHA_HEADER,
                body,
                signal: AbortSignal.timeout(serverConfig.requestTimeoutMs)
            });

            if (!response.ok) return false
            const data = await response.json() as CaptchaResponse;
            return data?.success === true
        } catch (e) {
            console.log(logTime(), `Captcha Function Failed`, e);
        };
        return false
    };

export {
    capVerify,
}