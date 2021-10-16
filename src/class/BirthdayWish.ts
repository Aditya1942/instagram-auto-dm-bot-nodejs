import { DateTime } from "luxon";
import { Log } from "../Log/Log";

export class AutoBirthdayWish {
  private Today;

  private WishMessage: string =
    "Hey! 😊 wish you a very happy birthday🎂🎂 may god bless you😇";
  private ig;
  log = new Log();
  constructor(ig) {
    this.ig = ig;
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
    obj: { username: string; birthDate: string }[],
    time: number = 1
  ) {
    try {
      var count = 0;
      var interval = setInterval(async () => {
        // if count is less than the length of the array
        if (count <= obj.length - 1) {
          let days = await this.RemaingDaysCount(obj[count].birthDate);
          await this.DailyReminder(
            obj[count].username,
            `hey ${days} days left for your birthday thank you`
          );
          console.log(count, obj[count].username, obj[count].birthDate);
          count++;
        } else {
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
}
