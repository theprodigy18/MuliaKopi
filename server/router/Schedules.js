const express = require("express");
const router = express.Router();
const { Schedules } = require("../models");

//#region GET
router.get("/get/all", async (req, res) => {
    const schedules = await Schedules.findAll();

    return res.json({ success: true, schedules: schedules });
});
//#endregion

//#region POST
router.post("/post/create-schedule", async (req, res) => {
    const schedule = req.body;
    await Schedules.create(schedule);

    return res.json({ success: true });
});
//#endregion


module.exports = router;