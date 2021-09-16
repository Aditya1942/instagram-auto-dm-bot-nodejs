"use strict";

import express, { Application } from "express";
import AppRoute from "./router/index";
// import fs from "fs";
// import path from "path";
import dotenv from "dotenv";
// import * as Database from "src/DB/DB";
import * as cron from "node-cron";
import { AutoBirthdayWish } from "./BirthdayWish";
import { InstaLogin } from "./class/InstaLogin";
import {
  AccountRepositoryLoginResponseLogged_in_user,
  DirectInboxFeedResponseThreadsItem,
  Feed,
  IgApiClient,
} from "instagram-private-api";
/********************************************* config *********************************************/
const PORT = process.env.PORT || 8000;
const app: Application = express();
app.use(express.json()); // To parse the incoming requests with JSON payloads
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
dotenv.config();
// const Db = new Database.default();
/********************************************* router *********************************************/
app.get("/", (_, res) => {
  // res.sendFile(path.join(__dirname, "/index.html"));
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
  // login class instance
  const Login = new InstaLogin(code);
  // login
  const ig: IgApiClient = await Login.init();
  const auth: AccountRepositoryLoginResponseLogged_in_user = await Login.login(
    ig
  ); //login into instagram account using username and password

  const BirthdayWish = new AutoBirthdayWish(ig); // create an instance of the AutoBirthdayWish class

  // BirthdayWish.wish("aaditya_parmar_");

  const job = cron.schedule(
    "0 0 0 * * *",
    async () => {
      console.log("running a task every day at 12:00:00 AM");
      let daysLeft = BirthdayWish.RemaingDaysCount("2001/02/28"); // get the days left for the birthday from the current date to the birthday
      BirthdayWish.DailyReminder(
        "aaditya_parmar_",
        `hey ${daysLeft}  days left for your birthday thank you`
      ); // send the message to the user
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
  job.start();
})();
