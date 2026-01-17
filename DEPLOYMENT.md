# CI/CD Deployment Guide

## GitHub Secrets Required

Add these secrets to your GitHub repository settings:

### Docker Hub Secrets
- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub password or access token

### Server SSH Secrets
- `SERVER_IP` - Your server IP address (e.g., `192.168.1.100`)
- `SSH_USERNAME` - SSH username for your server (e.g., `root` or `ubuntu`)
- `SSH_KEY` - Your private SSH key (entire content including `-----BEGIN` and `-----END`)

## Server Setup Instructions

### 1. Install Docker and Docker Compose on Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Clone Repository on Server

```bash
# Create app directory
sudo mkdir -p /opt/beast-movies
sudo chown $USER:$USER /opt/beast-movies

# Clone repository
cd /opt/beast-movies
git clone https://github.com/YOUR_USERNAME/beast-movies.git .
```

### 3. Create Environment Files

On your server, create `/opt/beast-movies/backend/.env`:

```env
DATABASE_URL=postgresql://beastuser:beastpass123@postgres:5432/beastmovies
JWT_SECRET=your-production-secret-key-change-this
PORT=3001
BCRYPT_ROUNDS=10
NODE_ENV=production
```

### 4. Update docker-compose.yml for Production

Make sure to use the Docker Hub image in `docker-compose.yml`:

```yaml
services:
  backend:
    image: YOUR_DOCKER_USERNAME/beast-movies-backend:latest
    # ... rest of config
```

### 5. Set Up Nginx (Optional)

If you want to expose the app on port 80/443:

```bash
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/beast-movies
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/beast-movies /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## How It Works

### Automatic Deployment Flow

1. **Push to `main` branch** → Triggers GitHub Actions
2. **Build backend Docker image** → Optimized multi-stage build
3. **Push to Docker Hub** → Tagged with `latest` and commit SHA
4. **SSH to server** → Connects to your production server
5. **Pull latest code** → Updates from GitHub
6. **Pull Docker images** → Downloads new images from Docker Hub
7. **Restart containers** → `docker-compose up -d --force-recreate`
8. **Cleanup** → Removes old unused images

### Manual Deployment

If you need to deploy manually:

```bash
# On your server
cd /opt/beast-movies
git pull origin main
docker-compose pull
docker-compose up -d --force-recreate
```

## Monitoring

### Check logs

```bash
# Backend logs
docker-compose logs -f backend

# PostgreSQL logs
docker-compose logs -f postgres

# All services
docker-compose logs -f
```

### Check running containers

```bash
docker-compose ps
```

### Check database

```bash
docker-compose exec postgres psql -U beastuser -d beastmovies
```

## Troubleshooting

### Deployment fails

1. Check GitHub Actions logs in your repository
2. Verify all secrets are correctly set
3. Ensure SSH key has no passphrase
4. Check server has enough disk space: `df -h`

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down -v
docker-compose up -d
```

### Database connection fails

1. Verify PostgreSQL is running: `docker-compose ps`
2. Check environment variables in `.env`
3. Verify migrations ran: Check `/docker-entrypoint-initdb.d/`

## Security Notes

- Change all default passwords in production
- Use strong JWT_SECRET (generate with `openssl rand -base64 64`)
- Set up firewall rules to only allow necessary ports
- Consider using SSL/TLS with Let's Encrypt
- Keep Docker and system packages updated
