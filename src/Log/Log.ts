import fs from "fs";
import path from "path";
export class Log {
  private LogFile = "ErrorLogs.js";

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
    fs.appendFileSync(path.join(this.LogFile), err);

    // this.Log.write(JSON.stringify(err));
  }
}
