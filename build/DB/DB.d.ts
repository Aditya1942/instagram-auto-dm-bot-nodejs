import { FriendsModel } from "src/models/friendsModel";
export default class DB {
    static dbFile: string;
    private db;
    constructor();
    refresh(): void;
    get(id: any): any;
    getAll(): any;
    add(newFriend: FriendsModel): Promise<FriendsModel>;
    update(id: any, newFriend: FriendsModel): Promise<void>;
    delete(id: any): Promise<void>;
    save(): Promise<unknown>;
}
