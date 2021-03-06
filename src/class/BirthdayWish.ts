import { DateTime } from "luxon";
import { Log } from "../Log/Log";
import * as cron from "node-cron";
import DB from "src/DB/DB";

export class AutoBirthdayWish {
  private Today;
  db: DB;

  private WishMessage: string =
    "Hey! ๐ wish you a very happy birthday๐๐ may god bless you๐";
  private ig;
  log = new Log();
  constructor(ig) {
    this.ig = ig;
    this.db = new DB();
  }
  RemaingDaysCount(BirthdayDate): any {
    this.Today = DateTime.now().setZone("Asia/Calcutta").setLocale("en");
    let Bday = DateTime.fromJSDate(new Date(BirthdayDate))
      .setZone("Asia/Calcutta")
      .setLocale("en");
    let _ThisMonth = parseInt(this.Today.toFormat("MM"));
    let _BdayMonth = parseInt(Bday.toFormat("MM"));
    let _TodaysDay = parseInt(this.Today.toFormat("dd"));
    let _Bday = parseInt(Bday.toFormat("dd"));
    if (
      _ThisMonth < _BdayMonth ||
      (_ThisMonth == _BdayMonth && _TodaysDay >= _Bday)
    ) {
      Bday = DateTime.fromJSDate(
        new Date(`${_BdayMonth}/${_Bday}/${this.Today.year}`)
      )
        .setZone("Asia/Calcutta")
        .setLocale("en");
    } else {
      Bday = DateTime.fromJSDate(
        new Date(`${_BdayMonth}/${_Bday}/${this.Today.year + 1}`)
      )
        .setZone("Asia/Calcutta")
        .setLocale("en");
    }

    Bday = Bday.toFormat("x");
    let Today = this.Today.toFormat("x");
    let days = Math.ceil((Bday - Today) / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return (days += 365);
    } else if (days > 365) {
      return days - 365;
    } else {
      return days + 0;
    }
  }
  today() {
    this.Today = DateTime.now().setZone("Asia/Calcutta").setLocale("en");
    return this.Today.toFormat("F");
  }
  async DailyReminder(username, msg) {
    const friend = await this.ig.user.getIdByUsername(username); // enter your friends username
    const thread = this.ig.entity.directThread([friend.toString()]);
    return await thread.broadcastText(msg);
  }

  async DailyReminderForAll(
    arr: { username: string; birthDate: string }[],
    time: number = 1
  ) {
    try {
      var count = -1;
      var interval = setInterval(async () => {
        count++;
        let days = await this.RemaingDaysCount(arr[count].birthDate);
        await this.DailyReminder(
          arr[count].username,
          `hey ${days} days left for your birthday thank you`
        );
        console.log(count, arr[count].username, arr[count].birthDate);
        if (count >= arr.length - 1) {
          clearInterval(interval);
          return Promise.resolve({ status: "success" });
        }
      }, 1000 * time);
      return Promise.resolve({ status: "success" });
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async wish(username) {
    try {
      const friend = await this.ig.user.getIdByUsername(username); // enter your friends username
      const thread = this.ig.entity.directThread([friend.toString()]);
      await thread
        .broadcastText(this.WishMessage)
        .then(() => {
          return "Message sent";
        })
        .catch((err) => {
          console.log("ERROR ", err);
          this.log.WriteLog(err.message);
          return err;
        });
    } catch (error) {
      this.log.WriteLog(error.message);
      return error.message;
    }
  }

  schedule() {
    cron.schedule(
      " 0 0 * * * ",
      async function () {
        let allfriends: any[] = this.db.getAll();
        await this.db.refresh();
        this.DailyReminderForAll(allfriends.filter((x) => x.dailyReminder));
        console.log("running a task every day at 12:00:00 AM");
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );
  }
}
