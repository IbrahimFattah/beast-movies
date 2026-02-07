import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL environment variable is not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,  // Fail fast if DB is unreachable (5s)
    idleTimeoutMillis: 30000,       // Close idle connections after 30s
    max: 10,                        // Max 10 connections in pool
    query_timeout: 10000,           // Abort queries that take longer than 10s
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// Test connection on startup
pool.query('SELECT NOW()')
    .then(() => console.log('✅ Database connected successfully'))
    .catch((err) => console.error('❌ Database connection failed:', err.message));

export default pool;
