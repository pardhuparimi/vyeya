#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('🗃️ Initializing test database...');
  
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'postgres-test',
    user: process.env.POSTGRES_USER || process.env.DB_USER || 'test', 
    password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'test',
    database: process.env.POSTGRES_DB || process.env.DB_NAME || 'vyeya_test',
    port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || '5432'),
  });

  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    console.log('✅ Database initialized successfully');
    
    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Created tables:', result.rows.map(row => row.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().catch(console.error);
}

module.exports = { initializeDatabase };
