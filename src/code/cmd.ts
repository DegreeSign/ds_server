
import { execSync } from "node:child_process"
import { logTime } from "./config";

const
    cmd = (command: string) => {
        try {
            return execSync(command, { encoding: `utf-8` }) || 1;
        } catch (e) {
            console.log(logTime(), e);
            return 0
        };
    };

export {
    cmd,
}