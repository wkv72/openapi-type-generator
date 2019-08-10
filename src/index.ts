#!/usr/bin/env node

import program from "commander";
import path from "path";
import { file } from "tmp-promise";
import {
    extractOperationIdFromSpecificationFile,
    fixSpecificationFile,
    generateSourcesFromSpecification
} from "./utils";

program
    .option("-i, --input <file>", "input file")
    .option("-o, --output <directory>", "output file")
    .option("-m, --method <name>", "operationId of method to extract")
    .option("-f, --force", "overwrite existing output directory")
    .option("-v, --validate", "perform validation of input file");

program.parse(process.argv);

if (!program.input) {
    console.error("[Error] Required option '-i' is missing.");
    process.exit(1);
}

if (!program.output) {
    console.error("[Error] Required option '-o' is missing.");
    process.exit(2);
}

if (!program.method) {
    console.error("[Error] Required option '-m' is missing.");
    process.exit(3);
}

let force = false;

if (program.force) {
    force = true;
}

let validate = false;

if (program.validate) {
    validate = true;
}

const inputFile = path.join(process.cwd(), program.input);
const outputDir = path.join(process.cwd(), program.output);

const generatorBinary = `${__dirname}/../node_modules/@openapitools/openapi-generator-cli/bin/openapi-generator`;

async function main(): Promise<void> {
    try {
        const fixedSpecificationFile = await file();

        await fixSpecificationFile(inputFile, fixedSpecificationFile.path);

        const singleOperationSpecificationFile = await file();

        await extractOperationIdFromSpecificationFile(
            fixedSpecificationFile.path,
            singleOperationSpecificationFile.path,
            "retrieveBillingAccount",
        );

        await generateSourcesFromSpecification(
            generatorBinary,
            singleOperationSpecificationFile.path,
            outputDir,
            force,
            validate,
        );
    } catch (err) {
        console.log(err);
        process.exit(4);
    }
}

main();
