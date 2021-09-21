import fs from "fs";
import path from "path";
export class Log {
  private errorLogFile = "/ErrorLogs.js";
  private loginLogFile = "/loginLogsFile.js";

  constructor() {}
  public WriteLog(Error: string) {
    let err = JSON.stringify([
      {
        Error: Error,
        Date:
          new Date().toLocaleDateString() +
          " " +
          new Date().toLocaleTimeString(),
      },
    ]);
    fs.appendFileSync(path.join(__dirname, this.errorLogFile), err);

    // this.Log.write(JSON.stringify(err));
  }
  public loginLog() {
    let log = JSON.stringify([
      {
        Date:
          new Date().toLocaleDateString() +
          " " +
          new Date().toLocaleTimeString(),
      },
    ]);
    fs.appendFileSync(path.join(__dirname, this.loginLogFile), log);
  }
}
