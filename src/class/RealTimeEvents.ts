import {
  GraphQLSubscriptions,
  IgApiClientRealtime,
  SkywalkerSubscriptions,
  withFbnsAndRealtime,
} from "instagram_mqtt";
import { Subject } from "rxjs";

export class RealTimeEvents {
  private ig: IgApiClientRealtime;
  dm: Subject<any> = new Subject();
  constructor(ig: IgApiClientRealtime) {
    this.ig = ig;
  }
  async init() {
    this.ig.realtime.on("direct", this.logEvent("direct"));
    this.ig.realtime.on("message", this.logEvent("messageWrapper"));
    await this.ig.realtime.connect({
      // optional
      graphQlSubs: [
        // these are some subscriptions
        GraphQLSubscriptions.getAppPresenceSubscription(),
        GraphQLSubscriptions.getZeroProvisionSubscription(
          this.ig.state.phoneId
        ),
        GraphQLSubscriptions.getDirectStatusSubscription(),
        GraphQLSubscriptions.getDirectTypingSubscription(
          this.ig.state.cookieUserId
        ),
        GraphQLSubscriptions.getAsyncAdSubscription(this.ig.state.cookieUserId),
      ],
      // optional
      skywalkerSubs: [
        SkywalkerSubscriptions.directSub(this.ig.state.cookieUserId),
        SkywalkerSubscriptions.liveSub(this.ig.state.cookieUserId),
      ],
      // optional
      // this enables you to get direct messages
      irisData: await this.ig.feed.directInbox().request(),
      // optional
      // in here you can change connect options
      // available are all properties defined in MQTToTConnectionClientInfo
      connectOverrides: {},

      // optional
      // use this proxy
      // socksOptions: {
      //     type: 5,
      //     port: 12345,
      //     host: '...'
      // }
    });

    // simulate turning the device off after 2s and turning it back on after another 2s
    setTimeout(() => {
      console.log("Device off");
      // from now on, you won't receive any realtime-data as you "aren't in the app"
      // the keepAliveTimeout is somehow a 'constant' by instagram
      this.ig.realtime.direct.sendForegroundState({
        inForegroundApp: false,
        inForegroundDevice: false,
        keepAliveTimeout: 900,
      });
    }, 2000);
    setTimeout(() => {
      console.log("In App");
      this.ig.realtime.direct.sendForegroundState({
        inForegroundApp: true,
        inForegroundDevice: true,
        keepAliveTimeout: 60,
      });
    }, 4000);
  }

  private logEvent(name: string) {
    return (data: any) => {
      console.log(name, data);
      this.dm.next({ data, name });
    };
  }
}
