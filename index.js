const express = require("express");
const inquirer = require("inquirer");
const dotenv = require("dotenv");
const cron = require("node-cron");
const { IgApiClient } = require("instagram-private-api");
const { IgLoginTwoFactorRequiredError } = require("instagram-private-api");
const db = require("./connect");
const app = express();
const { DateTime } = require("luxon");
process.env.TZ = "Asia/Calcutta";
global.con = db;
dotenv.config("./.env");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use(express.json());
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
};
const wish = async (username) => {
  const friend = await ig.user.getIdByUsername(username); // enter your friends username
  const thread = ig.entity.directThread([friend.toString()]);
  await thread.broadcastText(
    "Hey! 😊 wish you a very happy birthday🎂🎂 may god bless you😇"
  );
};

const dailyTest = async (mgs) => {
  const sahil = await ig.user.getIdByUsername("sahilhalani10"); // enter your friends username
  const thread = ig.entity.directThread([sahil.toString()]);
  await thread.broadcastText(mgs);
};
const getFriends = async (callback) => {
  // get friends from the database and wish to all the friends

  db.query("SELECT * FROM friends", function (err, result) {
    if (err) callback(err, null);
    else callback(null, result);
  });
};
(async () => {
  const auth = await login();
  const userFeed = ig.feed.user(auth.pk);
  const myPostsFirstPage = await userFeed.items();
  console.log("instabot login successfully");
  // All the feeds are auto-paginated, so you just need to call .items() sequentially to get next page

  const WishReminder = () => {
    let Bday = DateTime.fromJSDate(new Date("12/23/2001"))
      .setZone("Asia/Calcutta")
      .setLocale("en");
    let Today = DateTime.now().setZone("Asia/Calcutta").setLocale("en");
    let _ThisMonth = parseInt(Today.toFormat("MM"));
    let _BdayMonth = parseInt(Bday.toFormat("MM"));
    let _TodaysDay = parseInt(Today.toFormat("dd"));
    let _Bday = parseInt(Bday.toFormat("MM"));

    // birthdday yet to come this year
    if (
      _ThisMonth < _BdayMonth ||
      (_ThisMonth == _BdayMonth && _TodaysDay > _Bday)
    ) {
      Bday = DateTime.fromJSDate(new Date(`12/23/${parseInt(Today.year)}`))
        .setZone("Asia/Calcutta")
        .setLocale("en");
    } else {
      // birthdday will come next year
      Bday = DateTime.fromJSDate(
        new Date(`12/23/${parseInt(Today.toFormat("yyyy")) + 1}`)
      )
        .setZone("Asia/Calcutta")
        .setLocale("en");
    }

    console.log(Bday.toFormat("dd/MM/yyyy"));

    Bday = Bday.toFormat("x");
    Today = Today.toFormat("x");
    let days = Math.ceil((Bday - Today) / (1000 * 60 * 60 * 24));
    let msg;
    if (days < 0) {
      console.log((days += 365));
      msg = `hey ${(days += 365)} days left for your birthday thank you`;
    } else {
      msg = `hey ${days} days left for your birthday thank you`;
      console.log(days);
    }
    dailyTest(msg);
  };

  cron.schedule(" 0 0 * * * ", function () {
    getFriends((err, data) => {
      data.forEach((element, index) => {
        // 2 second gap to wish each friend individually
        setTimeout(function () {
          let Today = DateTime.now().setZone("Asia/Calcutta").setLocale("en");
          let Bday = DateTime.fromJSDate(element.birthday)
            .setZone("Asia/Calcutta")
            .setLocale("en");
          console.log(
            "today",
            Today.toFormat("t"),
            Bday.toFormat("dd/MM/yyyy")
          );
          if (
            Today.toFormat("MM") == Bday.toFormat("MM") &&
            Today.toFormat("dd") == Bday.toFormat("dd")
          ) {
            // if birthday is today then wish that  friend
            console.log("Wishing " + element.fullname);
            wish(element.username);
          }
        }, index * 2000);
      });
    });
    // for daily test  // WishReminder("sahilhalani10");
    WishReminder();

    console.log("Running Cron Job", DateTime.now().toFormat("t"));
  });
})();

// database

app.get("/all", async (req, res) => {
  con.query("SELECT * FROM friends", function (err, result, fields) {
    if (err) throw err;
    res.send({
      message: "Table Data",

      result: result,
    });
  });
});

// console.log(ig);
app.get("/", async (req, res) => {
  res.json("server is running");
});

app.post("/add", async (req, res) => {
  let username = req.body.username;
  let fullname = req.body.fullname;
  let birthday = new Date(req.body.birthday);
  var sql = "INSERT INTO friends (username,fullname,birthday) VALUES ?";
  var values = [[username, fullname, birthday]];
  con.query(sql, [values], function (err, result, fields) {
    if (err) throw err;
    res.send({
      message: "Table Data",

      result: result,
    });
  });
});
