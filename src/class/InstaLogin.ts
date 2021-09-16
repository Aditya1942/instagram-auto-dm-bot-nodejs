import {
  AccountRepositoryLoginResponseLogged_in_user,
  IgApiClient,
  IgLoginTwoFactorRequiredError,
} from "instagram-private-api";
export class InstaLogin {
  private IG_USERNAME = process.env.IG_USERNAME; // enter your username
  private IG_PASSWORD = process.env.IG_PASSWORD; // enter your password
  private IG_2FACode;

  private ig = new IgApiClient();
  constructor(code) {
    this.IG_2FACode = code;
  }
  async init() {
    this.ig.state.generateDevice(this.IG_USERNAME);
    return this.ig;
  }
  async login(ig): Promise<AccountRepositoryLoginResponseLogged_in_user> {
    try {
      return await ig.account.login(this.IG_USERNAME, this.IG_PASSWORD);
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
        return ig.account.twoFactorLogin({
          username,
          verificationCode: this.IG_2FACode,
          twoFactorIdentifier: two_factor_identifier,
          verificationMethod, // '1' = SMS (default), '0' = TOTP (google auth for example)
          trustThisDevice: "1", // Can be omitted as '1' is used by default
        });
      }
    }
  }
}
