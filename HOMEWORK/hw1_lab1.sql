CREATE DATABASE library_db; 
USE library_db; 
CREATE TABLE authors( 
id INT AUTO_INCREMENT PRIMARY KEY, 
author_name VARCHAR(1000) NOT NULL, 
nationality VARCHAR(1000) 
); 
CREATE TABLE books( 
id INT AUTO_INCREMENT PRIMARY KEY, 
title VARCHAR(1000) NOT NULL, 
author_id INT NOT NULL, 
category VARCHAR(1000), 
publish_year INT, 
CONSTRAINT books_authors  
FOREIGN KEY (author_id) REFERENCES authors(id)  
ON DELETE CASCADE ON UPDATE CASCADE 
); 
CREATE TABLE borrow_records( 
 id INT AUTO_INCREMENT PRIMARY KEY, 
    book_id INT NOT NULL, 
    borrower_name VARCHAR(1000) NOT NULL, 
    borrow_date DATE NOT NULL, 
    return_date DATE, 
    CONSTRAINT borrow_books  
        FOREIGN KEY (book_id) REFERENCES books(id)  
        ON DELETE CASCADE ON UPDATE CASCADE 
); 
 
INSERT INTO authors (author_name, nationality) VALUES 
('J.K. Rowling', 'British'), 
('Haruki Murakami', 'Japanese'), 
('Nguyen Nhat Anh', 'Vietnamese'); 
 
INSERT INTO books (title, author_id, category, publish_year) VALUES 
('Harry Potter and the Philosopher''s Stone', 1, 'Fantasy', 1997), 
('Norwegian Wood', 2, 'Novel', 1987), 
('Mat Biec', 3, 'Romance', 1990); 
 
INSERT INTO borrow_records (book_id, borrower_name, borrow_date, return_date) 
VALUES 
(1, 'Nguyen Van Thanh', '2026-10-01', '2026-10-15'), 
(2, 'Tran Nhu Quynh', '2026-10-05', NULL), 
(3, 'Le Van Viet', '2026-10-08', '2026-10-20'); 
 
SELECT  
    b.title AS `Book Title`, 
    a.author_name AS `Author Name`, 
    br.borrower_name AS `Borrower Name`, 
    br.borrow_date AS `Borrow Date` 
     
FROM borrow_records br 
INNER JOIN books b ON br.book_id = b.id 
INNER JOIN authors a ON b.author_id = a.id; 