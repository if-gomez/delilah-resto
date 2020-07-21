const express = require('express');
const router = express.Router();
const db = require('../db/db');
const controller = require('../middlewares/products');
const {productExist} = controller;
const checkAuth = require('../middlewares/checkAuth');
const checkAdmin = require('../middlewares/checkAdmin');

router.get('/', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM products', { type: db.QueryTypes.SELECT });
        if(results){
            res.status(200).json(results);
        }else{
            throw new Error;
        }
    } catch (err) {
        res.status(400).json({
            message: `Error: ${err}`
        })
    }
});

router.post('/', [checkAuth, checkAdmin], async (req, res) => {
    try {
        const {name, description, image, stock, favourite, price} = req.body;

        const product = await db.query('INSERT INTO products (name, description, image, stock, favourite, price) VALUES (?, ?, ?, ?, ?, ?)',
        {replacements: [
            name,
            description,
            image,
            stock,
            favourite,
            price
        ]});
        if(product){
            res.status(201).json({
                message: 'Producto creado'
            });
        }else{
            throw new Error;
        }
    } catch (err) {
        res.status(400).json({
            message: `Error: ${err}`
        })
    }
});

//By ID
router.get('/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const result = await db.query('SELECT * FROM products WHERE id = ?', {
            type: db.QueryTypes.SELECT,
            replacements: [id]
        });
        console.log(result);
        if(result.length == '0'){
            res.status(404).json({
                message: 'Producto no encontrado'
            })
        }else if(result.length >= '1'){
            res.status(200).json(result)
        }else{
            throw new Error
        }
    } catch (err) {
        res.status(400).json({
            message: `Error: ${err}`
        });
    }
});

router.put('/:id', [checkAuth, checkAdmin, productExist], async (req, res) => {
    const {id} = req.params;
    const {name, description, image, stock, favourite, price} = req.body;
    try {
        const update = await db.query('UPDATE products SET name = ?, description = ?, image = ?, stock = ?, favourite = ?, price = ? WHERE id = ?',
            {replacements: [
                name,
                description,
                image,
                stock,
                favourite,
                price,
                id
            ]});

            if(update){
                res.status(200).json({
                    message: 'Producto actualizado'
                });
            }else{
                throw new Error;
            }

    } catch (err) {
        res.status(400).json({
            message: `Error: ${err}`
        });
    }    
});

router.delete('/:id', [checkAuth, checkAdmin, productExist], async (req, res) => {
    const {id} = req.params;

    try {
        const result = await db.query('DELETE FROM products WHERE `id` = ?', 
        {replacements: [id]});

        if(result){
            res.status(200).json({
                message: 'Producto eliminado'
            });
        }else{
            throw new Error;
        };

    } catch (err) {
        res.status(400).json({
            message: `Error: ${err}`
        });
    };
});

module.exports = router;