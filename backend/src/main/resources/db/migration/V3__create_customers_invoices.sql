-- V3: Customers, Invoices, Invoice Items
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    gst_number VARCHAR(20),
    company_id BIGINT REFERENCES companies(id),
    total_purchases DECIMAL(14,2) DEFAULT 0,
    total_invoices INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoice_sequences (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id),
    year INT NOT NULL,
    last_sequence BIGINT DEFAULT 0,
    UNIQUE(company_id, year)
);

CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    customer_id BIGINT REFERENCES customers(id),
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20),
    company_id BIGINT REFERENCES companies(id),
    created_by BIGINT REFERENCES users(id),
    subtotal DECIMAL(14,2) NOT NULL DEFAULT 0,
    discount_type VARCHAR(10) DEFAULT 'NONE',
    discount_value DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    grand_total DECIMAL(14,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(20) DEFAULT 'CASH',
    payment_status VARCHAR(20) DEFAULT 'PAID',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT REFERENCES invoices(id) ON DELETE CASCADE,
    item_id BIGINT REFERENCES items(id),
    item_code VARCHAR(20),
    item_name VARCHAR(200),
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(10),
    unit_price DECIMAL(12,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    line_total DECIMAL(14,2) NOT NULL
);

-- Seed invoice sequence for current year
INSERT INTO invoice_sequences (company_id, year, last_sequence) VALUES (1, 2026, 0);

-- Seed walk-in customer
INSERT INTO customers (name, phone, company_id) VALUES ('Walk-in Customer', '0000000000', 1);
