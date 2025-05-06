# PHP Database Setup Guide

This guide will help you set up the database for your Todo App using phpMyAdmin.

## Prerequisites

1. Make sure you have a local server environment set up (like XAMPP, MAMP, or WAMP)
2. Ensure phpMyAdmin is accessible
3. Make sure PHP is enabled on your server

## Setup Steps

### 1. Start Your Local Server

- For XAMPP: Start Apache and MySQL services
- For MAMP: Start the server
- For WAMP: Start all services

### 2. Create the Database

1. Open phpMyAdmin (usually at http://localhost/phpmyadmin)
2. You can either:
   - Import the `database_setup.sql` file directly
   - Or create the database and tables manually:
     - Create a new database named `todo_app`
     - Run the SQL commands from `database_setup.sql`

### 3. Configure the Connection