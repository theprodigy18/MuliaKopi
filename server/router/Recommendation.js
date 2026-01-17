const express = require("express");
const router = express.Router();
const { Recommendation, ScanMood, Menu } = require("../models");

//#region GET
router.get('/get/by-scan-id/:scanId', async (req, res) => {
    const scanId = req.params.scanId;

    const scanMood = await ScanMood.findOne({
        where: {
            id: scanId
        }
    });

    if (!scanMood) return res.json({ success: false });

    const recommendations = await Recommendation.findAll({
        where: {
            scanId: scanId
        },
        include: [
            {
                model: Menu,
                as: "menu",
                attributes: ["name", "price", "image", "category"]
            }
        ]
    });

    if (recommendations.length === 0) return res.json({ success: false })

    return res.json({ success: true, recommendations: recommendations, mood: scanMood.mood });
})
//#endregion


module.exports = router;