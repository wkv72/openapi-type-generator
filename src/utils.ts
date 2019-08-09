import {exec} from "child_process";
import fs from "fs";
import {ncp} from "ncp";
import tmp from "tmp";
import util from "util";

tmp.setGracefulCleanup();

const fileExists = util.promisify(fs.exists);

const createTempDir = (prefix: string): Promise<string> => {
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

const execute = (command: string) => {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export {fileExists, createTempDir, copyDir, execute};
