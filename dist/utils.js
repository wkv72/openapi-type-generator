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
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const ncp_1 = require("ncp");
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
const util_1 = __importDefault(require("util"));
const yaml_1 = __importDefault(require("yaml"));
const openapiExtractor = require("openapi-extract");
const omitDeep = require("omit-deep");
const readFile = util_1.default.promisify(fs_1.default.readFile);
const writeFile = util_1.default.promisify(fs_1.default.writeFile);
tmp_1.default.setGracefulCleanup();
const fileExists = util_1.default.promisify(fs_1.default.exists);
const createTempDir = (prefix) => {
    return new Promise((resolve, reject) => {
        tmp_1.default.dir({ prefix }, (err, tempDir) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(tempDir);
            }
        });
    });
};
const copyDir = (source, destination) => {
    return new Promise((resolve, reject) => {
        ncp_1.ncp(source, destination, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
const execute = (command) => {
    return new Promise((resolve, reject) => {
        child_process_1.exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
const fixSpecificationFile = (inputFile, outputDir) => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const content = yield readFile(inputFile, "utf-8");
            const object = omitDeep(yaml_1.default.parse(content), ["@baseType", "@schemaLocation", "@type"]);
            yield writeFile(outputDir, yaml_1.default.stringify(object));
            resolve();
        }
        catch (err) {
            reject(err);
        }
    }));
};
exports.fixSpecificationFile = fixSpecificationFile;
const validateSpecificationFile = (generatorBinary, inputFile) => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield execute(`${generatorBinary} validate -i ${inputFile}`);
            resolve();
        }
        catch (err) {
            reject(err);
        }
    }));
};
const extractOperationIdFromSpecificationFile = (inputFile, outputFile, operationid) => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const inputFileContent = yield readFile(inputFile, "utf-8");
            const inputFileObject = yaml_1.default.parse(inputFileContent);
            const outputFileObject = openapiExtractor.extract(inputFileObject, {
                operationid,
            });
            yield writeFile(outputFile, yaml_1.default.stringify(outputFileObject));
            resolve();
        }
        catch (err) {
            reject(err);
        }
    }));
};
exports.extractOperationIdFromSpecificationFile = extractOperationIdFromSpecificationFile;
const generateSourcesFromSpecification = (generatorBinary, specificationFile, outputDir, force, validate) => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(yield fileExists(specificationFile))) {
                console.error(`[Error] The input file '${specificationFile}' does not exist.`);
                process.exit(2);
            }
            if (!force && (yield fileExists(outputDir))) {
                console.error(`[Error] The output directory '${outputDir}' already exist.`);
                process.exit(3);
            }
            if (validate) {
                yield validateSpecificationFile(generatorBinary, specificationFile);
            }
            const tempDir = yield createTempDir("openapi-tg");
            yield execute(`${generatorBinary} generate -g typescript-node -i ${specificationFile} -o ${tempDir}`);
            yield copyDir(path_1.default.join(tempDir, "model"), outputDir);
            resolve();
        }
        catch (err) {
            reject(err);
        }
    }));
};
exports.generateSourcesFromSpecification = generateSourcesFromSpecification;
//# sourceMappingURL=utils.js.map