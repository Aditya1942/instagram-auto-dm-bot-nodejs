"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DM = void 0;
class DM {
    constructor(ig) {
        this.ig = ig;
    }
    async sendOne(username, msg) {
        try {
            const friend = await this.ig.user.getIdByUsername(username);
            const thread = this.ig.entity.directThread([friend.toString()]);
            await thread.broadcastText(msg);
        }
        catch (error) {
            return Promise.reject(error);
        }
        return Promise.resolve({ status: "success" });
    }
    async sendMany(username, msg) {
        try {
            const friend = await this.ig.user.getIdByUsername(username);
            const thread = this.ig.entity.directThread([friend.toString()]);
            var count = 0;
            var interval = setInterval(async () => {
                console.log("Count: " + count);
                if (count > msg.length - 1) {
                    clearInterval(interval);
                    return Promise.resolve({ status: "success" });
                }
                else {
                    await thread.broadcastText(msg[count]);
                    count++;
                }
            }, 1000);
            return Promise.resolve({ status: "success" });
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async sendInLoop(username, msg, interval = 1) {
        try {
            const friend = await this.ig.user.getIdByUsername(username);
            const thread = this.ig.entity.directThread([friend.toString()]);
            let count = 0;
            setInterval(async () => {
                if (count > msg.length - 1)
                    count = 0;
                await thread.broadcastText(msg[count]);
                count++;
            }, 1000 * interval);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}
exports.DM = DM;
//# sourceMappingURL=DM.js.map