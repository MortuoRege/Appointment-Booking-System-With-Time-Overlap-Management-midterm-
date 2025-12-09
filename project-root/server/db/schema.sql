-- Create database + user (run as root)
CREATE DATABASE IF NOT EXISTS appointment_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'appt_user'@'localhost' IDENTIFIED BY 'password123456';
GRANT ALL PRIVILEGES ON appointment_app.* TO 'appt_user'@'localhost';
FLUSH PRIVILEGES;

USE appointment_app;

-- =========================
-- Clients (self-register)
-- =========================
CREATE TABLE clients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

-- =========================
-- Staff (created by admin)
-- =========================
CREATE TABLE staff (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

-- =========================
-- Admins (manage staff, system)
-- =========================
CREATE TABLE admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

-- =========================
-- Appointments
-- =========================
CREATE TABLE appointments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id INT UNSIGNED NOT NULL,
  staff_id INT UNSIGNED NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  notes TEXT,

  CONSTRAINT fk_appointments_client
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_staff
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

CREATE INDEX idx_appointments_staff_time
  ON appointments (staff_id, start_time, end_time);

