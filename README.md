# CoreIntegrator

### Dockerized ERP → CRM Integration Middleware

CoreIntegrator is a lightweight, production-inspired backend integration service that synchronizes customer data between an ERP system and a CRM endpoint.

It demonstrates real-world enterprise integration patterns including incremental synchronization, retry handling, batch processing, transaction safety, logging, health monitoring, and containerized deployment.

---

# 🏗 Architecture Overview

```
ERP (MySQL Container)
        ↓
Integration Middleware (Node.js)
        ↓
CRM Endpoint (Simulated)
        ↓
Audit Logs (sync_logs table)
```

## Components

* **ERP Database** → MySQL container storing customer records
* **Sync Engine** → Node.js service handling transformation & retries
* **CRM Endpoint** → Simulated target system
* **Logging System** → Tracks success/failure for traceability

---

# ⚙️ Key Features

* Incremental sync (only unsynced records processed)
* Batch processing
* Retry mechanism (max 3 attempts)
* Transaction-safe database operations
* Structured logging for audit
* Health check endpoint
* Cron-based automatic scheduler
* Fully Dockerized stack
* One-command deployment

---

# 🚀 Quick Start

## Prerequisites

* Docker installed
* Docker Compose enabled

---

## 🔹 Start System (Recommended Method)

```bash
curl -O https://raw.githubusercontent.com/CLOVEOS/CoreIntegrator/main/docker-compose.yml
docker compose up -d
```

Verify:

```bash
docker ps
```

Expected containers:

* `erp-mysql`
* `magic-integration`

---

# 🩺 Health Check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"UP"}
```

---

# 🗄 Access ERP Database (Simulate User Adding Data)

Enter MySQL container:

```bash
docker exec -it erp-mysql mysql -u root -proot
```

Inside MySQL:

```sql
USE erp_db;

INSERT INTO erp_customers (cust_id, cust_name, phone_no)
VALUES (3, 'Rohit', '9998887776');

SELECT * FROM erp_customers;

exit;
```

This simulates a new ERP customer entry.

---

# 🔁 Trigger Manual Sync

```bash
curl -X POST http://localhost:3000/sync
```

What happens internally:

1. Fetch unsynced ERP records
2. Transform into CRM format
3. Apply retry logic
4. Log result
5. Mark record as synced

---

# 📊 View Sync Logs

```bash
curl http://localhost:3000/logs
```

Shows:

* SUCCESS / FAILED status
* Payload
* Timestamp

---

# ⏱ Automatic Sync (Cron)

The service runs automatic sync every minute.

View logs:

```bash
docker compose logs
```

You will see:

```
Auto-sync triggered
```

---

# 🔄 Full Reset & Fresh Deployment (For Demo)

To completely reset everything and redeploy:

```bash
docker compose down -v 2>/dev/null && \
 docker rm -f magic-integration erp-mysql 2>/dev/null && \
 docker volume prune -f && \
 rm -f docker-compose.yml && \
 curl -O https://raw.githubusercontent.com/CLOVEOS/CoreIntegrator/main/docker-compose.yml && \
 docker compose up -d --build
```

This will:

* Remove containers
* Remove database volume
* Pull latest compose file
* Start clean system

---

# 🧠 Enterprise Concepts Demonstrated

* ERP as source of truth
* Middleware-based system integration
* Idempotent synchronization
* Retry with backoff strategy
* ACID transaction guarantees
* Observability via structured logs
* Infrastructure-as-Code using Docker Compose
* Service health monitoring
* Automated scheduled execution

---

# 🎯 Interview Summary

This project simulates a production-style ERP-to-CRM integration middleware.

It demonstrates:

* Containerized microservice deployment
* Database transaction safety
* Failure handling with retries
* Incremental synchronization
* Automated scheduling
* Logging and audit trail

The system can be deployed on any machine with Docker installed by pulling the compose file and running `docker compose up`.
