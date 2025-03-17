const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const path = require('path');  // إضافة هذه السطر

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
// خدمة الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'frontend')));

// توجيه المستخدم إلى صفحة index.html عند الوصول إلى الجذر
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use('/api/users', userRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
