CREATE DATABASE db_zencommentary;

USE db_zencommentary;

CREATE TABLE comments (
	id INT PRIMARY KEY AUTO_INCREMENT,
    comment VARCHAR(255),
    kategori VARCHAR(255)
); 

SELECT * FROM comments