import { Log } from "../Log/Log";
export declare class AutoBirthdayWish {
    private Today;
    private WishMessage;
    private ig;
    log: Log;
    constructor(ig: any);
    RemaingDaysCount(BirthdayDate: any): any;
    DailyReminder(username: any, msg: any): Promise<any>;
    DailyReminderForAll(obj: {
        username: string;
        birthDate: string;
    }[], time?: number): Promise<{
        status: string;
    }>;
    wish(username: any): Promise<any>;
}
