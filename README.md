# TDMRC Disaster Mitigations Center Dashboard - Deployment Guide

This repository contains the production-ready Docker setup for the TDMRC Dashboard.

## 📂 Folder Structure

- **src/**: Backend Node.js application (`app.js` builds the Express app, `server.js` boots it).
- **public/**: Frontend assets (Leaflet map, CSS, JS).
- **config/**: Configuration files (Database).
- **test/**: Automated tests (`node --test` + `supertest`).
- **docker/**: Docker-specific configurations (Nginx, Postgres init).
- **docker-compose.yml**: Orchestration of App, Database, and Nginx.

## ✅ Requirements

- Node.js 22+ (for local development and tests)
- Docker + Docker Compose (for deployment)

## 🚀 Quick Start (Local Docker)

1.  **Clone & CD**
    ```bash
    git clone <repo_url>
    cd <repo_directory>
    ```

2.  **Environment Setup**
    ```bash
    cp .env.example .env
    # Edit .env and set a strong POSTGRES_PASSWORD
    ```

3.  **Start Services**
    ```bash
    docker compose up -d --build
    ```

4.  **Access**
    - **Dashboard**: [http://localhost](http://localhost)
    - **API Health**: [http://localhost/api/health](http://localhost/api/health)
    - **PgAdmin** (optional DB GUI): not started by default. Enable it with:
      ```bash
      docker compose --profile tools up -d
      ```
      Then open [http://localhost:5050](http://localhost:5050) and use `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` from `.env`.

## 🧪 Running Tests

```bash
npm ci
npm test
```

Tests use `node:test` and inject a stub database, so no Postgres instance is needed.

## ⚙️ Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port the app listens on |
| `POSTGRES_USER` | - | Database user |
| `POSTGRES_PASSWORD` | - | Database password (set a strong value) |
| `POSTGRES_DB` | - | Database name |
| `POSTGRES_HOST` | `db` | Database host |
| `POSTGRES_PORT` | `5432` | Database port |
| `CORS_ORIGIN` | _disabled_ | Comma-separated list of allowed browser origins |

## 🛠 Deployment to Production (VPS/Cloud)

### Prerequisites (Ubuntu 22.04)

1.  **Update System**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **Install Docker & Docker Compose**
    ```bash
    sudo apt install docker.io docker-compose-plugin -y
    sudo systemctl enable --now docker
    ```

3.  **Firewall Setup (UFW)**
    ```bash
    sudo ufw allow 22/tcp  # SSH
    sudo ufw allow 80/tcp  # HTTP
    sudo ufw allow 443/tcp # HTTPS
    sudo ufw enable
    ```

### Deploying the App

1.  **Transfer Files** (via Git or SCP) to `/var/www/tdmrc`.
2.  **Configure Production `.env`**
    - Change `POSTGRES_PASSWORD` to a strong unique password.
    - Set `NODE_ENV=production`.
3.  **Run Containers**
    ```bash
    docker compose up -d --build
    ```

### SSL Setup (Let's Encrypt with Certbot)

For real domains (e.g., `dashboard.tdmrc.org`), install Certbot on the host:
```bash
sudo apt install certbot python3-certbot-nginx
```
If you are running Nginx inside Docker (as we are), it's easiest to run Certbot with the webroot plugin or use a dedicated sidecar container.

**Simpler Approach for Single VPS:**
Run Nginx on the *Host* instead of Docker, proxying to `localhost:3000`.
OR
Use `nginx-proxy` + `acme-companion` Docker containers for automatic SSL.

## 🛡 Production Hardening

- **Rate Limiting**: 100 requests / 15 minutes per IP on `/api` (configured in `src/app.js`).
- **Security Headers**: Helmet with an explicit Content-Security-Policy (Leaflet is loaded from `unpkg.com`, map tiles from OpenStreetMap).
- **Graceful Shutdown**: `SIGTERM`/`SIGINT` close the HTTP server and the database pool (10s force-exit safety net).
- **Logs**: Application logs are piped to stdout/stderr. Use `docker logs tdmrc_app` to view them.
- **Database Backup**:
    ```bash
    # Backup
    docker exec -t tdmrc_db pg_dumpall -c -U tdmrc_user > backup_$(date +%F).sql

    # Restore
    cat backup_file.sql | docker exec -i tdmrc_db psql -U tdmrc_user -d tdmrc_db
    ```

## 📝 API Documentation

### GET /api/health
Returns system status.
```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "database": "connected",
  "db_time": "2026-01-01T00:00:00.000Z"
}
```
Returns `500` with `{ "status": "error", "database": "disconnected" }` when the database is unreachable.

Unknown `/api/*` routes return `404` JSON instead of the dashboard HTML.

## 🗺 Database Schema
See [ERD.md](./ERD.md) for details.

## 📐 Architecture
See [ARCHITECTURE_AND_OFFLINE.md](./ARCHITECTURE_AND_OFFLINE.md) for the system diagram and offline map strategies.
