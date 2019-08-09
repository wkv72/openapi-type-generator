#!/usr/bin/env node

import minimist = require("minimist");
import path from "path";

import {copyDir, createTempDir, execute, fileExists} from "./utils";

const parsedArgs = minimist(process.argv.slice(2));

if (!parsedArgs.i) {
    console.error("The -i argument is missing.");
    process.exit(1);
}

if (!parsedArgs.o) {
    // tslint:disable-next-line:no-console
    console.error("The -o argument is missing.");
    process.exit(1);
}

const inputFile = path.join(process.cwd(), parsedArgs.i);
const outputDir = path.join(process.cwd(), parsedArgs.o);

async function main(): Promise<void> {
    try {
        if (!await fileExists(inputFile)) {
            console.error(`Input file '${inputFile}' does not exist.`);
            process.exit(2);
        }

        if (await fileExists(outputDir)) {
            console.error(`Output directory '${outputDir}' already exist.`);
            process.exit(3);
        }

        const tempDir = await createTempDir("openapi-tg");

        await execute(`openapi-generator generate -g typescript-node -i ${inputFile} -o ${tempDir}`);
    } catch (err) {
        console.error(err);
    }
}

main();
