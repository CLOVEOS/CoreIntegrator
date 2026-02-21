require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

async function initializeDatabase() {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS erp_customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cust_id INT,
                cust_name VARCHAR(100),
                phone_no VARCHAR(20),
                synced BOOLEAN DEFAULT FALSE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS sync_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                payload TEXT,
                status VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const [rows] = await connection.query(
            "SELECT COUNT(*) as count FROM erp_customers"
        );

        if (rows[0].count === 0) {
            await connection.query(`
                INSERT INTO erp_customers (cust_id, cust_name, phone_no)
                VALUES
                (1, 'Rahul', '9876543210'),
                (2, 'Anita', '9123456780')
            `);
            console.log("Seed data inserted");
        }

        console.log("Database initialized successfully");
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    initializeDatabase
};