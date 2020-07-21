const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcrypt');
const { userExistById, userExistByEmail } = require('../middlewares/users');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middlewares/checkAuth');
const checkAdmin = require('../middlewares/checkAdmin');
const {JWT_KEY} = require('../../config');

router.get('/', [checkAuth, checkAdmin], async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM users', { type: db.QueryTypes.SELECT });
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

router.post('/', userExistByEmail, async (req, res) => {
    const {fullName, password, email, phone, address} = req.body;

        try {
            const pass = await bcrypt.hash(password, 10)
            if(pass){
                const newUser = await db.query('INSERT INTO users (fullName, email, password, phone, address) VALUES (?, ?, ?, ?, ?)', {
                    replacements: [
                        fullName,
                        email,
                        pass,
                        phone,
                        address
                    ]
                });
                if(newUser){
                    res.status(201).json({message: 'Usuario creado'});
                }else{
                    throw new Error;
                };
            }else{
                throw new Error;
            }
        } catch (err) {
            res.status(400).json({
            message: `Error: ${err}`
        });
        }
});

//By id
router.get('/:id', [checkAuth, checkAdmin], async (req, res) => {
    const {id} = req.params;
    try {
        const result = await db.query('SELECT * FROM users WHERE id = ?', {
            type: db.QueryTypes.SELECT,
            replacements: [id]
        });
        console.log(result);
        if(result.length == '0'){
            res.status(404).json({
                message: 'Usuario no encontrado'
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

router.put('/:id', [checkAuth, checkAdmin, userExistById], async (req, res) => {
    const {id} = req.params;
    const {fullName, email, password, phone, address} = req.body;
    try {
        const pass = await bcrypt.hash(password, 10)
        if (pass) {
            const update = await db.query('UPDATE users SET fullName = ?, email = ?, password = ?, phone = ?, address = ? WHERE id = ?',
            {replacements: [
                fullName,
                email,
                pass,
                phone,
                address,
                id
            ]});
            if(update){
                res.status(200).json({
                    message: 'Usuario actualizado'
                })
            }else{
                throw new Error;
            }
        } else {
            throw new Error;
        }
    } catch (err) {
        res.status(400).json({
            message: `Error ${err}`
        })
    }
});

router.delete('/:id', [checkAuth, checkAdmin, userExistById], async (req, res) => {
    const {id} = req.params;

    try {
        const result = await db.query('DELETE FROM users WHERE `id` = ?', 
        {replacements: [id]});
        if(result){
            res.status(200).json({
                message: 'Usuario eliminado'
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

router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try {
        const userExist = await db.query('SELECT * FROM users WHERE email = ?', {
            type: db.QueryTypes.SELECT,
            replacements: [email]
        });
        if (userExist.length == '0'){
            res.status(400).json({
                message: 'Credenciales invalidas'
            })
        }else if(userExist.length >= '1'){
            const passMatched = await bcrypt.compare(password, userExist[0].password)
            if(passMatched){
                const token = jwt.sign({
                    id: userExist[0].id,
                    fullName: userExist[0].fullName,
                    email: userExist[0].email,
                    phone: userExist[0].phone,
                    address: userExist[0].address,
                    admin: userExist[0].admin
                }, JWT_KEY, {
                    expiresIn: "1h"
                });
                res.status(200).json({
                    message: 'Operacion exitosa',
                    token: token
                })
            }else{
                res.status(400).json({
                    message: 'Credenciales invalidas'
                })
            }
        }else{
            throw new Error;
        }
    } catch (err) {
        res.status(400).json({
            message: `Error: ${err}`
        });
    }
    
});

//Cambiar user a admin
router.patch('/admin/:id', [checkAuth, checkAdmin, userExistById], async (req, res) => {
    const {id} = req.params;
    const {admin} = req.body;

    try {
        const update = await db.query('UPDATE users SET admin = ? WHERE users.id = ?', {
            replacements: [
                admin,
                id
            ]
        })
        if(update){
            res.status(200).json({
                message: 'Usuario modificado'
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

//Modificar password de user
router.patch('/pass/:id', [checkAuth, checkAdmin], async (req, res) => {
    const {id} = req.params;
    const {email, password, newPassword} = req.body;

    try {
        const userExist = await db.query('SELECT * FROM users WHERE email = ?', {
            type: db.QueryTypes.SELECT,
            replacements: [email]
        });
        if (userExist.length == '0') {
            res.status(404).json({
                message: 'El usuario no existe'
            })
        } else {
            const passMatched = await bcrypt.compare(password, userExist[0].password)
            if(passMatched){
                const newPass = await bcrypt.hash(newPassword, 10)
                if(newPass){
                    const update = await db.query('UPDATE users SET password = ? WHERE users.id = ?', {
                        replacements: [
                            newPass,
                            id
                        ]
                    })
                    if(update){
                        res.status(200).json({
                            message: 'Contraseña modificada'
                        })
                    }else{
                        throw new Error
                    }
                }else{
                    throw new Error;
                }
            }else{
                res.status(400).json({
                    message: 'Credenciales invalidas'
                })
            }
        }

        
    } catch (err) {
        res.status(400).json({
            message: `Error: ${err}`
        })
    }
});

module.exports = router;