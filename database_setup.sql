-- Create database if not exists
CREATE DATABASE IF NOT EXISTS todo_app;

-- Use the database
USE todo_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    priority VARCHAR(20),
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    createdAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    userId VARCHAR(50) PRIMARY KEY,
    theme VARCHAR(20) DEFAULT 'light',
    notifications BOOLEAN DEFAULT TRUE,
    darkMode BOOLEAN DEFAULT FALSE,
    emailNotifications BOOLEAN DEFAULT TRUE,
    pushNotifications BOOLEAN DEFAULT TRUE,
    taskReminders BOOLEAN DEFAULT TRUE,
    defaultView VARCHAR(20) DEFAULT 'list',
    FOREIGN KEY (userId) REFERENCES users(id)
);