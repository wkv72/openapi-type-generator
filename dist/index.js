#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const path_1 = __importDefault(require("path"));
const tmp_promise_1 = require("tmp-promise");
const utils_1 = require("./utils");
commander_1.default
    .option("-i, --input <file>", "input file")
    .option("-o, --output <directory>", "output file")
    .option("-m, --method <name>", "operationId of method to extract")
    .option("-f, --force", "overwrite existing output directory")
    .option("-v, --validate", "perform validation of input file");
commander_1.default.parse(process.argv);
if (!commander_1.default.input) {
    console.error("[Error] Required option '-i' is missing.");
    process.exit(1);
}
if (!commander_1.default.output) {
    console.error("[Error] Required option '-o' is missing.");
    process.exit(2);
}
if (!commander_1.default.method) {
    console.error("[Error] Required option '-m' is missing.");
    process.exit(3);
}
let force = false;
if (commander_1.default.force) {
    force = true;
}
let validate = false;
if (commander_1.default.validate) {
    validate = true;
}
const inputFile = path_1.default.join(process.cwd(), commander_1.default.input);
const outputDir = path_1.default.join(process.cwd(), commander_1.default.output);
const generatorBinary = `${__dirname}/../node_modules/@openapitools/openapi-generator-cli/bin/openapi-generator`;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fixedSpecificationFile = yield tmp_promise_1.file();
            yield utils_1.fixSpecificationFile(inputFile, fixedSpecificationFile.path);
            const singleOperationSpecificationFile = yield tmp_promise_1.file();
            yield utils_1.extractOperationIdFromSpecificationFile(fixedSpecificationFile.path, singleOperationSpecificationFile.path, "retrieveBillingAccount");
            yield utils_1.generateSourcesFromSpecification(generatorBinary, singleOperationSpecificationFile.path, outputDir, force, validate);
        }
        catch (err) {
            console.log(err);
            process.exit(4);
        }
    });
}
main();
//# sourceMappingURL=index.js.map