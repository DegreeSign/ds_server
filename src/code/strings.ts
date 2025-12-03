import { serverConfig } from "./config";

const
    /** Sanitise strings check */
    chkStg = (txt?: string) =>
        (typeof txt == `string` || typeof txt == `number`)
            && (Number(txt) || Number(txt) == 0 || !txt.match(serverConfig.sanitisationString)) ? (txt + ``) : ``,
    /** Shorten Text */
    txtShort = (txt?: string, len = 15) =>
        txt && typeof txt == `string` ? txt.slice(txt.length - len)
            : ``,
    /** Validate Length */
    validLen = (len: number, txt?: string, checkNeg?: boolean) =>
        txt && typeof txt == `string` && txt.length < len && (
            !checkNeg || !txt.match(serverConfig.sanitisationStringExtended)
        ),
    /** Validate Length */
    validLenEq = (len: number, txt?: string, checkNeg?: boolean) =>
        txt && typeof txt == `string` && txt.length == len && (
            !checkNeg || !txt.match(serverConfig.sanitisationStringExtended)
        );

export {
    chkStg,
    txtShort,
    validLen,
    validLenEq,
}