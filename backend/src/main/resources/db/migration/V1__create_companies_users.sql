-- V1: Companies and Users
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    gst_number VARCHAR(20),
    logo_url TEXT,
    invoice_footer TEXT,
    tax_rate_default DECIMAL(5,2) DEFAULT 18.00,
    currency_symbol VARCHAR(5) DEFAULT '₹',
    invoice_prefix VARCHAR(10) DEFAULT 'INV',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'BILLING_STAFF',
    company_id BIGINT REFERENCES companies(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed default company and admin
INSERT INTO companies (name, address, city, gst_number, phone, email, invoice_footer)
VALUES ('My Store', '123 Main Street', 'Mumbai', '27AAPFU0939F1ZV', '+91 9876543210', 'store@example.com', 'Thank you for your business!');

INSERT INTO users (username, email, password_hash, full_name, role, company_id)
VALUES ('admin', 'admin@store.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', 'ADMIN', 1);
-- Default password: admin123

INSERT INTO users (username, email, password_hash, full_name, role, company_id)
VALUES ('staff', 'staff@store.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Billing Staff', 'BILLING_STAFF', 1);
-- Default password: admin123
