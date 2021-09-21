export class DM {
  private ig;
  constructor(ig) {
    this.ig = ig;
  }
  async sendOne(username: string, msg: string): Promise<any> {
    try {
      const friend = await this.ig.user.getIdByUsername(username); // enter your friends username
      const thread = this.ig.entity.directThread([friend.toString()]);
      await thread.broadcastText(msg);
    } catch (error) {
      return Promise.reject(error);
    }
    return Promise.resolve({ status: "success" });
  }

  async sendMany(username: string, msg: string[]): Promise<any> {
    try {
      const friend = await this.ig.user.getIdByUsername(username); // enter your friends username
      const thread = this.ig.entity.directThread([friend.toString()]);
      var count = 0;
      var interval = setInterval(async () => {
        console.log("Count: " + count);
        if (count > msg.length - 1) {
          clearInterval(interval);
          return Promise.resolve({ status: "success" });
        } else {
          await thread.broadcastText(msg[count]);
          count++;
        }
      }, 1000);
      return Promise.resolve({ status: "success" });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async sendInLoop(
    username: string,
    msg: string[],
    interval: number = 1
  ): Promise<any> {
    try {
      const friend = await this.ig.user.getIdByUsername(username); // enter your friends username
      const thread = this.ig.entity.directThread([friend.toString()]);

      let count = 0;
      setInterval(async () => {
        if (count > msg.length - 1) count = 0;
        await thread.broadcastText(msg[count]);
        count++;
      }, 1000 * interval);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
