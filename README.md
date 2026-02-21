# CoreIntegrator  
### Dockerized ERP → CRM Integration Middleware

CoreIntegrator is a lightweight, production-inspired backend integration service that synchronizes customer data between an ERP system and a CRM endpoint.

It demonstrates real-world enterprise integration patterns including incremental sync, retry handling, batch processing, health monitoring, and containerized deployment.

---

## 🏗 What This Project Does

CoreIntegrator simulates a real-world enterprise integration workflow:

1. Reads unsynced customer records from an ERP database (MySQL)
2. Transforms the data into CRM-compatible format
3. Pushes data to a CRM endpoint
4. Logs success or failure
5. Retries failed operations
6. Marks successfully processed records as synced
7. Automatically runs on a schedule using cron

This mirrors how middleware platforms operate in enterprise environments.

---

## ⚙️ Key Features

- Incremental synchronization (only unsynced records processed)
- Batch-based processing
- Retry mechanism with failure handling
- Database transaction logging
- Health check endpoint
- Cron-based automatic scheduler
- Fully Dockerized stack
- One-command deployment

---

## 🧱 Architecture Overview

ERP (MySQL)  
↓  
Sync Engine (Node.js Service)  
↓  
CRM Endpoint (Simulated API)  

- ERP data stored in MySQL container  
- Sync engine processes records in batches  
- Results logged in `sync_logs` table  
- Containers orchestrated via Docker Compose  

---

## 🚀 Quick Start

### ⚡ One Command (Linux / macOS / WSL)

```bash
curl -sSL https://raw.githubusercontent.com/CLOVEOS/CoreIntegrator/main/docker-compose.yml | docker compose -f - up -d
```
### One Command windows

```
iwr https://raw.githubusercontent.com/CLOVEOS/CoreIntegrator/main/docker-compose.yml -OutFile docker-compose.yml
docker compose up -d
```
