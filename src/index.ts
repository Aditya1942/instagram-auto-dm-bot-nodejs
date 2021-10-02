"use strict";
import express, { Application } from "express";
import AppRoute from "./router/index";
import dotenv from "dotenv";
import * as cron from "node-cron";
import { AutoBirthdayWish } from "./class/BirthdayWish";
import { InstaLogin } from "./class/InstaLogin";
import {
  AccountRepositoryCurrentUserResponseUser,
  IgApiClient,
} from "instagram-private-api";
import { Log } from "./Log/Log";
import DB from "./DB/DB";
import {
  GraphQLSubscriptions,
  IgApiClientRealtime,
  SkywalkerSubscriptions,
  withFbnsAndRealtime,
} from "instagram_mqtt";
import path from "path";

import { readFile, writeFile, access } from "fs/promises";
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
  const db = new DB();
  // login

  const ig: IgApiClientRealtime = await Login.login();
  const auth: AccountRepositoryCurrentUserResponseUser =
    await ig.account.currentUser();
  //login into instagram account using username and password
  console.log(auth, "Instabot logged in successfully ");
  // logging loggedin
  const BirthdayWish = new AutoBirthdayWish(ig); // create an instance of the AutoBirthdayWish class

  function logEvent(name: string) {
    return (data: any) => console.log(name, data);
  }
  ig.realtime.on("direct", logEvent("direct"));
  ig.realtime.on("message", logEvent("messageWrapper"));
  await ig.realtime.connect({
    // optional
    graphQlSubs: [
      // these are some subscriptions
      GraphQLSubscriptions.getAppPresenceSubscription(),
      GraphQLSubscriptions.getZeroProvisionSubscription(ig.state.phoneId),
      GraphQLSubscriptions.getDirectStatusSubscription(),
      GraphQLSubscriptions.getDirectTypingSubscription(ig.state.cookieUserId),
      GraphQLSubscriptions.getAsyncAdSubscription(ig.state.cookieUserId),
    ],
    // optional
    skywalkerSubs: [
      SkywalkerSubscriptions.directSub(ig.state.cookieUserId),
      SkywalkerSubscriptions.liveSub(ig.state.cookieUserId),
    ],
    // optional
    // this enables you to get direct messages
    irisData: await ig.feed.directInbox().request(),
    // optional
    // in here you can change connect options
    // available are all properties defined in MQTToTConnectionClientInfo
    connectOverrides: {},

    // optional
    // use this proxy
    // socksOptions: {
    //     type: 5,
    //     port: 12345,
    //     host: '...'
    // }
  });

  // simulate turning the device off after 2s and turning it back on after another 2s
  setTimeout(() => {
    console.log("Device off");
    // from now on, you won't receive any realtime-data as you "aren't in the app"
    // the keepAliveTimeout is somehow a 'constant' by instagram
    ig.realtime.direct.sendForegroundState({
      inForegroundApp: false,
      inForegroundDevice: false,
      keepAliveTimeout: 900,
    });
  }, 2000);
  setTimeout(() => {
    console.log("In App");
    ig.realtime.direct.sendForegroundState({
      inForegroundApp: true,
      inForegroundDevice: true,
      keepAliveTimeout: 60,
    });
  }, 4000);
  // const job = cron.schedule(
  //   "0 0 0 * * *",
  //   async () => {
  //     let allfriends: any[] = db.getAll();
  //     BirthdayWish.DailyReminderForAll(
  //       allfriends.filter((x) => x.dailyReminder)
  //     );
  //     console.log("running a task every day at 12:00:00 AM");
  //   },
  //   {
  //     scheduled: true,
  //     timezone: "Asia/Kolkata",
  //   }
  // );
  // job.start();
})();
