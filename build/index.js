"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./router/index"));
const dotenv_1 = __importDefault(require("dotenv"));
const BirthdayWish_1 = require("./class/BirthdayWish");
const InstaLogin_1 = require("./class/InstaLogin");
const Log_1 = require("./Log/Log");
const DB_1 = __importDefault(require("./DB/DB"));
const instagram_mqtt_1 = require("instagram_mqtt");
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
dotenv_1.default.config();
process.env.TZ = "Asia/Calcutta";
app.get("/", (_, res) => {
    console.log("lol");
    res.json({ message: `App is running on port ${PORT}` });
});
app.use("/api", index_1.default);
app.use("*", (_, res) => {
    res.json({ message: "Make sure url is correct!" });
});
(async () => {
    const code = process.argv[2];
    const Login = new InstaLogin_1.InstaLogin(code);
    const log = new Log_1.Log();
    const db = new DB_1.default();
    const ig = await Login.init();
    const auth = await Login.login(ig);
    console.log("Instabot logged in successfully ");
    log.loginLog();
    const BirthdayWish = new BirthdayWish_1.AutoBirthdayWish(ig);
    function logEvent(name) {
        return (data) => console.log(name, data);
    }
    ig.realtime.on("direct", logEvent("direct"));
    ig.realtime.on("message", logEvent("messageWrapper"));
    await ig.realtime.connect({
        graphQlSubs: [
            instagram_mqtt_1.GraphQLSubscriptions.getAppPresenceSubscription(),
            instagram_mqtt_1.GraphQLSubscriptions.getZeroProvisionSubscription(ig.state.phoneId),
            instagram_mqtt_1.GraphQLSubscriptions.getDirectStatusSubscription(),
            instagram_mqtt_1.GraphQLSubscriptions.getDirectTypingSubscription(ig.state.cookieUserId),
            instagram_mqtt_1.GraphQLSubscriptions.getAsyncAdSubscription(ig.state.cookieUserId),
        ],
        skywalkerSubs: [
            instagram_mqtt_1.SkywalkerSubscriptions.directSub(ig.state.cookieUserId),
            instagram_mqtt_1.SkywalkerSubscriptions.liveSub(ig.state.cookieUserId),
        ],
        irisData: await ig.feed.directInbox().request(),
        connectOverrides: {},
    });
    setTimeout(() => {
        console.log("Device off");
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
})();
//# sourceMappingURL=index.js.map