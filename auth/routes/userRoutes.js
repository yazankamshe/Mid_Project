const express = require('express');
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    createFile,
    readFile,
    deleteFile}  = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUser);
// مسارات الملفات
router.post('/files/create', protect, createFile); // إنشاء ملف
router.get('/files/read', protect, readFile);     // قراءة ملف
router.delete('/files/delete', protect, deleteFile); // حذف ملف


module.exports = router;