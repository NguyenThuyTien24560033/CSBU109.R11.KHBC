import 'dotenv/config';
import express from 'express';
import pool from './config/db.js';
import orderRouter from './routes/order.routes.js';
import customerRouter from './routes/customer.routes.js';
import setupSwagger from './config/swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

setupSwagger(app);

app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/customers', customerRouter);

app.use((err, req, res, next) => {
    console.error('Server error: ', err.message);
    const status = err.status || 500;

    res.status(status).json({
        success: false,
        err: err.message || 'Internal server error'
    });
});

pool.query('SELECT 1')
    .then(() => {
        app.listen(PORT, () => console.log('Server API is running at: http://localhost:' + PORT));
    })
    .catch((err) => console.error('MySQL connection failed:', err.message));