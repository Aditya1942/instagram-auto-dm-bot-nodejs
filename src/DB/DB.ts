import fs from "fs";
import path from "path";
import { DbModel } from "../models/DbModel";
import { DateTime } from "luxon";
import { FriendsModel } from "src/models/friendsModel";

export default class DB {
  private dbFile = path.join("db.json");
  private db;
  private friends: DbModel[];
  constructor() {
    this.db = JSON.parse(fs.readFileSync(path.join(this.dbFile), "utf8"));
    this.friends = this.db.friends;
    let Today = DateTime.now().setZone("Asia/Calcutta").toISO("en");
    console.log(Today);
  }
   refresh() {
    this.db = JSON.parse(fs.readFileSync(path.join(this.dbFile), "utf8"));
    this.friends = this.db.friends;
  }
  get(id) {}
  getAll() {
    return this.friends;
  }
  async add(newFriend: FriendsModel) {
    let postFriend: DbModel = {
      id: this.friends.length + 1,
      ...newFriend,
      DateOfCreation: DateTime.now().setZone("Asia/Calcutta").toISO("en"),
    };
    this.db.friends.push(postFriend);
    this.save().then(() => {
      console.log("Added");
    });

   
  }
  update(id, name) {}
  delete(id) {}
  async save() {
    return new Promise(async function(resolve,reject){
      try {
      await  fs.writeFileSync(this.dbFile, JSON.stringify(this.db));
        this.refresh();
       resolve(this.db);
      } catch (error) {
        console.error("DB.ts line 48", error);
      reject(error);
      }

  })

  }
}
