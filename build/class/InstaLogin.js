"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstaLogin = void 0;
const instagram_private_api_1 = require("instagram-private-api");
const instagram_mqtt_1 = require("instagram_mqtt");
class InstaLogin {
    constructor(code) {
        this.IG_USERNAME = process.env.IG_USERNAME;
        this.IG_PASSWORD = process.env.IG_PASSWORD;
        this.ig = (0, instagram_mqtt_1.withFbnsAndRealtime)(new instagram_private_api_1.IgApiClient());
        this.IG_2FACode = code;
    }
    async init() {
        this.ig.state.generateDevice(this.IG_USERNAME);
        return this.ig;
    }
    async login(ig) {
        try {
            return await ig.account.login(this.IG_USERNAME, this.IG_PASSWORD);
        }
        catch (e) {
            if (e instanceof instagram_private_api_1.IgLoginTwoFactorRequiredError) {
                const { username, totp_two_factor_on, two_factor_identifier } = e.response.body.two_factor_info;
                const verificationMethod = totp_two_factor_on ? "0" : "1";
                console.log("verificationMethod :", verificationMethod);
                return ig.account.twoFactorLogin({
                    username,
                    verificationCode: this.IG_2FACode,
                    twoFactorIdentifier: two_factor_identifier,
                    verificationMethod,
                    trustThisDevice: "1",
                });
            }
        }
    }
}
exports.InstaLogin = InstaLogin;
//# sourceMappingURL=InstaLogin.js.map