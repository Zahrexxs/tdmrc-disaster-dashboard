const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT || 5432,
});

const testDbConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful:', res.rows[0].now);
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        // Don't exit process here, let Docker restart or retry policy handle it
    }
};

module.exports = { pool, testDbConnection };
