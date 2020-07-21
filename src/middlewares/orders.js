const db = require('../db/db');
const controller = {};

controller.orderExist = async (req, res, next) => {
    const {id} = req.params;

    const orderExist = await db.query('SELECT * FROM orders WHERE id = ?', {
        type: db.QueryTypes.SELECT,
        replacements: [id]
    })

    if(orderExist.length == '0'){
        res.status(404).json({
            message: 'ID invalido'
        })
    }else{
        next();
    }
};

module.exports = controller;