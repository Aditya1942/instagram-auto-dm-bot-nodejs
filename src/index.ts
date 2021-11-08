"use strict";
import express, { Application } from "express";
import AppRoute from "./router/index";
import dotenv from "dotenv";
import { AutoBirthdayWish } from "./class/BirthdayWish";
import { InstaLogin } from "./class/InstaLogin";
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
  // login

  //login into instagram account using username and password
  const ig: IgApiClientRealtime = await Login.login();
  const auth = await ig.account.currentUser();
  console.log("logged in as ", auth.username);
  // to automatically send birthday wishes to your friends
  const BirthdayWish = new AutoBirthdayWish(ig); // create an instance of the AutoBirthdayWish class
  BirthdayWish.schedule(); // schedule the job for midnight 12:00 AM

  // // initial real Time dm event
  // const realTimeEvents = new RealTimeEvents(ig);
  // realTimeEvents.init();

  // // subcribe to dm;
  // realTimeEvents.dm.subscribe((data) => {
  //   console.log("home", data);
  // });
})();
