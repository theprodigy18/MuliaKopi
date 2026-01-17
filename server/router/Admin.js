const express = require("express");
const router = express.Router();
const { Admin } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//#region GET
router.get('/get/auth/verify/token', async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.json({ success: false });
    }
    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

        if (!decoded) {
            return res.json({ success: false });
        }

        const admin = await Admin.findOne({
            where: {
                uuid: decoded.uuid,
                username: decoded.username
            }
        });


        if (admin) {
            const safeAdmin = {
                uuid: admin.uuid,
                name: admin.name
            }

            return res.json({ success: true, admin: safeAdmin });
        }

        return res.json({ success: false });
    }
    catch (error) {
        return res.json({ success: false });
    }
})
//#endregion

//#region POST
router.post('/post/auth/create-admin', async (req, res) => {
    const { name, username, password } = req.body;

    const existingAdmin = await Admin.findOne({ where: { username: username } });

    if (existingAdmin) {
        return res.json({ success: false, message: "Username telah digunakan." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
        name: name,
        username: username,
        password: hashedPassword
    });

    if (!newAdmin) return res.json({ success: false });

    return res.json({ success: true });
})
router.post('/post/auth/login', async (req, res) => {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ where: { username: username } });

    if (!existingAdmin) {
        return res.json({ success: false, message: "Username atau password salah." });
    }
    const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);

    if (!isPasswordValid) {
        return res.json({ success: false, message: "Username atau password salah." });
    }

    try {
        const token = jwt.sign({ uuid: existingAdmin.uuid, username: existingAdmin.username, role: 'admin' }, process.env.ADMIN_JWT_SECRET,
            {
                expiresIn: '8h',
            });

        return res.json({ success: true, message: "Login berhasil.", token: token });
    }
    catch (error) {
        return res.json({ success: false, message: "Terjadi kesalahan saat login." });
    }
})
//#endregion


module.exports = router;