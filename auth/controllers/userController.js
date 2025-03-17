const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

// مسار تخزين الملفات
const storagePath = path.join(__dirname, '..', 'storage');

// إنشاء ملف جديد
const createFile = async (req, res) => {
    const { fileName, content } = req.body;
    const userId = req.user.id; // الحصول على معرف المستخدم من الـ token

    if (!fileName || !content) {
        return res.status(400).json({ message: 'File name and content are required' });
    }

    try {
        const userDir = path.join(storagePath, `user_${userId}`);
        await fs.mkdir(userDir, { recursive: true }); // إنشاء مجلد خاص بالمستخدم إذا لم يكن موجودًا

        const filePath = path.join(userDir, fileName);
        await fs.writeFile(filePath, content, 'utf8');

        res.json({ message: 'File created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating file', error: err.message });
    }
};
// قراءة ملف
const readFile = async (req, res) => {
    const { fileName } = req.query;
    const userId = req.user.id;

    if (!fileName) {
        return res.status(400).json({ message: 'File name is required' });
    }

    try {
        const userDir = path.join(storagePath, `user_${userId}`);
        const filePath = path.join(userDir, fileName);

        const content = await fs.readFile(filePath, 'utf8');
        res.json({ content });
    } catch (err) {
        res.status(404).json({ message: 'File not found', error: err.message });
    }
};

// حذف ملف
const deleteFile = async (req, res) => {
    const { fileName } = req.query;
    const userId = req.user.id;

    if (!fileName) {
        return res.status(400).json({ message: 'File name is required' });
    }

    try {
        const userDir = path.join(storagePath, `user_${userId}`);
        const filePath = path.join(userDir, fileName);

        await fs.unlink(filePath);
        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting file', error: err.message });
    }
};



// تسجيل مستخدم جديد
const registerUser = (req, res) => {
    const { name, email, password, phone, address } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, address],
            (err) => {
                if (err) return res.status(500).json({ message: 'Error registering user' });
                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    });
};

// تسجيل الدخول
const loginUser = (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: results[0].id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    });
};

// جلب بيانات المستخدم
const getUserProfile = (req, res) => {
    db.query('SELECT id, name, email, phone, address FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(results[0]);
    });
};

// تحديث بيانات المستخدم
const updateUserProfile = (req, res) => {
    const { name, password } = req.body;
    let sql = 'UPDATE users SET name = ? WHERE id = ?';
    let params = [name, req.user.id];

    if (password) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: 'Error hashing password' });
            sql = 'UPDATE users SET name = ?, password = ? WHERE id = ?';
            params = [name, hashedPassword, req.user.id];
            db.query(sql, params, (err) => {
                if (err) return res.status(500).json({ message: 'Error updating profile' });
                res.json({ message: 'Profile updated successfully' });
            });
        });
    } else {
        db.query(sql, params, (err) => {
            if (err) return res.status(500).json({ message: 'Error updating profile' });
            res.json({ message: 'Profile updated successfully' });
        });
    }
};

// حذف المستخدم
const deleteUser = (req, res) => {
    db.query('DELETE FROM users WHERE id = ?', [req.user.id], (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting user' });
        res.json({ message: 'User deleted successfully' });
    });
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    createFile,
    readFile,
    deleteFile,
};