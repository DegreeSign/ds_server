declare const 
/** Validate Folder */
safeFolder: (targetFolder: string) => boolean, 
/** Delete Folder */
delFolder: (targetFolder: string) => boolean, 
/** File Stats */
fileStats: (targetFile: string) => import("fs").Stats | undefined, 
/** Write to files */
wrt: (file: string, code: any) => boolean, 
/** Write JSON to files */
wrtJ: (file: string, code: any) => 0 | 1, 
/** Read files */
red: (file: string, disableLog?: boolean) => string | undefined, 
/** Read JSON files */
redJ: (file: string, disableLog?: boolean) => any, 
/** Save file locally */
saveFileLocally: ({ url, filePath }: {
    url: string;
    filePath: string;
}) => Promise<boolean>;
export { wrt, wrtJ, red, redJ, safeFolder, delFolder, fileStats, saveFileLocally, };
