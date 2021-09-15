import express, { Application } from "express";
import AppRoute from "./router/index";
// import fs from "fs";
// import path from "path";
// config
const PORT = process.env.PORT || 8000;
const app: Application = express();
app.use(express.json()); // To parse the incoming requests with JSON payloads
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
// router
app.get("/", (req, res) => res.send("app is running!"));
app.use("/api", AppRoute);
app.use("*", (req, res, next) => {
  res.send("Make sure url is correct!");
});
// (() => {
//   let db = JSON.parse(fs.readFileSync(path.join("db.json"), "utf8"));
//   console.log(db.friends);
// })();
