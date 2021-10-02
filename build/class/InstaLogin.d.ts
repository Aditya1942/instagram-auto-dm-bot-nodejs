import { AccountRepositoryLoginResponseLogged_in_user } from "instagram-private-api";
import { IgApiClientRealtime } from "instagram_mqtt";
export declare class InstaLogin {
    private IG_USERNAME;
    private IG_PASSWORD;
    private IG_2FACode;
    private ig;
    constructor(code: any);
    init(): Promise<IgApiClientRealtime>;
    login(ig: any): Promise<AccountRepositoryLoginResponseLogged_in_user>;
}
