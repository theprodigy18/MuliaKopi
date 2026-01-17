const express = require("express");
const router = express.Router();
const { Orders, Users, Carts, OrderItems, Menu, AdminCarts, Transactions } = require("../models");
const { Op } = require("sequelize");


const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateRandomCode = (length = 6) => {
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * CHAR_SET.length);
        code += CHAR_SET[randomIndex];
    }
    return code;
};

const generateUniqueCode = async () => {
    let code;
    let exists = true;

    while (exists) {
        code = generateRandomCode();
        const found = await Orders.findOne({ where: { uniqueCode: code } });
        exists = found ? true : false;
    }

    return code;
};


//#region GET
router.get('/get/is-user-buying/:userId', async (req, res) => {
    const userId = req.params.userId;

    const user = await Users.findOne({
        where: {
            uuid: userId
        }
    });

    if (!user) return res.json({ success: false })

    const order = await Orders.findOne({
        where: {
            userId: userId,
            paymentStatus: false
        }
    });

    if (!order) return res.json({ success: false })

    return res.json({ success: true, uniqueCode: order.uniqueCode })
})
router.get('/get/by-user-id-and-unique-code/:userId/:uniqueCode', async (req, res) => {
    const { userId, uniqueCode } = req.params;

    const order = await Orders.findOne({
        where: {
            userId: userId,
            uniqueCode: uniqueCode,
            paymentStatus: false
        },
        include: [
            {
                model: OrderItems,
                as: "orderItems",
                attributes: ["menuId", "quantity", "subPrice"],
                include: [
                    {
                        model: Menu,
                        as: "menu",
                        attributes: ["name", "price", "image"]
                    }
                ]
            }
        ]
    });

    if (!order) return res.json({ success: false })

    return res.json({ success: true, order: order })

})
router.get('/get/one-by-unique-code/:uniqueCode', async (req, res) => {
    const uniqueCode = req.params.uniqueCode;

    const order = await Orders.findOne({
        where: {
            uniqueCode: uniqueCode
        },
        include: [
            {
                model: OrderItems,
                as: "orderItems",
                attributes: ["menuId", "quantity", "subPrice"],
                include: [
                    {
                        model: Menu,
                        as: "menu",
                        attributes: ["name", "price", "image"]
                    }
                ]
            }
        ]
    });

    if (!order) return res.json({ success: false })

    return res.json({ success: true, order: order })
})
router.get('/get/all-by-unique-code/:uniqueCode', async (req, res) => {
    const uniqueCode = req.params.uniqueCode;

    const orders = await Orders.findAll({
        where: {
            uniqueCode: { [Op.like]: `%${uniqueCode}%` }
        },
        include: [
            {
                model: OrderItems,
                as: "orderItems",
                attributes: ["menuId", "quantity", "subPrice"],
                include: [
                    {
                        model: Menu,
                        as: "menu",
                        attributes: ["name", "price", "image"]
                    }
                ]
            }
        ]
    });

    if (orders.length === 0) return res.json({ success: false })

    return res.json({ success: true, orders: orders })
})
router.get('/get/all-online-order', async (req, res) => {
    const orders = await Orders.findAll({
        where: {
            userId: { [Op.ne]: null },
            paymentStatus: false
        },
        include: [
            {
                model: OrderItems,
                as: "orderItems",
                attributes: ["menuId", "quantity", "subPrice"],
                include: [
                    {
                        model: Menu,
                        as: "menu",
                        attributes: ["name", "price", "image"]
                    }
                ]
            }
        ]
    })

    if (orders.length === 0) return res.json({ success: false })

    return res.json({ success: true, orders: orders })
})
//#endregion

//#region POST
router.post('/post/from-user/create-new-order', async (req, res) => {
    const { userId } = req.body;

    const user = await Users.findOne({
        where: {
            uuid: userId
        }
    });

    if (!user) return res.json({ success: false, message: 'User tidak ditemukan.' })

    const carts = await Carts.findAll({
        where: {
            userId: userId
        }
    });

    if (carts.length === 0) return res.json({ success: false, message: 'Keranjang kosong.' })

    const uniqueCode = await generateUniqueCode();

    const newOrder = await Orders.create({
        userId: userId,
        uniqueCode: uniqueCode,
        recipientName: user.name,
    });

    if (!newOrder) return res.json({ success: false, message: 'Terjadi kesalahan saat membuat order.' })

    for (let i = 0; i < carts.length; i++) {
        const orderItem = await OrderItems.create({
            orderId: newOrder.uuid,
            menuId: carts[i].menuId,
            quantity: carts[i].quantity,
            subPrice: carts[i].subPrice,
        });

        if (!orderItem) {
            await OrderItems.destroy({
                where: {
                    orderId: newOrder.uuid
                }
            })
            await Orders.destroy({
                where: {
                    uuid: newOrder.uuid
                }
            });
            return res.json({ success: false, message: 'Terjadi kesalahan saat membuat order.' })
        }
    }

    await Carts.destroy({
        where: {
            userId: userId
        }
    });

    return res.json({ success: true, message: 'Pesanan berhasil dibuat.', uniqueCode: uniqueCode })
})
router.post('/post/from-admin/create-new-order', async (req, res) => {
    const { recipientName, paymentMethod, adminId, totalPrice } = req.body;

    const carts = await AdminCarts.findAll();

    if (carts.length === 0) return res.json({ success: false, message: 'Keranjang kosong.' })

    const uniqueCode = await generateUniqueCode();

    const newOrder = await Orders.create({
        uniqueCode: uniqueCode,
        recipientName: recipientName,
        paymentStatus: true
    });

    if (!newOrder) return res.json({ success: false, message: 'Terjadi kesalahan saat membuat order.' })

    for (let i = 0; i < carts.length; i++) {
        const orderItem = await OrderItems.create({
            orderId: newOrder.uuid,
            menuId: carts[i].menuId,
            quantity: carts[i].quantity,
            subPrice: carts[i].subPrice,
        });

        if (!orderItem) {
            await OrderItems.destroy({
                where: {
                    orderId: newOrder.uuid
                }
            })
            await Orders.destroy({
                where: {
                    uuid: newOrder.uuid
                }
            });
            return res.json({ success: false, message: 'Terjadi kesalahan saat membuat order.' })
        }
    }

    await AdminCarts.destroy({ where: {} });

    const transaction = await Transactions.create({
        orderId: newOrder.uuid,
        adminId: adminId,
        tempPrice: totalPrice,
        discount: 0,
        tax: 0,
        totalPrice: totalPrice,
        paymentMethod: paymentMethod
    });

    if (!transaction) return res.json({ success: false, message: 'Terjadi kesalahan saat membuat transaksi.' })

    return res.json({ success: true, message: 'Pesanan berhasil dibuat.', uniqueCode: uniqueCode })
})
router.post('/post/accept-online-order', async (req, res) => {
    const { orderId, adminId, totalPrice, paymentMethod } = req.body;

    const order = await Orders.findOne({
        where: {
            uuid: orderId
        }
    });

    if (!order) return res.json({ success: false, message: 'Order tidak ditemukan.' })

    const transaction = await Transactions.create({
        orderId: orderId,
        adminId: adminId,
        tempPrice: totalPrice,
        discount: 0,
        tax: 0,
        totalPrice: totalPrice,
        paymentMethod: paymentMethod
    });

    if (!transaction) return res.json({ success: false, message: 'Terjadi kesalahan saat membuat transaksi.' })

    const updated = await Orders.update({
        paymentStatus: true
    }, {
        where: {
            uuid: orderId
        }
    });

    if (!updated) {
        await Transactions.destroy({
            where: {
                orderId: orderId
            }
        });
        return res.json({ success: false, message: 'Terjadi kesalahan saat mengupdate order.' })
    }

    return res.json({ success: true, message: 'Transaksi berhasil dibuat.', uniqueCode: order.uniqueCode })
})
//#endregion

module.exports = router;