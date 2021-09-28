"use strict";
import express, { Application } from "express";
import AppRoute from "./router/index";
import dotenv from "dotenv";
import * as cron from "node-cron";
import { AutoBirthdayWish } from "./class/BirthdayWish";
import { InstaLogin } from "./class/InstaLogin";
import {
  AccountRepositoryLoginResponseLogged_in_user,
  IgApiClient,
} from "instagram-private-api";
import { Log } from "./Log/Log";
import DB from "./DB/DB";

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
  console.log("lol");
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
  const log = new Log();
  const db = new DB();
  // login
  const ig: IgApiClient = await Login.init();
  const auth: AccountRepositoryLoginResponseLogged_in_user = await Login.login(
    ig
  ); //login into instagram account using username and password
  console.log("Instabot logged in successfully ");
  // logging loggedin
  log.loginLog();
  const BirthdayWish = new AutoBirthdayWish(ig); // create an instance of the AutoBirthdayWish class
  // const arr = ["hey", "hello", "hii", "howdy", "what's up"];
  // const dm = new DM(ig);
  // const aditya = "aaditya_parmar_";
  // dm.sendInLoop(aditya, ["hello", "hi"], 2);

  const job = cron.schedule(
    "0 0 0 * * *",
    async () => {
      let allfriends: any[] = db.getAll();
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
  job.start();
})();
