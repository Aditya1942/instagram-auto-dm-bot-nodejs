"use strict";

import express, { Application } from "express";
import AppRoute from "./router/index";
// import fs from "fs";
// import path from "path";
import dotenv from "dotenv";
// import * as Database from "src/DB/DB";
import * as cron from "node-cron";
import { AutoBirthdayWish } from "./BirthdayWish";
import {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
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
app.get("/", (_, res) =>
  res.json({ message: `App is running on port ${PORT}` })
);
app.use("/api", AppRoute);
app.use("*", (_, res) => {
  res.json({ message: "Make sure url is correct!" });
});
/********************************************* server setup finish *********************************************/

// instaBot login
const IG_USERNAME = process.env.IG_USERNAME; // enter your username
const IG_PASSWORD = process.env.IG_PASSWORD; // enter your password
const ig = new IgApiClient();
ig.state.generateDevice(IG_USERNAME);
const login = async () => {
  try {
    return await ig.account.login(IG_USERNAME, IG_PASSWORD);
  } catch (e) {
    if (e instanceof IgLoginTwoFactorRequiredError) {
      // 2FA is enabled
      // Prompt user for 2FA code
      const { username, totp_two_factor_on, two_factor_identifier } =
        e.response.body.two_factor_info;
      // decide which method to use
      const verificationMethod = totp_two_factor_on ? "0" : "1"; // default to 1 for SMS
      // At this point a code should have been sent
      console.log("verificationMethod :", verificationMethod);
      // Get the code
      // const { code } = await inquirer.prompt([
      //   {
      //     type: "input",
      //     name: "code",
      //     message: `Enter code received via ${
      //       verificationMethod === "1" ? "SMS" : "TOTP"
      //     }`,
      //   },
      // ]);
      const code = process.argv[2];
      // Use the code to finish the login process
      return ig.account.twoFactorLogin({
        username,
        verificationCode: code,
        twoFactorIdentifier: two_factor_identifier,
        verificationMethod, // '1' = SMS (default), '0' = TOTP (google auth for example)
        trustThisDevice: "1", // Can be omitted as '1' is used by default
      });
    }
  }
};
// cron-job for daily
(async () => {
  await login(); //login into instagram account using username and password
  const BirthdayWish = new AutoBirthdayWish(ig); // create an instance of the AutoBirthdayWish class
  let daysLeft = BirthdayWish.RemaingDaysCount("2001/12/23"); // get the days left for the birthday from the current date to the birthday
  console.log(daysLeft);
  // BirthdayWish.DailyReminder(
  //   "sahilhalani10",
  //   `hey ${daysLeft}  days left for your birthday thank you`
  // );
  // BirthdayWish.wish("sahilhalani1");
  const job = cron.schedule(
    "0 0 0 * * *",
    async () => {
      console.log("running a task every day at 12:00:00 AM");
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
  job.start();
})();
