const express = require("express");
const router = express.Router();
const { ScanMood, Recommendation, MenuByMood } = require("../models");
const { default: axios } = require("axios");


//#region POST
router.post('/post/scan-user-mood', async (req, res) => {
    const { userId, image } = req.body;

    try {
        const pythonRes = (await axios.post(`${process.env.PYTHON_URL}/detect-mood`, {
            image: image
        })).data

        const validMoods = ["Bahagia", "Sedih", "Marah", "Takut", "Normal"];

        if (!validMoods.includes(pythonRes.mood)) return res.json({ success: false, message: pythonRes.mood });

        const allMenuByMood = await MenuByMood.findAll({
            where: {
                mood: pythonRes.mood
            }
        });

        if (allMenuByMood.length === 0) {
            return res.json({ success: false, message: "Menu mood gagal ditambahkan." });
        }

        const newScan = await ScanMood.create({
            userId: userId,
            mood: pythonRes.mood
        });

        if (!newScan) return res.json({ success: false, message: "Mood gagal ditambahkan." });


        for (let i = 0; i < allMenuByMood.length; i++)
        {
            const newRecommendation = await Recommendation.create({
                scanId: newScan.id,
                menuId: allMenuByMood[i].menuId
            });

            if (!newRecommendation) 
            {
                await Recommendation.destroy({
                    where: {
                        scanId: newScan.id
                    }
                });

                await ScanMood.destroy({
                    where: {
                        id: newScan.id
                    }
                });

                return res.json({ success: false, message: "Rekomendasi gagal ditambahkan." });
            }
        }

        return res.json({ success: true, message: "Mood berhasil ditambahkan.", scan: newScan });
    }
    catch (error) {
        return res.json({ success: false, message: "Terjadi kesalahan saat memproses gambar." });
    }
})
//#endregion



module.exports = router;