-- V2: Categories and Items
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    company_id BIGINT REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE item_sequences (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id) UNIQUE,
    last_sequence BIGINT DEFAULT 0
);

CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    item_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(id),
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    quantity DECIMAL(12,3) DEFAULT 0,
    unit VARCHAR(10) DEFAULT 'PIECE',
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    min_stock_threshold DECIMAL(12,3) DEFAULT 10,
    company_id BIGINT REFERENCES companies(id),
    is_active BOOLEAN DEFAULT TRUE,
    date_added DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (name, description, company_id) VALUES ('Fabrics', 'All fabric types', 1);
INSERT INTO categories (name, description, company_id) VALUES ('Accessories', 'Buttons, zippers, threads', 1);
INSERT INTO categories (name, description, company_id) VALUES ('Readymade', 'Readymade garments', 1);

-- Seed item sequence
INSERT INTO item_sequences (company_id, last_sequence) VALUES (1, 0);

-- Seed sample items
INSERT INTO items (item_code, name, category_id, purchase_price, selling_price, quantity, unit, tax_percentage, min_stock_threshold, company_id)
VALUES ('ITM000001', 'Cotton Fabric', 1, 80.00, 120.00, 100, 'METER', 5.00, 10, 1);
INSERT INTO items (item_code, name, category_id, purchase_price, selling_price, quantity, unit, tax_percentage, min_stock_threshold, company_id)
VALUES ('ITM000002', 'Silk Fabric', 1, 250.00, 400.00, 50, 'METER', 5.00, 5, 1);
INSERT INTO items (item_code, name, category_id, purchase_price, selling_price, quantity, unit, tax_percentage, min_stock_threshold, company_id)
VALUES ('ITM000003', 'Thread (White)', 2, 10.00, 20.00, 200, 'PIECE', 18.00, 20, 1);
INSERT INTO items (item_code, name, category_id, purchase_price, selling_price, quantity, unit, tax_percentage, min_stock_threshold, company_id)
VALUES ('ITM000004', 'Buttons (Pack)', 2, 5.00, 15.00, 8, 'PIECE', 18.00, 20, 1);

UPDATE item_sequences SET last_sequence = 4 WHERE company_id = 1;
