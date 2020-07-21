const db = require('../db/db');
const controller = {};

controller.productExist = async (req, res, next) => {
    const {id} = req.params;

    const productExist = await db.query('SELECT * FROM products WHERE id = ?', {
        type: db.QueryTypes.SELECT,
        replacements: [id]
    })

    if(productExist.length == '0'){
        res.status(404).json({
            message: 'ID invalido'
        })
    }else{
        next();
    }
};

module.exports = controller;