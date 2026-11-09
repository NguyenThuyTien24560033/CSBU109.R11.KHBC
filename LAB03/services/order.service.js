import pool from '../config/db.js';

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

export const placeOrder = async (customerId, items) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [customers] = await conn.query('SELECT id FROM customers WHERE id = ?', [customerId]);
        if (customers.length === 0) {
            throw createError(404, 'Customer not found');
        }

        const productIds = items.map(item => item.productId);
        const [products] = await conn.query('SELECT id, product_name, price, stock FROM products WHERE id IN (?) FOR UPDATE', [productIds]);
        if (products.length !== new Set(productIds).size) {
            throw createError(404, 'Product not found');
        }

        let totalAmount = 0;
        for (const item of items) {
            const product = products.find(p => p.id === item.productId);

            if (product.stock < item.quantity) {
                throw createError(400, `Product ${product.product_name} is out of stock`);
            }
            totalAmount += Number(product.price) * item.quantity;
        }

        const [orderResult] = await conn.query('INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)', [customerId, totalAmount]);
        const orderId = orderResult.insertId;

        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            await conn.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)', 
                [orderId, item.productId, item.quantity, product.price]);

            await conn.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.productId]
            );
        }

        await conn.commit();

        return {
            orderId,
            customerId,
            totalAmount,
            status: 'pending',
            items
        };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const getOrdersService = async (status, customerId, limit, offset) => {
    const filterStatus = status || null;
    const filterCustomerId = customerId ? Number(customerId) : null;

    const countSql = `
        SELECT COUNT(*) AS total 
        FROM orders o 
        WHERE (? IS NULL OR o.status = ?) 
          AND (? IS NULL OR o.customer_id = ?)
    `;
    const [countRows] = await pool.query(countSql, [
        filterStatus, filterStatus,
        filterCustomerId, filterCustomerId
    ]);
    const totalOrders = countRows[0].total;

    const sql = `
        SELECT 
            o.id AS order_id,
            c.full_name AS customer_name,
            c.email,
            o.status,
            o.total_amount,
            COALESCE(SUM(oi.quantity), 0) AS total_items_count,
            o.created_at
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE (? IS NULL OR o.status = ?) 
          AND (? IS NULL OR o.customer_id = ?)
        GROUP BY o.id, c.full_name, c.email
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
    `;

    const [orders] = await pool.query(sql, [
        filterStatus, filterStatus,
        filterCustomerId, filterCustomerId,
        limit, offset
    ]);

    return { orders, totalOrders };
};

export const getOrderByIdService = async (id) => {
    const sql = `
        SELECT 
            o.id AS order_id,
            o.status,
            o.total_amount,
            o.created_at,
            c.id AS customer_id,
            c.full_name AS customer_name,
            c.email,
            c.phone,
            p.product_name,
            oi.quantity,
            oi.unit_price,
            (oi.quantity * oi.unit_price) AS subtotal
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.id = ?
    `;

    const [rows] = await pool.query(sql, [id]);

    if (rows.length === 0) {
        throw createError(404, 'Order not found');
    }

    const order = {
        orderId: rows[0].order_id,
        status: rows[0].status,
        totalAmount: rows[0].total_amount,
        createdAt: rows[0].created_at,
        customer: {
            id: rows[0].customer_id,
            name: rows[0].customer_name,
            email: rows[0].email,
            phone: rows[0].phone
        },
        items: rows[0].product_name ? rows.map(row => ({
            productName: row.product_name,
            quantity: row.quantity,
            unitPrice: row.unit_price,
            subtotal: row.subtotal
        })) : []
    };

    return order;
};

export const updateOrderStatusService = async (id, newStatus) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [orders] = await conn.query(
            'SELECT id, status FROM orders WHERE id = ? FOR UPDATE',
            [id]
        );

        if (orders.length === 0) {
            throw createError(404, 'Order not found');
        }

        const currentOrder = orders[0];

        if (currentOrder.status === 'cancelled') {
            throw createError(400, 'Order is already cancelled');
        }

        if (newStatus === 'cancelled') {
            const [items] = await conn.query(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            for (const item of items) {
                await conn.query(
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
        }

        await conn.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [newStatus, id]
        );

        await conn.commit();

        return {
            orderId: id,
            status: newStatus
        };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const deleteOrderService = async (id) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [orders] = await conn.query(
            'SELECT id, status FROM orders WHERE id = ? FOR UPDATE',
            [id]
        );

        if (orders.length === 0) {
            throw createError(404, 'Order not found');
        }

        const currentOrder = orders[0];

        if (currentOrder.status !== 'cancelled') {
            const [items] = await conn.query(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            for (const item of items) {
                await conn.query(
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
        }

        await conn.query('DELETE FROM orders WHERE id = ?', [id]);

        await conn.commit();

        return {
            message: 'Order deleted successfully'
        };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export const getSalesSummaryService = async () => {
    const summarySql = `
        SELECT 
            COALESCE(SUM(total_amount), 0) AS totalRevenue,
            COUNT(*) AS completedOrdersCount,
            COALESCE(AVG(total_amount), 0) AS averageOrderValue
        FROM orders
        WHERE status = 'completed'
    `;
    const [summaryRows] = await pool.query(summarySql);
    const summary = summaryRows[0];

    const topProductsSql = `
        SELECT 
            p.id,
            p.product_name,
            SUM(oi.quantity) AS total_quantity_sold
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.status = 'completed'
        GROUP BY p.id, p.product_name
        ORDER BY total_quantity_sold DESC
        LIMIT 3
    `;
    const [topSellingProducts] = await pool.query(topProductsSql);

    return {
        totalRevenue: Number(summary.totalRevenue),
        completedOrdersCount: Number(summary.completedOrdersCount),
        averageOrderValue: Number(summary.averageOrderValue),
        topSellingProducts
    };
};

export const getCustomerOrderHistoryService = async (customerId) => {
    const [customers] = await pool.query('SELECT id, full_name, email FROM customers WHERE id = ?', [customerId]);
    if (customers.length === 0) {
        throw createError(404, 'Customer not found');
    }

    const [orders] = await pool.query(
        'SELECT id, status, total_amount, created_at FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
        [customerId]
    );

    const [spentRows] = await pool.query(
        "SELECT COALESCE(SUM(total_amount), 0) AS totalLifetimeSpent FROM orders WHERE customer_id = ? AND status = 'completed'",
        [customerId]
    );
    const totalLifetimeSpent = Number(spentRows[0].totalLifetimeSpent);

    return {
        customer: customers[0],
        totalLifetimeSpent,
        orders
    };
};