-- V4: Stock Movements and Indexes
CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT REFERENCES items(id),
    movement_type VARCHAR(20) NOT NULL,
    quantity_change DECIMAL(12,3) NOT NULL,
    quantity_before DECIMAL(12,3) NOT NULL,
    quantity_after DECIMAL(12,3) NOT NULL,
    reference_id BIGINT,
    reference_type VARCHAR(20),
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_items_company ON items(company_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_code ON items(item_code);
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_stock_movements_item ON stock_movements(item_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_customers_phone ON customers(phone);
