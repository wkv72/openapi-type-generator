#!/usr/bin/env node

import minimist = require("minimist");
import path from "path";

import {copyDir, fileExists, npmLoad, runScripts, tmpDir} from "./utils";

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

const inputFile = parsedArgs.i;
const inputFileRelativeToCode = path.join(__dirname, "../", inputFile);

const outputDir = parsedArgs.o;
const outputDirRelativeToCode = path.join(__dirname, "../", outputDir);

async function main(): Promise<void> {
    const inputFileExists = await fileExists(inputFileRelativeToCode);

    if (!inputFileExists) {
        console.error(`Input file '${inputFile}' does not exist.`);
        process.exit(2);
    }

    const outputDirExists = await fileExists(outputDirRelativeToCode);

    if (outputDirExists) {
        console.error(`Output directory '${outputDir}' already exist.`);
        process.exit(3);
    }

    const tempDir = await tmpDir("openapi-tg");

    process.env.OPENAPI_TG_INPUT = inputFile;
    process.env.OPENAPI_TG_OUTPUT = tempDir;
    process.env.OPENAPI_TG_ADDITIONAL_PROPERTIES = "supportsES6=true";

    await npmLoad();
    await runScripts(["generate"]);

    await copyDir(path.join(tempDir, "model"), outputDirRelativeToCode);
}

main();
