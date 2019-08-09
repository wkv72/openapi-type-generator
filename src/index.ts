#!/usr/bin/env node

import minimist = require("minimist");
import path from "path";

import {copyDir, createTempDir, execute, fileExists} from "./utils";

const parsedArgs = minimist(process.argv.slice(2));

if (!parsedArgs.i) {
    console.error("[Error] Required option '-i' is missing.");
    process.exit(1);
}

if (!parsedArgs.o) {
    // tslint:disable-next-line:no-console
    console.error("[Error] Required option '-o' is missing.");
    process.exit(1);
}

let force = false;

if (parsedArgs.f) {
    force = true;
}

let validate = false;

if (parsedArgs.v) {
    validate = true;
}

const inputFile = path.join(process.cwd(), parsedArgs.i);
const outputDir = path.join(process.cwd(), parsedArgs.o);

async function main(): Promise<void> {
    try {
        if (!await fileExists(inputFile)) {
            console.error(`[Error] The input file '${inputFile}' does not exist.`);
            process.exit(2);
        }

        if (!force && await fileExists(outputDir)) {
            console.error(`[Error] The output directory '${outputDir}' already exist.`);
            process.exit(3);
        }

        if (validate) {
            try {
                await execute(`openapi-generator validate -i ${inputFile}`);
            } catch (err) {
                console.error(`[Error] The input file '${inputFile}' failed validation.`);
                process.exit(4);
            }
        }

        const tempDir = await createTempDir("openapi-tg");

        await execute(`openapi-generator generate -g typescript-node -i ${inputFile} -o ${tempDir}`);

        await copyDir(path.join(tempDir, "model"), outputDir);
    } catch (err) {
        console.error(err);
    }
}

main();
