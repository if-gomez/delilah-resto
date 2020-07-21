const db = require('../db/db');
const controller = {};

controller.userExistById = async (req, res, next) => {
    const {id} = req.params;

    try {
        const userExist = await db.query('SELECT * FROM users WHERE id = ?', {
            type: db.QueryTypes.SELECT,
            replacements: [id]
        });
        if(userExist.length >= '1'){
            next();
        }else{
            res.status(404).json({
                message: 'Usuario no encontrado'
            })
        }
    } catch (err) {
        res.status(400).json({
            message: `Error: ${err}`
        });  
    }
};

controller.userExistByEmail = async (req, res, next) => {
    const {email} = req.body;

    try {
        const userExist = await db.query('SELECT * FROM users WHERE email = ?', {
            type: db.QueryTypes.SELECT,
            replacements: [email]
        });
        console.log(userExist.length);
        if(userExist.length >= '1'){
            res.status(409).json({
                message: 'El email esta siendo utilizado'
            });
        }else{
            next();
        }
    } catch (err) {
        res.status(400).json({
            message: `Error: ${err}`
        });  
    }
};

module.exports = controller;