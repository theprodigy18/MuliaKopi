const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken")


//#region GET
router.get('/get/auth/verify/token', async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.json({ success: false });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.json({ success: false });
        }

        const user = await Users.findOne({
            where: {
                uuid: decoded.uuid,
                email: decoded.email
            }
        });


        if (user) {
            if (user.status === false) {
                return res.json({ success: false });
            }

            const safeUser = {
                uuid: user.uuid,
                email: user.email,
                name: user.name
            }

            return res.json({ success: true, user: safeUser });
        }

        return res.json({ success: false });
    }
    catch (error) {
        return res.json({ success: false });
    }
})
//#endregion

//#region POST
router.post("/post/auth/create-account", async (req, res) => {
    const { name, email, password } = req.body;
    // Check if the email is already in use
    const existingUser = await Users.findOne({ where: { email } });

    if (existingUser) {
        if (existingUser.status === true) {
            return res.json({ success: false, message: "Email telah digunakan." });
        }
        else if (existingUser.status === false) {
            return res.json({ success: false, message: "Email telah digunakan, silahkan cek email anda untuk aktivasi akun." });
        }
    }

    // Generate a random hex token
    const recoveryToken = crypto.randomBytes(20).toString("hex");

    // Hash the token and password before storing
    const hashedRecoveryToken = await bcrypt.hash(recoveryToken, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const clientURL = process.env.CLIENT_URL;
    // Construct the verification link
    const verificationLink = `${clientURL}/auth/verify/${encodeURIComponent(email)}/${encodeURIComponent(recoveryToken)}`;

    // Set up email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'muliakopistm@gmail.com', // Replace with your email
            pass: 'dpwi iwek kuuh tbqh'    // Replace with your email password or app-specific password
        }
    });

    const mailOptions = {
        from: 'muliakopistm@gmail.com',
        to: email,
        subject: 'Account Verification',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333;">Verifikasi Akun Anda</h2>
            <p>Halo,</p>
            <p>Terima kasih telah mendaftar. Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verifikasi Akun</a>
            </div>
            <p>Atau salin dan tempel tautan berikut di browser Anda:</p>
            <p style="word-break: break-all; color: #555;">${verificationLink}</p>
            <hr style="margin: 32px 0;">
            <p style="font-size: 12px; color: #888;">Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini.</p>
            </div>
        `
    };


    try {
        // Send verification email
        await transporter.sendMail(mailOptions);

        // Only create the user if email sending was successful
        await Users.create({
            email: email,
            name: name,
            password: hashedPassword,
            recoveryToken: hashedRecoveryToken
        });

        return res.json({ success: true, message: "Akun berhasil dibuat, silahkan cek email anda untuk aktivasi akun." });
    }
    catch (error) {
        return res.json({ success: false, message: "Terjadi kesalahan saat mengirim email verifikasi." });
    }
})
router.post('/post/auth/verify/new-account', async (req, res) => {
    let { email, token } = req.body;
    email = decodeURIComponent(email);
    token = decodeURIComponent(token);

    const user = await Users.findOne({
        where: {
            email: email
        }
    });

    if (!user) {
        return res.json({ success: false, message: 'Email atau token tidak valid.' });
    }

    if (user.status === true) {
        return res.json({ success: false, message: 'Email sudah terverifikasi.' });
    }

    const isTokenValid = await bcrypt.compare(token, user.recoveryToken);

    if (!isTokenValid) {
        return res.json({ success: false, message: 'Email atau token tidak valid.' });
    }

    try {
        await Users.update(
            {
                status: true,
                recoveryToken: null
            },
            { where: { email: email } });

        return res.json({ success: true, message: 'Akun berhasil diverifikasi.' });
    }
    catch (error) {
        return res.json({ success: false, message: 'Terjadi kesalahan saat verifikasi akun.' });
    }
})
router.post('/post/auth/login', async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await Users.findOne({ where: { email } });

    if (!existingUser) {
        return res.json({ success: false, message: "Email atau password salah." });
    }
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
        return res.json({ success: false, message: "Email atau password salah." });
    }

    try {
        // Create JWT
        const token = jwt.sign({ uuid: existingUser.uuid, email: existingUser.email, role: 'user' }, process.env.JWT_SECRET,
            {
                expiresIn: '2h',
            });

        return res.json({ success: true, message: "Login berhasil.", token: token });
    }
    catch (error) {
        return res.json({ success: false, message: "Terjadi kesalahan saat login." });
    }
})
//#endregion



module.exports = router;