const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { protect };
