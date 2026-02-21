# SyncBridge  
### Dockerized ERP → CRM Integration Middleware

SyncBridge is a production-style backend integration service that synchronizes ERP customer data to a CRM system using batch processing, retry logic, and Docker-based deployment.

This project demonstrates real-world enterprise integration concepts:

- Incremental synchronization
- Retry mechanism with failure handling
- Batch processing
- Transaction-safe database operations
- Health checks
- Containerized deployment (Docker + Compose)

---

## 🏗 Architecture

ERP (MySQL) → Sync Engine → CRM Endpoint (Simulated)

• ERP customer records stored in MySQL  
• Sync engine processes unsynced records  
• Data transformed before CRM push  
• Success/Failure logged in `sync_logs`  
• Cron scheduler triggers automatic sync  

---

# 🚀 Quick Start

## ⚡ One-Command Setup (No Clone Required)

### Linux / macOS / WSL

```bash
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/syncbridge/main/docker-compose.yml | docker compose -f - up -d

```windows powershell
iwr https://raw.githubusercontent.com/YOUR_USERNAME/syncbridge/main/docker-compose.yml -OutFile docker-compose.yml; docker compose up -d
