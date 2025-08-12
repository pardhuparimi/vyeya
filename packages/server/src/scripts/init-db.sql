-- Connect to vyeya database (assuming it exists)
-- CREATE DATABASE vyeya; -- Database created by Docker

-- Create users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('Buyer', 'Seller', 'Delivery', 'Admin')) NOT NULL,
    address JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create stores table
CREATE TABLE stores (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('Casual', 'Business')) NOT NULL,
    location JSONB,
    hours JSONB,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id VARCHAR(255) REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    store_id VARCHAR(255) REFERENCES stores(id),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    location JSONB,
    category_id VARCHAR(255) REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    store_id VARCHAR(255) REFERENCES stores(id),
    status VARCHAR(20) CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered')) DEFAULT 'Pending',
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) REFERENCES products(id),
    user_id VARCHAR(255) REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);

-- Insert sample data
INSERT INTO categories (id, name) VALUES 
('1', 'Fresh Produce'),
('2', 'Dairy'),
('3', 'Bakery');

INSERT INTO users (id, email, phone, role, address) VALUES 
('1', 'farmer@example.com', '+1234567890', 'Seller', '{"street": "123 Farm St", "city": "Brooklyn", "state": "NY"}');

INSERT INTO stores (id, user_id, name, type, location, hours, verified) VALUES 
('1', '1', 'Local Farm Market', 'Casual', '{"lat": 40.7128, "lng": -74.0060}', '{"open": "8:00", "close": "18:00"}', true);

INSERT INTO products (id, store_id, name, price, stock, location, category_id) VALUES 
('1', '1', 'Fresh Mangoes', 5.99, 50, '{"lat": 40.7128, "lng": -74.0060}', '1'),
('2', '1', 'Organic Tomatoes', 3.49, 25, '{"lat": 40.7128, "lng": -74.0060}', '1');