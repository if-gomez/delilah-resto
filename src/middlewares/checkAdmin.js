const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const {admin} = req.userInfo;
    
    try {
        if(admin == '0'){
            throw new Error;    
        }else{
            next();
        }
    } catch (err) {
        res.status(403).json({
            message: 'No estas autorizado'
        })
    }
};