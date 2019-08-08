#!/usr/bin/env node

import fs from "fs";
import minimist = require("minimist");
import npm from "npm";
import path from "path";
import tmp from "tmp";
import util from "util";

import {ncp} from "ncp";

const exists = util.promisify(fs.exists);

const parsedArgs = minimist(process.argv.slice(2));

if (!parsedArgs.i) {
    console.error("The -i argument is missing.");
    process.exit(1);
}

if (!parsedArgs.o) {
    console.error("The -o argument is missing.");
    process.exit(1);
}

const inputFile = parsedArgs.i;
const inputFileRelativeToCode = path.join(__dirname, "../", inputFile);

const outputDir = parsedArgs.o;
const outputDirRelativeToCode = path.join(__dirname, "../", outputDir);

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

const npmLoad = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        npm.load({}, (err) => {
           if (err) {
               reject(err);
           } else {
               resolve();
           }
        });
    });
};

const runScripts = (scripts: string[]) => {
    return new Promise((resolve, reject) => {
        npm.commands["run-script"](scripts, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
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

async function main(): Promise<void> {
    const inputFileExists = await exists(inputFileRelativeToCode);

    if (!inputFileExists) {
        console.error(`Input file '${inputFile}' does not exist.`);
        process.exit(2);
    }

    const outputDirExists = await exists(outputDirRelativeToCode);

    if (outputDirExists) {
        console.error(`Output directory '${outputDir}' already exist.`);
        process.exit(3);
    }

    const tempDir = await tmpDir("openapi-tg");

    process.env.OPENAPI_TG_INPUT = inputFile;
    process.env.OPENAPI_TG_OUTPUT = tempDir;
    process.env.OPENAPI_TG_ADDITIONAL_PROPERTIES = "supportsES6=true";

    await npmLoad();
    await runScripts(["generate", "--silent"]);

    await copyDir(path.join(tempDir, "model"), outputDirRelativeToCode);
}

main();
