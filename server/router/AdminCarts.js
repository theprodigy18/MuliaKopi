const express = require("express");
const router = express.Router();
const { AdminCarts, Menu } = require("../models");


//#region GET
router.get('/get/all', async (req, res) => {
    try {
        const carts = await AdminCarts.findAll({
            include: [
                {
                    model: Menu,
                    as: "menu",
                    attributes: ["id", "name", "price", "image"]
                }
            ]
        });

        return res.json({ success: true, carts: carts })
    }
    catch (error) {
        return res.json({ success: false, message: "Terjadi kesalahan saat mengambil data keranjang." });
    }
})
//#endregion

//#region POST
router.post('/post/add-to-cart', async (req, res) => {
    const { menuId } = req.body;

    const menu = await Menu.findOne({ where: { id: menuId } });

    if (!menu) {
        return res.json({ success: false, message: "Menu tidak ditemukan." });
    }

    const existingCart = await AdminCarts.findOne({ where: { menuId: menuId } });

    if (existingCart) {
        const updated = await AdminCarts.update(
            { 
                quantity: existingCart.quantity + 1,
                subPrice: menu.price * (existingCart.quantity + 1)
            },
            { where: { menuId: menuId } }
        );

        if (!updated) {
            return res.json({ success: false, message: "Terjadi kesalahan saat memperbarui keranjang." });
        }

        return res.json({ success: true, message: "Menu berhasil ditambahkan ke keranjang." });
    }
    else {
        const newCart = await AdminCarts.create({
            menuId: menuId,
            quantity: 1,
            subPrice: menu.price
        });

        if (!newCart) {
            return res.json({ success: false, message: "Terjadi kesalahan saat menambahkan menu ke keranjang." });
        }

        return res.json({ success: true, message: "Menu berhasil ditambahkan ke keranjang." });
    }

})
//#endregion

//#region PUT/PATCH
router.patch('/patch/remove-from-cart', async (req, res) => {
    const { menuId } = req.body;

    const menu = await Menu.findOne({ where: { id: menuId } });

    if (!menu) {
        return res.json({ success: false, message: "Menu tidak ditemukan." });
    }

    const existingCart = await AdminCarts.findOne({ where: { menuId: menuId } });

    if (!existingCart) {
        return res.json({ success: false, message: "Menu tidak ditemukan di keranjang." });
    }

    if (existingCart.quantity > 1) {
        const updated = await AdminCarts.update(
            { 
                quantity: existingCart.quantity - 1,
                subPrice: menu.price * (existingCart.quantity - 1)
            },
            { where: { menuId: menuId } }
        );

        if (!updated) {
            return res.json({ success: false, message: "Terjadi kesalahan saat memperbarui keranjang." });
        }

        return res.json({ success: true, message: "Menu berhasil dihapus dari keranjang." });
    }
    else {
        const deleted = await AdminCarts.destroy({ where: { menuId: menuId } });

        if (!deleted) {
            return res.json({ success: false, message: "Terjadi kesalahan saat menghapus menu dari keranjang." });
        }

        return res.json({ success: true, message: "Menu berhasil dihapus dari keranjang." });
    }
})
//#endregion



module.exports = router;