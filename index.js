const express = require("express");
const inquirer = require("inquirer");
const dotenv = require("dotenv");
const cron = require("node-cron");
const { IgApiClient } = require("instagram-private-api");
const { IgLoginTwoFactorRequiredError } = require("instagram-private-api");
const db = require("./connect");
const app = express();
const { DateTime } = require("luxon");
process.env.TZ = 'Asia/Calcutta'
global.con=db;
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


const  login = async ()=> {
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
const  wish = async (username)=> {
  const friend = await ig.user.getIdByUsername(username); // enter your friends username
  const thread = ig.entity.directThread([friend.toString()]);
  await thread.broadcastText(
      "Hey! 😊 wish you a very happy birthday🎂🎂 may god bless you😇"
    );
}

const  dailyTest = async (mgs)=>{
  const sahil = await ig.user.getIdByUsername("sahilhalani10"); // enter your friends username
  const thread = ig.entity.directThread([sahil.toString()]);
  await thread.broadcastText(
    mgs
  );
}
const getFriends = async (callback) => {
  // get friends from the database and wish to all the friends

db.query('SELECT * FROM friends', function(err, result)
{
    if (err) 
        callback(err,null);
    else
        callback(null,result);

});


}
(async () => {
  const auth = await login();
  const userFeed = ig.feed.user(auth.pk);
  const myPostsFirstPage = await userFeed.items();
  console.log("instabot login successfully");
  // All the feeds are auto-paginated, so you just need to call .items() sequentially to get next page


 

  const WishReminder = (bday,today)=>{
    let Bday = DateTime.fromISO(bday).toFormat('x');
    let Today = DateTime.fromISO(today).toFormat('x');
    let days = Math.ceil((Bday - Today)/(1000*60*60*24));
    if(days < 0){
      console.log(days+=365);
      let msg = `hey ${days+=365} days left for your birthday thank you`
      dailyTest(msg)
    }else{
      let msg = `hey ${days} days left for your birthday thank you`
      dailyTest(msg)
      console.log(days);
    }
  }



  cron.schedule(" 0 0 * * * ", function () {
    getFriends((err,data) => {
      data.forEach((element,index) => {
        setTimeout(function () {
          let bday = new Date(element.birthday);
          let today = new Date();
          let Today = DateTime.now().setZone('Asia/Calcutta').setLocale('en');
          let Bday = DateTime.fromJSDate(element.birthday).setZone('Asia/Calcutta').setLocale('en'); 
       
          console.log("today",Today.toFormat("t"),Bday.toFormat("t"));
          if (Today.toFormat("MM") == Bday.toFormat("MM") && Today.toFormat("dd") == Bday.toFormat("dd")) {
            wish(element.username)
          }else{
            WishReminder(Bday.toISO(),Today.toISO())
          }
        }, index * 2000);
      });
     })
    console.log("Running Cron Job",DateTime.now().toFormat('t'));
  });
})();

// database 


app.get("/all", async (req, res) => {
  con.query("SELECT * FROM friends", function (err, result, fields) {
    if (err) throw err;
     res.send({
    message: 'Table Data',
    Total_record:result?.length,
    result:result
    });

    console.log(result);
    });

});



// console.log(ig);
app.get("/", async (req, res) => {
  res.json("server is running");
});

app.post("/add", async (req, res) => {
  let username=req.body.username
  let fullname=req.body.fullname 
  let birthday=new Date( req.body.birthday)
  var sql = "INSERT INTO friends (username,fullname,birthday) VALUES ?";
  var values = [[username,fullname,birthday]]
  con.query(sql,[values], function (err, result, fields) {
  if (err) throw err;
  res.send({
  message: 'Table Data',
  Total_record:result?.length,
  result:result
  });
  });

});


