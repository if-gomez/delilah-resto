const jwt = require('jsonwebtoken');
const {JWT_KEY} = require('../../config');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, JWT_KEY);
        req.userInfo = decoded;
        next();
    } catch (err) {
        res.status(403).json({
            message: 'No estas autorizado'
        })
    }
};