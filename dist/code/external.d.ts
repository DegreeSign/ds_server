declare const 
/** fetch data */
getData: (url: string, body?: any, headersData?: any, noCache?: boolean) => Promise<any>, 
/** Save file locally */
saveFileLocally: ({ url, filePath }: {
    url: string;
    filePath: string;
}) => Promise<boolean>;
export { getData, saveFileLocally, };
