#!/usr/bin/env node

import minimist = require("minimist");
import path from "path";

import {copyDir, fileExists, tmpDir} from "./utils";

import {spawn} from "child_process";

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
const inputFileRelativeToCode = path.join(process.cwd(), inputFile);
console.log(inputFileRelativeToCode);

const outputDir = parsedArgs.o;
const outputDirRelativeToCode = path.join(process.cwd(), outputDir);
console.log(outputDirRelativeToCode);

async function main(): Promise<void> {
    if (!await fileExists(inputFileRelativeToCode)) {
        console.error(`Input file '${inputFile}' does not exist.`);
        process.exit(2);
    }

    if (await fileExists(outputDirRelativeToCode)) {
        console.error(`Output directory '${outputDir}' already exist.`);
        process.exit(3);
    }

    const tempDir = await tmpDir("openapi-tg");

    process.env.OPENAPI_TG_INPUT = inputFile;
    process.env.OPENAPI_TG_OUTPUT = tempDir;
    process.env.OPENAPI_TG_ADDITIONAL_PROPERTIES = "supportsES6=true";

    const generate = spawn("openapi-generator", [
        "generate",
        "-g",
        "typescript-node",
        "-i",
        `${inputFileRelativeToCode}`,
        "-o",
        `${outputDirRelativeToCode}`,
    ]);

    generate.stdout.on("data", (data) => {
        // console.log(`stdout: ${data}`);
    });

    generate.stderr.on("data", (data) => {
        // console.log(`stderr: ${data}`);
    });

    generate.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
    });

    await copyDir(path.join(tempDir, "model"), outputDirRelativeToCode);
}

main();
