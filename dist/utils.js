"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const ncp_1 = require("ncp");
const tmp_1 = __importDefault(require("tmp"));
const util_1 = __importDefault(require("util"));
tmp_1.default.setGracefulCleanup();
const fileExists = util_1.default.promisify(fs_1.default.exists);
exports.fileExists = fileExists;
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
exports.createTempDir = createTempDir;
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
exports.copyDir = copyDir;
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
exports.execute = execute;
//# sourceMappingURL=utils.js.map