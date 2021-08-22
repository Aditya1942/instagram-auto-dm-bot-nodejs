import { IgApiClient } from "instagram-private-api";
import express from "express";
import inquirer from "inquirer";

const ig = new IgApiClient();
const app = express();

const IG_USERNAME = "username"; // enter your username
const IG_PASSWORD = "password"; // enter your password

ig.state.generateDevice(IG_USERNAME);
app.listen(5000);
app.use(express.json());

async function login() {
  // basic login-procedure
  ig.state.generateDevice(IG_USERNAME);
  let auth = await ig.account.login(IG_USERNAME, IG_PASSWORD);
  return auth;
}

(async () => {
  const auth = await login();
  const userFeed = ig.feed.user(auth.pk);
  const myPostsFirstPage = await userFeed.items();
  // All the feeds are auto-paginated, so you just need to call .items() sequentially to get next page

  const sahil = await ig.user.getIdByUsername("sahilhalani10"); // enter your friends username
  const thread = ig.entity.directThread([sahil.toString()]);
  await thread.broadcastText(
    "Hey brother 😊 wish you a very happy birthday🎂🎂 may god bless you😇"
  );
})();

// console.log(ig);
app.get("/", async (req, res) => {
  res.json("server is running");
});
