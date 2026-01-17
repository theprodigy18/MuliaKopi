const express = require("express");
const router = express.Router();
const { Transactions, Orders, OrderItems, Menu, Admin } = require("../models");
const { Op } = require("sequelize");

//#region GET
router.get('/get/by-order-unique-code/:uniqueCode', async (req, res) => {
    const uniqueCode = req.params.uniqueCode;

    const order = await Orders.findOne({
        where: {
            uniqueCode: uniqueCode,
            paymentStatus: true
        }
    });

    if (!order) return res.json({ success: false })

    const transaction = await Transactions.findOne({
        where: {
            orderId: order.uuid
        },
        include: [
            {
                model: Orders,
                as: "order",
                attributes: ["uniqueCode", "recipientName", 'userId'],
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
            },
            {
                model: Admin,
                as : "admin",
                attributes: ["name"]
            }
        ]
    });

    if (!transaction) return res.json({ success: false })

    return res.json({ success: true, transaction: transaction })
})
router.get('/get/all', async (req, res) => {
    const transactions = await Transactions.findAll({
        include: [
            {
                model: Orders,
                as: "order",
                attributes: ["uniqueCode", "recipientName", 'userId'],
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
            },
            {
                model: Admin,
                as: "admin",
                attributes: ["name"]
            }
        ]
    })

    if (transactions.length === 0) return res.json({ success: false })
    
    return res.json({ success: true, transactions: transactions })
})
router.get('/get/by-range-date/:start/:end', async (req, res) => {
    const { start, end } = req.params;

    const startDate = `${start}T00:00:00.000Z`
    const endDate = `${end}T23:59:59.999Z`

    const transactions = await Transactions.findAll({
        where: {
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        include: [
            {
                model: Orders,
                as: "order",
                attributes: ["uniqueCode", "recipientName", 'userId'],
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
            },
            {
                model: Admin,
                as: "admin",
                attributes: ["name"]
            }
        ]
    })

    if (transactions.length === 0) return res.json({ success: false })

    return res.json({ success: true, transactions: transactions })
})
router.get('/get/daily-report/:today', async (req, res) => {
    const todayString = req.params.today; // ex: '2025-06-01'
    const today = new Date(todayString);

    if (isNaN(today.getTime())) {
        return res.json({ success: false });
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startToday = new Date(today);
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date(today);
    endToday.setHours(23, 59, 59, 999);

    const startYesterday = new Date(yesterday);
    startYesterday.setHours(0, 0, 0, 0);
    const endYesterday = new Date(yesterday);
    endYesterday.setHours(23, 59, 59, 999);

    // Ambil data dari database berdasarkan createdAt
    const todayOrders = await Transactions.findAll({
        where: {
            createdAt: {
                [Op.between]: [startToday, endToday]
            }
        }
    });

    const yesterdayOrders = await Transactions.findAll({
        where: {
            createdAt: {
                [Op.between]: [startYesterday, endYesterday]
            }
        }
    });

    const todayRevenue = todayOrders.reduce((acc, order) => acc + order.totalPrice, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    return res.json({
        success: true,
        dailyReportData: {
            todayOrders: todayOrders.length,
            yesterdayOrders: yesterdayOrders.length,
            todayRevenue,
            yesterdayRevenue
        }
    });
})


//#endregion

module.exports = router;