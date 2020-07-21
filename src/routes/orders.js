const express = require('express');
const router = express.Router();
const db = require('../db/db');
const checkAuth = require('../middlewares/checkAuth');
const checkAdmin = require('../middlewares/checkAdmin');
const controller = require('../middlewares/orders');
const {orderExist} = controller;

router.get('/', [checkAuth, checkAdmin], async (req, res) => {

    try {
        const orderInfo = await db.query('SELECT orders.id, orders.status, orders.products, orders.total, orders.payment, users.fullName, users.address, users.phone FROM orders JOIN users ON orders.userId = users.id', {
            type: db.QueryTypes.SELECT
        });
        if(orderInfo){
            res.status(200).json(orderInfo)
        }
    } catch (err) {
        res.status(400).json({
            message: `Error ${err}`
        })
    }

});

router.post('/', checkAuth, async (req, res) => {
    const {products, payment} = req.body;
    const userId = req.userInfo.id;
    const productList = products.split(",");
    
    try {
        const product = await db.query('INSERT INTO orders (payment, userId) VALUES (?, ?)',
            {replacements: [
                payment,
                userId
            ]})
        const orderId = product[0];
        for (const productId of productList) {
            await db.query('INSERT INTO orders_products (productId, orderId) VALUES (?, ?)',
            {replacements: [
                productId,
                orderId
            ]});
        }

        //Descrpicion del producto
        const productsName = await db.query('SELECT orders_products.productId, CONCAT(products.name," x", COUNT(name)) as descripcion FROM orders_products JOIN products ON orders_products.productId = products.id WHERE orders_products.orderId = :orderId GROUP BY 1', {
            type: db.QueryTypes.SELECT,
            replacements: {orderId: orderId}
        });
        
        const productDescrption = [];
        for (const product of productsName) {
            productDescrption.push(product.descripcion);
        };
        const productString = productDescrption.toString();

        const productName = await db.query('UPDATE orders SET products = ? WHERE id = ?', {
            replacements: [
                productString,
                orderId
            ]
        })

        //Total del producto
        const price = await db.query('SELECT orders_products.productId, products.price, SUM(price) as Total FROM orders_products JOIN products ON orders_products.productId = products.id WHERE orders_products.orderId = :orderId', {
            type: db.QueryTypes.SELECT,
            replacements: {orderId: orderId}
        });
        const total = await db.query('UPDATE orders SET total = ? WHERE id = ?', {
            replacements: [
                price[0].Total,
                orderId
            ]
        });
        res.status(201).json({
            message: 'Pedido creado'
        })
        
    } catch (err) {
        res.status(400).json({
            message: `Error ${err}`
        })
    }    
});

//By ID

router.get('/:id', [checkAuth, checkAdmin], async (req, res) => {
    const orderId = req.params.id;

    try {
        const orderInfo = await db.query('SELECT orders.id, orders.status, orders.products, orders.total, orders.payment, users.fullName, users.address, users.phone FROM orders JOIN users ON orders.userId = users.id WHERE orders.id = :orderId', {
            type: db.QueryTypes.SELECT,
            replacements: {orderId: orderId}
        });

        if(orderInfo.length > 0){
            res.status(200).json(orderInfo)
        }else{
            res.status(404).json({
                message: 'Pedido no encontrado'
            })
        };
    } catch (err) {
        res.status(400).json({
            message: `Error ${err}`
        });
    }
});

router.delete('/:id', [checkAuth, checkAdmin, orderExist], async (req, res) => {
    const orderId = req.params.id;

    try {
        const deleteKey = await db.query('DELETE FROM orders_products WHERE orderId = :orderId', {
            replacements: {orderId: orderId}
        });
        
        const deleteOrder = await db.query('DELETE FROM orders WHERE id = :orderId', {
            replacements: {orderId: orderId}
        });

        if(deleteKey && deleteOrder){
            res.status(200).json({
                message: 'Pedido eliminado'
            })
        }else{
            throw new Error;
        };

    } catch (err) {
        res.status(400).json({
            message: `Error ${err}`
        });
    }
});

router.patch('/status/:id', [checkAuth, checkAdmin, orderExist], async(req, res) => {
    const {id} = req.params;
    const {status} = req.body;

    try {
        const update = await db.query('UPDATE orders SET status = ? WHERE orders.id = ?', {
            replacements: [
                status,
                id
            ]
        })
        if(update){
            res.status(200).json({
                message: 'Pedido modificado'
            })
        }else{
            throw new Error
        }
    } catch (err) {
        res.status(400).json({
            message: `Error: ${err}`
        })
    }
});

module.exports = router;