const express = require("express");
const router = express.Router();
const { MenuByMood } = require("../models");

//#region POST
router.post("/post/create-menu-by-mood", async (req, res) => {
    const menuByMood = req.body;
    const newMenuByMood = await MenuByMood.create(menuByMood);

    if (!newMenuByMood) return res.json({ success: false });

    return res.json({ success: true, menuByMood: newMenuByMood });
})
//#endregion


module.exports = router;