const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 4000;

//Import routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');


//Middlewares
app.use(express.json());
app.use(cors());

//Routes
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/orders", ordersRoutes);

//Run server
app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});