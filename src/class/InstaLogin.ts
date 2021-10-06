import {
  AccountRepositoryLoginResponseLogged_in_user,
  IgApiClient,
  IgLoginTwoFactorRequiredError,
} from "instagram-private-api";
import { IgApiClientRealtime, withFbnsAndRealtime } from "instagram_mqtt";
import { readFile, writeFile, access } from "fs/promises";
import path from "path";
import { Log } from "../Log/Log";

export class InstaLogin {
  private IG_USERNAME = process.env.IG_USERNAME; // enter your username
  private IG_PASSWORD = process.env.IG_PASSWORD; // enter your password
  private IG_2FACode;
  private STATE_PATH = path.join(__dirname, "../Log/loginState.json");

  // private ig = new IgApiClient();
  private ig: IgApiClientRealtime = withFbnsAndRealtime(
    new IgApiClient() /* you may pass mixins in here */
  );
  private log = new Log();

  constructor(code) {
    this.IG_2FACode = code;
    this.ig.state.generateDevice(this.IG_USERNAME);
  }

  async login(): Promise<IgApiClientRealtime> {
    this.ig.request.end$.subscribe(async () => {
      const serialized = await this.ig.state.serialize();
      delete serialized.constants;
      const data = JSON.stringify(serialized);

      this.save(data);
      this.log.loginLog(data);
    });
    if (this.IG_USERNAME != null && this.IG_PASSWORD != null) {
      try {
        if (!(await this.tryLoadSession())) {
          await this.ig.account.login(this.IG_USERNAME, this.IG_PASSWORD);
          console.log("Logging in with credentials");
        }
        return this.ig;
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
          // Get the code with input from the user
          // const { code } = await inquirer.prompt([
          //   {
          //     type: "input",
          //     name: "code",
          //     message: `Enter code received via ${
          //       verificationMethod === "1" ? "SMS" : "TOTP"
          //     }`,
          //   },
          // ]);

          // Use the code to finish the login process
          this.ig.account.twoFactorLogin({
            username,
            verificationCode: this.IG_2FACode,
            twoFactorIdentifier: two_factor_identifier,
            verificationMethod, // '1' = SMS (default), '0' = TOTP (google auth for example)
            trustThisDevice: "1", // Can be omitted as '1' is used by default
          });
          return this.ig;
        }
      }
    } else {
      console.log("No credentials");
      throw new Error("No credentials");
    }
  }
  private save(state) {
    // you _can_ do some error handling but make sure to attach a catch handler
    writeFile(this.STATE_PATH, state).catch(console.error);
  }
  private async load() {
    const rawState = await readFile(this.STATE_PATH);
    // you might want to wrap this in a try-catch since this can throw
    try {
      return JSON.parse(rawState.toString());
    } catch (error) {
      return false;
    }
  }
  private exists() {
    return access(this.STATE_PATH)
      .then(async () => {
        try {
          const e = await JSON.parse(
            (await readFile(this.STATE_PATH)).toString()
          );

          return e.cookies != null && e.cookies != undefined;
        } catch (error) {
          return false;
        }
      })
      .catch(() => false);
  }
  private async tryLoadSession() {
    if (await this.exists()) {
      try {
        await this.ig.state.deserialize(await this.load());
        // try any request to check if the session is still valid
        await this.ig.account.currentUser();
        return true;
      } catch (e) {
        return false;
      }
    }
    return true;
  }
}
