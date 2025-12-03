
import { execSync } from "child_process"
import { seoDt } from "@degreesign/utils"

const
    cmd = (command: string) => {
        try {
            return execSync(command, { encoding: `utf-8` }) || 1;
        } catch (e) {
            console.log(seoDt(), e);
            return 0
        };
    };

export {
    cmd,
}