CREATE DATABASE help_nearby;

USE help_nearby;

CREATE TABLE help_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    help_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact VARCHAR(30) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);