# TDMRC Disaster Mitigations Center Dashboard - Deployment Guide

This repository contains the production-ready Docker setup for the TDMRC Dashboard.

## 📂 Folder Structure

- **src/**: Backend Node.js application (Controllers, Models, Routes).
- **public/**: Frontend assets (Leaflet maps, CSS, JS).
- **config/**: Configuration files (Database, Environment).
- **docker/**: Docker-specific configurations (Nginx, Postgres init).
- **docker-compose.yml**: Orchestration of App, Database, and Nginx.

## 🚀 Quick Start (Local Docker)

1.  **Clone & CD**
    ```bash
    git clone <repo_url>
    cd <repo_directory>
    ```

2.  **Environment Setup**
    ```bash
    cp .env.example .env
    # Edit .env if you want to change passwords/ports
    ```

3.  **Start Services**
    ```bash
    docker-compose up -d --build
    ```

4.  **Access**
    - **Dashboard**: [http://localhost](http://localhost)
    - **API Health**: [http://localhost/api/health](http://localhost/api/health)
    - **PgAdmin** (DB GUI): [http://localhost:5050](http://localhost:5050)
      - Email: `admin@tdmrc.com`
      - Pass: `admin_password`

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

- **Rate Limiting**: Configured in `src/server.js` (100 req/15min).
- **Logs**: Application logs are piped to stdout/stderr. Used `docker logs tdmrc_app` to view.
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
  "database": "connected"
}
```

## 🗺 Database Schema
See [ERD.md](./ERD.md) for details.
