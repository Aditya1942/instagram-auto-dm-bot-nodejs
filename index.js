import {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
} from "instagram-private-api";
import express from "express";
import inquirer from "inquirer";
import dotenv from "dotenv";
import cron from "node-cron";

const app = express();
dotenv.config("./.env");
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use(express.json());
const IG_USERNAME = process.env.IG_USERNAME; // enter your username
const IG_PASSWORD = process.env.IG_PASSWORD; // enter your password
const ig = new IgApiClient();

ig.state.generateDevice(IG_USERNAME);
async function login() {
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
      const { code } = await inquirer.prompt([
        {
          type: "input",
          name: "code",
          message: `Enter code received via ${
            verificationMethod === "1" ? "SMS" : "TOTP"
          }`,
        },
      ]);
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
}
async function wish() {
  const sahil = await ig.user.getIdByUsername("sahilhalani10"); // enter your friends username
  const thread = ig.entity.directThread([sahil.toString()]);
  await thread.broadcastText(
    "Hey brother 😊 wish you a very happy birthday🎂🎂 may god bless you😇"
  );
}

(async () => {
  const auth = await login();
  const userFeed = ig.feed.user(auth.pk);
  const myPostsFirstPage = await userFeed.items();
  console.log(auth);
  // All the feeds are auto-paginated, so you just need to call .items() sequentially to get next page

  const date = new Date();
  date.setTime(date.getTime() + 1000);

  cron.schedule(" 0 0 0  * * * ", function () {
    console.log("---------------------");
    console.log("Running Cron Job");
    wish();
  });
})();

// console.log(ig);
app.get("/", async (req, res) => {
  res.json("server is running");
});
