"use strict";
import express, { Application } from "express";
import AppRoute from "./router/index";
import dotenv from "dotenv";
import * as cron from "node-cron";
import { AutoBirthdayWish } from "./class/BirthdayWish";
import { InstaLogin } from "./class/InstaLogin";
import { AccountRepositoryCurrentUserResponseUser } from "instagram-private-api";
import DB from "./DB/DB";
import { IgApiClientRealtime } from "instagram_mqtt";
import { RealTimeEvents } from "./class/RealTimeEvents";

/********************************************* config *********************************************/
const PORT = process.env.PORT || 8000;
const app: Application = express();
app.use(express.json()); // To parse the incoming requests with JSON payloads
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
dotenv.config();

/********************************************* router *********************************************/
process.env.TZ = "Asia/Calcutta";
app.get("/", (_, res) => {
  res.json({ message: `App is running on port ${PORT}` });
});
app.use("/api", AppRoute);
app.use("*", (_, res) => {
  res.json({ message: "Make sure url is correct!" });
});
/********************************************* server setup finish *********************************************/

// instaBot login

// cron-job for daily
(async () => {
  // 2fa code get from runtime argument
  const code = process.argv[2];
  // classes instance
  const Login = new InstaLogin(code);
  const db = new DB();
  // login

  const ig: IgApiClientRealtime = await Login.login();

  const auth = await ig.account.currentUser();
  console.log(auth.username);
  //login into instagram account using username and password
  // const realTimeEvents = new RealTimeEvents(ig);
  const BirthdayWish = new AutoBirthdayWish(ig); // create an instance of the AutoBirthdayWish class
  // realTimeEvents.init();
  cron.schedule(
    " 0 0 * * * ",
    async function () {
      let allfriends: any[] = db.getAll();
      await db.refresh();
      BirthdayWish.DailyReminderForAll(
        allfriends.filter((x) => x.dailyReminder)
      );
      console.log("running a task every day at 12:00:00 AM");
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
})();
