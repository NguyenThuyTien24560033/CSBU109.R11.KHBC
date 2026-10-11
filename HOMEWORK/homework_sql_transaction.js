require('dotenv').config();
const mysql = require('mysql2/promise');

async function placeOrder(customerId, productId, quantity) {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'store_transaction_db',
  });

  try {
    await conn.beginTransaction();
    console.log('BEGIN TRANSACTION');

    const [customers] = await conn.execute(
      'SELECT id, full_name, balance FROM customers WHERE id = ? FOR UPDATE',
      [customerId]
    );
    if (customers.length === 0) throw new Error('Customer not found');

    const [products] = await conn.execute(
      'SELECT id, product_name, price, stock FROM products WHERE id = ? FOR UPDATE',
      [productId]
    );
    if (products.length === 0) throw new Error('Product not found');

    const customer = customers[0];
    const product = products[0];

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }

    const unitPrice = Number(product.price);
    const total = unitPrice * quantity;

    if (Number(customer.balance) < total) {
      throw new Error(
        `Insufficient balance: required ${total}, available ${customer.balance}`
      );
    }
    if (product.stock < quantity) {
      throw new Error(
        `Out of stock: requested ${quantity}, available ${product.stock}`
      );
    }
    console.log('Step 1 OK: balance and stock are sufficient');

    await conn.execute(
      'UPDATE customers SET balance = balance - ? WHERE id = ?',
      [total, customerId]
    );
    console.log(`Step 2 OK: deducted ${total} from customer balance`);

    await conn.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [quantity, productId]
    );
    console.log(`Step 3 OK: deducted ${quantity} from product stock`);

    const [orderResult] = await conn.execute(
      'INSERT INTO orders (customer_id, total_amount, created_at) VALUES (?, ?, NOW())',
      [customerId, total]
    );
    const orderId = orderResult.insertId;
    console.log(`Step 4 OK: created order #${orderId}`);

    await conn.execute(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, productId, quantity, unitPrice]
    );
    console.log('Step 5 OK: inserted order item');

    await conn.commit();
    console.log(`COMMIT: order #${orderId} placed successfully`);
  } catch (err) {
    await conn.rollback();
    console.error(`ROLLBACK: ${err.message}`);
  } finally {
    await conn.end();
  }
}

const customerId = Number(process.argv[2] || 1);
const productId = Number(process.argv[3] || 1);
const quantity = Number(process.argv[4] || 1);

placeOrder(customerId, productId, quantity);