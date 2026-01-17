const express = require("express");
const router = express.Router();
const { Menu } = require("../models");
const { Op } = require("sequelize");
const { v4 } = require('uuid'); 


//#region GET
router.get("/get/all", async (req, res) => {
    const menus = await Menu.findAll({
        where: {
            isActive: true
        },
        order: [['name', 'ASC']]
    });

    if (menus.length === 0) return res.json({ success: false })

    return res.json({ success: true, menus: menus });
})
router.get('/get/by-category/:category', async (req, res) => {
    const category = req.params.category;

    const menus = await Menu.findAll({
        where: {
            category: category,
            isActive: true
        },
        order: [['name', 'ASC']]
    });

    if (menus.length === 0) return res.json({ success: false })

    return res.json({ success: true, menus: menus });
})
router.get('/get/by-id/:id', async (req, res) => {
    const id = req.params.id;

    const menu = await Menu.findOne({
        where: {
            id: id,
            isActive: true
        }
    });

    if (!menu) return res.json({ success: false })

    return res.json({ success: true, menu: menu });
})
router.get('/get/by-name/:name', async (req, res) => {
    const name = req.params.name;
    const menus = await Menu.findAll(
        {
            where:
            {
                name:
                {
                    [Op.like]: `%${name}%`
                },
                isActive: true
            },
            order: [['name', 'ASC']]
        })

    if (menus.length === 0) return res.json({ success: false })

    return res.json({ success: true, menus: menus })
})

//#endregion

//#region POST
router.post("/post/create-menu", async (req, res) => {
    const menu = req.body;

    const searchMenu = await Menu.findOne({ where: { name: menu.name } });

    if (searchMenu)
        return res.json({ success: false, message: "Nama menu sudah ada." });

    const categoryChar =
    {
        kopi: 'K',
        'non-kopi': 'N',
        makanan: 'M'
        // Add more categories here
    };
    // Take the first letter of the category
    const char = categoryChar[menu.category];

    const allIds = await Menu.findAll(
        {
            where: { category: menu.category },
            order: [['id', 'ASC']], // Order by id
            attributes: ['id'], // Hanya ambil kolom id
        });

    // Convert id to number
    const numberIds = allIds.map((item) => parseInt(item.id.slice(1), 10)); // Delete the first character and convert to number
    let newId = null;

    if (numberIds.length === 0) {
        newId = `${char}1`;
    }
    else {
        // Check for missing numbers
        for (let i = 1; i <= Math.max(...numberIds) + 1; i++) {
            if (!numberIds.includes(i)) {
                newId = `${char}${i}`; // If a missing number is found, use it
                break;
            }
        }
        // If no missing number is found, use the next available number
        if (!newId) {
            const lastId = numberIds[numberIds.length - 1]; // Get the last id
            newId = `${char}${lastId + 1}`; // Add 1 to the last id
        }
    }

    try {
        const newMenu = await Menu.create({
            id: newId,
            name: menu.name,
            category: menu.category,
            image: menu.image,
            description: menu.description,
            price: menu.price,
            stock: 99,
            isActive: true
        });

        if (newMenu) return res.json({ success: true, message: "Menu berhasil ditambahkan." });
        else return res.json({ success: false, message: "Menu gagal ditambahkan." });
    }
    catch (error) {
        return res.json({ success: false, message: "Terjadi kesalahan saat menambahkan menu." });
    }
})
//#endregion

//#region PUT/PATCH
router.put('/put/edit-menu/by-id/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    const menu = await Menu.findByPk(id);
    if (!menu) return res.json({ success: false, message: "Menu tidak ditemukan." });

    const updated = await Menu.update(data, { where: { id: id } });

    if (!updated) return res.json({ success: false, message: "Gagal memperbarui menu." });

    return res.json({ success: true, message: "Menu berhasil diperbarui." });
})

//#region DELETE
router.delete('/delete/by-id/:id', async (req, res) => {
    const id = req.params.id;

    // Ambil menu untuk mendapatkan current name
    const menu = await Menu.findByPk(id);
    if (!menu) return res.json({ success: false, message: "Menu tidak ditemukan." });

    const uniqueSuffix = `deleted__${Date.now()}__${v4()}`;
    const updated = await Menu.update(
        {
            isActive: false,
            name: uniqueSuffix
        },
        {
            where: { id: id }
        }
    );

    if (updated[0] === 0) return res.json({ success: false, message: "Gagal menghapus menu." });

    return res.json({ success: true, message: "Menu berhasil dihapus dan nama tersedia kembali." });
});
//#endregion

module.exports = router;