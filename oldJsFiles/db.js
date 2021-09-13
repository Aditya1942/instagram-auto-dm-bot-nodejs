const fs = require("fs");
const path = require("path");

console.log(db.table);
db.table.push({
  id: 2,
  name: "table2",
});
const data = JSON.stringify(db);

fs.writeFile(dbFile, data, { flag: "w+" }, (err) => {
  if (err) {
    throw err;
  }
  console.log("File is updated.");
});

export default class DB {
  dbFile = path.join(__dirname, "db.json");
  db;
  constructor() {
    this.db = JSON.parse(fs.readFileSync(path.join(dbFile), "utf8"));
  }
  get(id) {
      
  }
  getAll() {}
  add(name) {}
  update(id, name) {}
  delete(id) {}
}
