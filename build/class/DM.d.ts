export declare class DM {
    private ig;
    constructor(ig: any);
    sendOne(username: string, msg: string): Promise<any>;
    sendMany(username: string, msg: string[]): Promise<any>;
    sendInLoop(username: string, msg: string[], interval?: number): Promise<any>;
}
