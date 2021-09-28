import express, { Request, Response, Router } from "express";
import { FriendsModel } from "../models/friendsModel";
import { DateTime } from "luxon";
import DB from "../DB/DB";

const router: Router = express.Router();
const db = new DB();

router.get("/", (req: Request, res: Response): void => {
  let resData = db.getAll();
  res.json(resData);
});

router.post("/", (req: Request, res: Response): void => {
  const { username, fullname, birthDate, dailyReminder } = req.body;
  let friend: FriendsModel = {
    username: username,
    fullname: fullname,
    dailyReminder: dailyReminder,
    birthDate: DateTime.fromJSDate(new Date(birthDate))
      .setZone("Asia/Calcutta")
      .toFormat("yyyy-MM-dd"),
  };
  // console.log(friend);
  db.add(friend)
    .then((respons) => {
      console.log("respons line 26", respons);
      res.json({
        success: true,
        message: "Friend added successfully",
        friend,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        error: JSON.stringify(err),
      });
    });
});

router.put("/:id", (req: Request, res: Response): void => {
  const { username, fullname, birthDate, dailyReminder } = req.body;
  let { id } = req.params;
  let friend: FriendsModel = {
    username: username,
    fullname: fullname,
    dailyReminder: dailyReminder,
    birthDate: DateTime.fromJSDate(new Date(birthDate))
      .setZone("Asia/Calcutta")
      .toFormat("yyyy-MM-dd"),
  };
  db.update(id, friend)
    .then((respons) => {
      console.log(respons);
      res.json({
        success: true,
        message: "Friend updated successfully",
        friend: respons,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        error: JSON.stringify(err),
      });
    });
});

router.delete("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;
  db.delete(id)
    .then((respons) => {
      console.log(respons);
      res.json({
        success: true,
        message: "Friend deleted successfully",
        friend: respons,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        error: JSON.stringify(err),
      });
    });
});

export default router;
