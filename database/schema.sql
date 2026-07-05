-- =====================================================================
-- Employee Task Management System - MySQL Schema
-- =====================================================================

CREATE DATABASE IF NOT EXISTS task_management_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE task_management_db;

-- ---------------------------------------------------------------------
-- users: authentication accounts (Admin or Employee)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Employee') NOT NULL DEFAULT 'Employee',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- employees: HR profile, optionally linked to a login account
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
  status ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  assigned_employee_id INT NOT NULL,
  attachment_path VARCHAR(500) NULL,
  attachment_original_name VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_employee FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT chk_due_after_start CHECK (due_date >= start_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT NULL,
  type ENUM('TASK_ASSIGNED', 'TASK_DUE_SOON', 'TASK_COMPLETED') NOT NULL,
  message VARCHAR(500) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_employee ON tasks(assigned_employee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_employees_department ON employees(department);

-- ---------------------------------------------------------------------
-- Seed data (optional)
-- Default admin password below is "Admin@123" hashed with bcrypt (10 rounds).
-- ---------------------------------------------------------------------
INSERT INTO users (full_name, email, password, role)
VALUES (
  'System Admin',
  'admin@taskmanager.com',
  '$2a$10$N8bmYF3pqQWlHWZsNt90ieZqjV6AhEDvNGnW0lPNXHfQe1HtUf0CK',
  'Admin'
)
ON DUPLICATE KEY UPDATE email = email;
-- Login: admin@taskmanager.com / Admin@123
-- (This hash was generated with bcryptjs, 10 salt rounds, and verified to work.)
