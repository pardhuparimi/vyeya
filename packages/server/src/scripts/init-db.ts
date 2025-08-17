import { Pool } from 'pg';
import * as process from 'process';

// Database configuration
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'vyeya_test',
});

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful at:', result.rows[0].now);
    
        // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'buyer',
        bio TEXT,
        location VARCHAR(255),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create categories table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create stores table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id VARCHAR(255) REFERENCES users(id),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create products table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        grower_id VARCHAR(255) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create orders table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        buyer_id VARCHAR(255) REFERENCES users(id),
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create order_items table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(id),
        product_id VARCHAR(255) REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create reviews table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) REFERENCES products(id),
        user_id VARCHAR(255) REFERENCES users(id),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database tables initialized successfully');
    
    // Insert sample data if tables are empty
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('📦 Adding sample data...');
      
      // Add sample users with string IDs
      const growerId = Date.now().toString();
      const buyerId = (Date.now() + 1).toString();
      
      await pool.query(`
        INSERT INTO users (id, email, password, name, role) VALUES
        ($1, 'grower1@example.com', '$2a$10$example.hash.for.testing', 'Test Grower', 'grower'),
        ($2, 'buyer1@example.com', '$2a$10$example.hash.for.testing', 'Test Buyer', 'buyer')
      `, [growerId, buyerId]);
      
      // Add sample products
      const product1Id = (Date.now() + 2).toString();
      const product2Id = (Date.now() + 3).toString();
      
      await pool.query(`
        INSERT INTO products (id, name, description, price, category, grower_id) VALUES
        ($1, 'Fresh Mangoes', 'Organic mangoes from local farm', 5.99, 'Fruits', $3),
        ($2, 'Organic Tomatoes', 'Fresh organic tomatoes', 3.49, 'Vegetables', $3)
      `, [product1Id, product2Id, growerId]);
      
      console.log('✅ Sample data added');
    }
    
    console.log('🎉 Database initialization completed successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase().catch((error) => {
  console.error('Database initialization error:', error);
  // Use global process object
  if (typeof process !== 'undefined') {
    process.exit(1);
  }
});
