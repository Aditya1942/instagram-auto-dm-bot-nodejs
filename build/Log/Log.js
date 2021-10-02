"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Log {
    constructor() {
        this.errorLogFile = "/ErrorLogs.js";
        this.loginLogFile = "/loginLogsFile.js";
    }
    WriteLog(Error) {
        let err = JSON.stringify([
            {
                Error: Error,
                Date: new Date().toLocaleDateString() +
                    " " +
                    new Date().toLocaleTimeString(),
            },
        ]);
        fs_1.default.appendFileSync(path_1.default.join(__dirname, this.errorLogFile), err);
    }
    loginLog() {
        let log = JSON.stringify([
            {
                Date: new Date().toLocaleDateString() +
                    " " +
                    new Date().toLocaleTimeString(),
            },
        ]);
        fs_1.default.appendFileSync(path_1.default.join(__dirname, this.loginLogFile), log);
    }
}
exports.Log = Log;
//# sourceMappingURL=Log.js.map