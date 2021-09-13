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
  let { username, fullname, birthDate } = req.body;
  let friend: FriendsModel = {
    username: username,
    fullname: fullname,
    birthDate: DateTime.fromJSDate(new Date(birthDate))
      .setZone("Asia/Calcutta")
      .toFormat("yyyy-MM-dd"),
  };
  db.add(friend)
    .then((respons) => {
      console.log(respons);
      res.json({
        success: true,
        message: "Friend added successfully",
        data: friend,
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
