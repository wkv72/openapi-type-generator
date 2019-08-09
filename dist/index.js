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
const minimist = require("minimist");
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
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
const inputFile = path_1.default.join(process.cwd(), parsedArgs.i);
const outputDir = path_1.default.join(process.cwd(), parsedArgs.o);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(yield utils_1.fileExists(inputFile))) {
                console.error(`Input file '${inputFile}' does not exist.`);
                process.exit(2);
            }
            if (yield utils_1.fileExists(outputDir)) {
                console.error(`Output directory '${outputDir}' already exist.`);
                process.exit(3);
            }
            const tempDir = yield utils_1.createTempDir("openapi-tg");
            yield utils_1.execute(`openapi-generator generate -g typescript-node -i ${inputFile} -o ${tempDir}`);
        }
        catch (err) {
            console.error(err);
        }
    });
}
main();
//# sourceMappingURL=index.js.map