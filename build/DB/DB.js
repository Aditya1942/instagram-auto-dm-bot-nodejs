"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const luxon_1 = require("luxon");
class DB {
    constructor() {
        this.db = JSON.parse(fs_1.default.readFileSync(path_1.default.join(DB.dbFile), "utf8"));
    }
    refresh() {
        this.db = JSON.parse(fs_1.default.readFileSync(path_1.default.join(DB.dbFile), "utf8"));
    }
    get(id) {
        return this.db.friends.find((friend) => {
            return friend.id === id;
        });
    }
    getAll() {
        return this.db.friends;
    }
    async add(newFriend) {
        let postFriend = Object.assign(Object.assign({ id: this.db.friends.length + 1 }, newFriend), { DateOfCreation: luxon_1.DateTime.now().setZone("Asia/Calcutta").toISO("en") });
        this.db.friends.push(postFriend);
        this.save().then(() => {
            this.refresh();
            return postFriend;
        });
        return postFriend;
    }
    async update(id, newFriend) {
        this.db.friends.forEach((friend, i) => {
            console.log(friend);
            if (friend.id == id) {
                this.db.friends[i].username = newFriend.username;
                this.db.friends[i].fullname = newFriend.fullname;
                this.db.friends[i].birthDate = newFriend.birthDate;
            }
        });
        this.save()
            .then(() => {
            console.log("Updated");
            this.refresh();
            return newFriend;
        })
            .catch((err) => {
            console.log("ERROR:", err);
        });
    }
    async delete(id) {
        await this.db.friends.forEach((friend, index) => {
            if (friend.id == id) {
                this.db.friends.splice(index, 1);
            }
        });
        this.save().then(() => {
            this.refresh();
            return true;
        });
    }
    async save() {
        let data = JSON.stringify(this.db);
        return new Promise(async function (resolve, reject) {
            try {
                fs_1.default.writeFileSync(DB.dbFile, data);
                resolve(data);
            }
            catch (error) {
                console.error("DB.ts line 48", error);
                reject(error);
            }
        });
    }
}
exports.default = DB;
DB.dbFile = __dirname + "/database.json";
//# sourceMappingURL=DB.js.map