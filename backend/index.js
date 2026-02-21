require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const { pool, initializeDatabase } = require("./db");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MAX_RETRIES = 3;
const BATCH_SIZE = 2;
const RETRY_DELAY = 500;

/* ---------- WAIT FOR DATABASE ---------- */
async function waitForDB() {
    let connected = false;
    while (!connected) {
        try {
            await pool.query("SELECT 1");
            connected = true;
            console.log("Database connection established");
        } catch {
            console.log("Waiting for database...");
            await new Promise(res => setTimeout(res, 2000));
        }
    }
}

/* ---------- FETCH UNSYNCED ---------- */
async function getErpCustomers() {
    const [rows] = await pool.query(
        "SELECT * FROM erp_customers WHERE synced = FALSE"
    );
    return rows;
}

/* ---------- BATCH ---------- */
function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

/* ---------- PROCESS WITH RETRY + TX ---------- */
async function processWithRetry(data, erpId) {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        const connection = await pool.getConnection();
        try {
            console.log(`Processing ERP ID ${erpId} (Attempt ${attempts + 1})`);

            await connection.beginTransaction();

            if (Math.random() < 0.2) {
                throw new Error("Simulated CRM failure");
            }

            await connection.query(
                "INSERT INTO sync_logs (payload, status) VALUES (?, ?)",
                [JSON.stringify(data), "SUCCESS"]
            );

            await connection.query(
                "UPDATE erp_customers SET synced = TRUE WHERE id = ?",
                [erpId]
            );

            await connection.commit();
            connection.release();

            console.log(`SUCCESS for ERP ID ${erpId}`);
            return;

        } catch (err) {
            await connection.rollback();
            connection.release();
            attempts++;

            if (attempts === MAX_RETRIES) {
                await pool.query(
                    "INSERT INTO sync_logs (payload, status) VALUES (?, ?)",
                    [JSON.stringify(data), "FAILED"]
                );
                console.log(`FAILED after retries for ERP ID ${erpId}`);
                return;
            }

            await new Promise(res => setTimeout(res, RETRY_DELAY));
        }
    }
}

/* ---------- CORE SYNC ---------- */
async function runSync() {
    console.log("Starting sync...");

    const customers = await getErpCustomers();
    if (customers.length === 0) {
        console.log("No new records to sync.");
        return;
    }

    const batches = chunkArray(customers, BATCH_SIZE);

    for (const batch of batches) {
        for (const customer of batch) {
            const transformed = {
                customerId: customer.cust_id,
                name: customer.cust_name,
                phone: customer.phone_no
            };
            await processWithRetry(transformed, customer.id);
        }
    }

    console.log("Sync completed.");
}

/* ---------- ROUTES ---------- */
app.post("/sync", async (req, res) => {
    try {
        await runSync();
        res.json({ message: "Manual sync completed" });
    } catch {
        res.status(500).json({ error: "Sync failed" });
    }
});

app.get("/logs", async (req, res) => {
    const [rows] = await pool.query(
        "SELECT * FROM sync_logs ORDER BY created_at DESC"
    );
    res.json(rows);
});

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ status: "UP" });
    } catch {
        res.status(500).json({ status: "DOWN" });
    }
});

/* ---------- SCHEDULER ---------- */
cron.schedule("*/1 * * * *", async () => {
    try {
        console.log("Auto-sync triggered");
        await runSync();
    } catch (err) {
        console.error("Scheduler error:", err.message);
    }
});

/* ---------- STARTUP ---------- */
(async () => {
    await waitForDB();
    await initializeDatabase();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();