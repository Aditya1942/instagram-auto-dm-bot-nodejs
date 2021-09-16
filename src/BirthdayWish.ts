import { DateTime } from "luxon";
import { Log } from "./Log/Log";

export class AutoBirthdayWish {
  private Today = DateTime.now().setZone("Asia/Calcutta").setLocale("en");

  private WishMessage: string =
    "Hey! 😊 wish you a very happy birthday🎂🎂 may god bless you😇";
  private ig;
  log = new Log();
  constructor(ig) {
    this.ig = ig;
  }
  RemaingDaysCount(BirthdayDate): any {
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
  async DailyReminder(username, msg) {
    const sahil = await this.ig.user.getIdByUsername(username); // enter your friends username
    const thread = this.ig.entity.directThread([sahil.toString()]);
    await thread.broadcastText(msg);
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
