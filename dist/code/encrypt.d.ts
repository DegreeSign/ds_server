declare const 
/** encrypt data */
en: (data?: string) => string, 
/** decrypt data */
de: (dataEN?: string) => string, 
/**
 * Computes a hex HMAC digest.
 * It does not verify a signature.
 */
hmacValid: (parm: {
    data: string;
    secret: string;
    algorithm?: `sha512` | "sha256";
}) => string;
export { en, de, hmacValid, };
