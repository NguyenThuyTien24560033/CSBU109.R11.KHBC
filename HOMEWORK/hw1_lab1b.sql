CREATE DATABASE IF NOT EXISTS store_transaction_db; 
USE store_transaction_db; 
 
CREATE TABLE customers ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    full_name VARCHAR(100) NOT NULL, 
    balance DECIMAL(12,2) NOT NULL 
); 
 
CREATE TABLE products ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    product_name VARCHAR(150) NOT NULL, 
    price DECIMAL(12,2) NOT NULL, 
    stock INT NOT NULL 
); 
 
CREATE TABLE orders ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    customer_id INT NOT NULL, 
    total_amount DECIMAL(12,2) NOT NULL, 
    created_at DATETIME NOT NULL, 
    FOREIGN KEY (customer_id) REFERENCES customers(id) 
); 
 
CREATE TABLE order_items ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    order_id INT NOT NULL, 
    product_id INT NOT NULL, 
    quantity INT NOT NULL, 
    price DECIMAL(12,2) NOT NULL, 
    FOREIGN KEY (order_id) REFERENCES orders(id), 
    FOREIGN KEY (product_id) REFERENCES products(id) 
); 
INSERT INTO customers (full_name, balance) VALUES  
('Nguyen Van Thanh', 500000.00), 
('Tran Nhu Quynh', 400000.00), 
('Le Van Viet', 300000.00); 
INSERT INTO products (product_name, price, stock) VALUES  
('Tai nghe co day', 50000.00, 6), 
('Tai nghe Gaming', 350000.00, 2), 
('Tai nghe Bluetooth', 150000.00, 10);