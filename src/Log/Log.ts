import fs from "fs";
import path from "path";
export class Log {
  private LogFile = "ErrorLogs.js";
  Log;
  constructor() {
    this.Log = fs.open(path.join(this.LogFile), "a+", function (err, fd) {
      if (err) {
        return console.error(err);
      }
      console.log("File opened successfully!");
    });
  }
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
