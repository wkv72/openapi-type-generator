import {exec} from "child_process";
import fs from "fs";
import {ncp} from "ncp";
import path from "path";
import tmp from "tmp";
import util from "util";
import YAML from "yaml";

const openapiExtractor = require("openapi-extract");
const omitDeep = require("omit-deep");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

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

const fixSpecificationFile = (inputFile: string, outputDir: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const content = await readFile(inputFile, "utf-8");
            const object = omitDeep(YAML.parse(content), ["@baseType", "@schemaLocation", "@type"]);
            await writeFile(outputDir, YAML.stringify(object));
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

const validateSpecificationFile = (
    generatorBinary: string,
    inputFile: string,
) => {
    return new Promise(async (resolve, reject) => {
        try {
            await execute(`${generatorBinary} validate -i ${inputFile}`);
            resolve();
        } catch (err) {
            reject();
        }
    });
};

const extractOperationIdFromSpecificationFile = (
    inputFile: string,
    outputFile: string,
    operationid: string,
) => {
    return new Promise(async (resolve, reject) => {
        try {
            const inputFileContent = await readFile(inputFile, "utf-8");
            const inputFileObject = YAML.parse(inputFileContent);

            const outputFileObject = openapiExtractor.extract(inputFileObject, {
                operationid,
            });

            await writeFile(outputFile, YAML.stringify(outputFileObject));

            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

const generateSourcesFromSpecification = (
    generatorBinary: string,
    specificationFile: string,
    outputDir: string,
    force: boolean,
    validate: boolean,
) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!await fileExists(specificationFile)) {
                console.error(`[Error] The input file '${specificationFile}' does not exist.`);
                process.exit(2);
            }

            if (!force && await fileExists(outputDir)) {
                console.error(`[Error] The output directory '${outputDir}' already exist.`);
                process.exit(3);
            }

            if (validate) {
                await validateSpecificationFile(generatorBinary, specificationFile);
            }

            const tempDir = await createTempDir("openapi-tg");
            await execute(`${generatorBinary} generate -g typescript-node -i ${specificationFile} -o ${tempDir}`);
            await copyDir(path.join(tempDir, "model"), outputDir);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

export {extractOperationIdFromSpecificationFile, fixSpecificationFile, generateSourcesFromSpecification};
