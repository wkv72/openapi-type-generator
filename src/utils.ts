import fs from "fs";
import {ncp} from "ncp";
import tmp from "tmp";
import util from "util";

const fileExists = util.promisify(fs.exists);

const tmpDir = (prefix: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        tmp.dir({prefix}, (err, tempDir) => {
            if (err) {
                reject(err);
            } else {
                resolve(tempDir);
            }
        });
    });
};

const copyDir = (source: string, destination: string) => {
    return new Promise((resolve, reject) => {
        ncp(source, destination, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export {fileExists, tmpDir, copyDir};
