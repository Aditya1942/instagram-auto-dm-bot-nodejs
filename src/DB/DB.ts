import fs from "fs";
import path from "path";
import { DbModel } from "../models/DbModel";
import { DateTime } from "luxon";
import { FriendsModel } from "src/models/friendsModel";

export default class DB {
  public static dbFile = __dirname + "/database.json";
  private db;
  constructor() {
    this.db = JSON.parse(fs.readFileSync(path.join(DB.dbFile), "utf8"));
  }
  refresh() {
    this.db = JSON.parse(fs.readFileSync(path.join(DB.dbFile), "utf8"));
  }
  get(id) {
    return this.db.friends.find((friend) => {
      return friend.id === id;
    });
  }
  getAll() {
    return this.db.friends;
  }

  async add(newFriend: FriendsModel): Promise<FriendsModel> {
    let postFriend: DbModel = {
      id: this.db.friends.length + 1,
      ...newFriend,
      DateOfCreation: DateTime.now().setZone("Asia/Calcutta").toISO("en"),
    };
    this.db.friends.push(postFriend);
    this.save().then(() => {
      this.refresh();
      return postFriend;
    });
    return postFriend;
  }

  async update(id, newFriend: FriendsModel) {
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
        fs.writeFileSync(DB.dbFile, data);
        resolve(data);
      } catch (error) {
        console.error("DB.ts line 48", error);
        reject(error);
      }
    });
  }
}
