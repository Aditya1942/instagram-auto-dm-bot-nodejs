"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoBirthdayWish = void 0;
const luxon_1 = require("luxon");
const Log_1 = require("../Log/Log");
class AutoBirthdayWish {
    constructor(ig) {
        this.Today = luxon_1.DateTime.now().setZone("Asia/Calcutta").setLocale("en");
        this.WishMessage = "Hey! 😊 wish you a very happy birthday🎂🎂 may god bless you😇";
        this.log = new Log_1.Log();
        this.ig = ig;
    }
    RemaingDaysCount(BirthdayDate) {
        let Bday = luxon_1.DateTime.fromJSDate(new Date(BirthdayDate))
            .setZone("Asia/Calcutta")
            .setLocale("en");
        let _ThisMonth = parseInt(this.Today.toFormat("MM"));
        let _BdayMonth = parseInt(Bday.toFormat("MM"));
        let _TodaysDay = parseInt(this.Today.toFormat("dd"));
        let _Bday = parseInt(Bday.toFormat("dd"));
        if (_ThisMonth < _BdayMonth ||
            (_ThisMonth == _BdayMonth && _TodaysDay >= _Bday)) {
            Bday = luxon_1.DateTime.fromJSDate(new Date(`${_BdayMonth}/${_Bday}/${this.Today.year}`))
                .setZone("Asia/Calcutta")
                .setLocale("en");
        }
        else {
            Bday = luxon_1.DateTime.fromJSDate(new Date(`${_BdayMonth}/${_Bday}/${this.Today.year + 1}`))
                .setZone("Asia/Calcutta")
                .setLocale("en");
        }
        Bday = Bday.toFormat("x");
        let Today = this.Today.toFormat("x");
        let days = Math.ceil((Bday - Today) / (1000 * 60 * 60 * 24));
        if (days < 0) {
            return (days += 365);
        }
        else if (days > 365) {
            return days - 365;
        }
        else {
            return days + 0;
        }
    }
    async DailyReminder(username, msg) {
        const friend = await this.ig.user.getIdByUsername(username);
        const thread = this.ig.entity.directThread([friend.toString()]);
        return await thread.broadcastText(msg);
    }
    async DailyReminderForAll(obj, time = 1) {
        try {
            var count = 0;
            var interval = setInterval(async () => {
                if (count > obj.length - 1) {
                    clearInterval(interval);
                    return Promise.resolve({ status: "success" });
                }
                else {
                    let days = await this.RemaingDaysCount(obj[count].birthDate);
                    await this.DailyReminder(obj[count].username, `hey ${days} days left for your birthday thank you`);
                    console.log(obj[count].username, obj[count].birthDate);
                    count++;
                }
            }, 1000 * time);
            return Promise.resolve({ status: "success" });
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async wish(username) {
        try {
            const friend = await this.ig.user.getIdByUsername(username);
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
        }
        catch (error) {
            this.log.WriteLog(error.message);
            return error.message;
        }
    }
}
exports.AutoBirthdayWish = AutoBirthdayWish;
//# sourceMappingURL=BirthdayWish.js.map