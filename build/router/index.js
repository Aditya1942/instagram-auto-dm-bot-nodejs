"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const luxon_1 = require("luxon");
const DB_1 = __importDefault(require("../DB/DB"));
const router = express_1.default.Router();
const db = new DB_1.default();
router.get("/", (req, res) => {
    let resData = db.getAll();
    res.json(resData);
});
router.post("/", (req, res) => {
    const { username, fullname, birthDate, dailyReminder } = req.body;
    let friend = {
        username: username,
        fullname: fullname,
        dailyReminder: dailyReminder,
        birthDate: luxon_1.DateTime.fromJSDate(new Date(birthDate))
            .setZone("Asia/Calcutta")
            .toFormat("yyyy-MM-dd"),
    };
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
router.put("/:id", (req, res) => {
    const { username, fullname, birthDate, dailyReminder } = req.body;
    let { id } = req.params;
    let friend = {
        username: username,
        fullname: fullname,
        dailyReminder: dailyReminder,
        birthDate: luxon_1.DateTime.fromJSDate(new Date(birthDate))
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
router.delete("/:id", (req, res) => {
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
exports.default = router;
//# sourceMappingURL=index.js.map