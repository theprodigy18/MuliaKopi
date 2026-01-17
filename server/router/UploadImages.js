const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// ========== CONFIGURATIONS ==========

// Folder upload untuk produk dan user
const PRODUCT_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'products');

// Pastikan folder ada
[PRODUCT_UPLOAD_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Filter file gambar
const fileFilter = (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file JPG, JPEG, dan PNG yang diizinkan'), false);
    }
};

// ========== MULTER SETUP ==========

// Storage untuk produk
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, PRODUCT_UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, file.originalname),
});
const uploadProduct = multer({ storage: productStorage, fileFilter });

// ========== ROUTES ==========

// Upload produk
router.post('/post/product', uploadProduct.single('image'), (req, res) => {
    if (!req.file) {
        return res.json({ success: false, message: 'Tidak ada file yang diupload' });
    }
    return res.json({ success: true, message: 'Upload produk berhasil' });
});

// Hapus produk
router.delete('/delete/product/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(PRODUCT_UPLOAD_DIR, path.basename(filename));

    if (!fs.existsSync(filePath)) {
        return res.json({ success: false, message: 'File produk tidak ditemukan' });
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.json({ success: false, message: 'Gagal menghapus file produk' });
        }
        return res.json({ success: true, message: 'File produk berhasil dihapus' });
    });
});

module.exports = router;