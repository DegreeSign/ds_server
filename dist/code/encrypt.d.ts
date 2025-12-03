declare const 
/** encrypt data */
en: (data?: string) => string, 
/** decrypt data */
de: (dataEN?: string) => string, hmacValid: (parm: {
    data: string;
    secret: string;
    algorithm?: `sha512` | "sha256";
}) => string;
export { en, de, hmacValid, };
