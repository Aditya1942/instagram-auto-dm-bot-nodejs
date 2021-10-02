import path from "path";
import { readFile, writeFile, access } from "fs/promises";

export class Log {
  private errorLogFile = path.join(__dirname, "/ErrorLogs.json");
  private loginLogFile = path.join(__dirname, "/loginLogsFile.json");

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
    writeFile(this.errorLogFile, err);

    // this.Log.write(JSON.stringify(err));
  }
  public loginLog(data = null) {
    let log = JSON.stringify([
      {
        data: data,
        Date:
          new Date().toLocaleDateString() +
          " " +
          new Date().toLocaleTimeString(),
      },
    ]);
    writeFile(this.loginLogFile, log);
  }
}
