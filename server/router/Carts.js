const express = require("express");
const router = express.Router();
const { Carts, Menu } = require("../models");

//#region GET
router.get('/get/by-user-id/:userId', async (req, res) => {
    const userId = req.params.userId;

    const carts = await Carts.findAll({
        where: {
            userId: userId
        },
        include: [
            {
                model: Menu,
                as: "menu",
                attributes: ["name", "price", "image"]
            }
        ]
    });

    if (carts.length === 0) return res.json({ success: false })

    return res.json({ success: true, carts: carts })
})
//#endregion


//#region POST
router.post('/post/add-to-cart', async (req, res) => {
    const cart = req.body;

    const menu = await Menu.findOne({
        where: {
            id: cart.menuId
        }
    });

    if (!menu)
    {
        return res.json({ success: false, message: "Menu tidak ditemukan." });
    }

    const existingCart = await Carts.findOne({
        where: {
            userId: cart.userId,
            menuId: cart.menuId
        }
    });

    try {
        if (existingCart)
        {
            const updatedCart = await Carts.update(
                { 
                    quantity: existingCart.quantity + 1,
                    subPrice: menu.price * (existingCart.quantity + 1)
                },
                { where: { id: existingCart.id } }
            );

            if (!updatedCart) return res.json({ success: false, message: "Gagal memperbarui keranjang." });

            return res.json({ success: true, message: "Menu berhasil ditambahkan ke keranjang." });
        }

        const newCart = await Carts.create({
            userId: cart.userId,
            menuId: cart.menuId,
            quantity: 1,
            subPrice: menu.price
        });

        if (newCart) return res.json({ success: true, message: "Menu berhasil ditambahkan ke keranjang." });
        
        return res.json({ success: false, message: "Gagal menambahkan menu ke keranjang." });
    } catch (error) {
        return res.json({ success: false, message: "Terjadi kesalahan saat menambahkan menu ke keranjang." });
    }
})
//#endregion

//#region PUT/PATCH
router.patch('/patch/remove-from-cart', async (req, res) => {
    const cart = req.body;

    const menu = await Menu.findOne({
        where: {
            id: cart.menuId
        }
    });

    if (!menu)
    {
        return res.json({ success: false, message: "Menu tidak ditemukan." });
    }

    const existingCart = await Carts.findOne({
        where: {
            userId: cart.userId,
            menuId: cart.menuId
        }
    });

    if (!existingCart)
    {
        return res.json({ success: false, message: "Menu tidak ditemukan di keranjang." });
    }

    try {
        if (existingCart.quantity > 1)
        {
            const updatedCart = await Carts.update(
                { 
                    quantity: existingCart.quantity - 1,
                    subPrice: menu.price * (existingCart.quantity - 1)
                },
                { where: { id: existingCart.id } }
            );

            if (!updatedCart) return res.json({ success: false, message: "Gagal memperbarui keranjang." });

            return res.json({ success: true, message: "Menu berhasil dihapus dari keranjang." });
        }

        const deletedCart = await Carts.destroy({
            where: {
                id: existingCart.id
            }
        });

        if (!deletedCart) return res.json({ success: false, message: "Gagal menghapus menu dari keranjang." });

        return res.json({ success: true, message: "Menu berhasil dihapus dari keranjang." });
    } catch (error) {
        return res.json({ success: false, message: "Terjadi kesalahan saat menghapus menu dari keranjang." });
    }
})
//#endregion



module.exports = router;