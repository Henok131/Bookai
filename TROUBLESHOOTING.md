# BookAI Troubleshooting Guide

## Port 80 Already in Use

If you see `Error: address already in use` for port 80, it means another service is using it.

### Check what's using port 80:

```bash
# Check what process is using port 80
sudo lsof -i :80
# or
sudo netstat -tulpn | grep :80
# or
sudo ss -tulpn | grep :80
```

### Solutions:

#### Option 1: Stop the existing service (if it's not needed)

```bash
# If it's Apache
sudo systemctl stop apache2
sudo systemctl disable apache2

# If it's another Nginx
sudo systemctl stop nginx
sudo systemctl disable nginx
```

#### Option 2: Change Docker Compose to use a different port

Edit `docker-compose.yml` and change:
```yaml
nginx:
  ports:
    - "8080:80"  # Use port 8080 instead of 80
```

Then access via: `http://your-domain:8080`

#### Option 3: Use the existing web server as reverse proxy

Configure your existing web server (Apache/Nginx) to proxy to Docker containers:
- `/api` → `http://localhost:8080`
- `/ocr` → `http://localhost:8000`
- `/` → `http://localhost:5173`

## Other Common Issues

### Container keeps restarting

```bash
# Check logs
docker compose logs <service-name>

# Check container status
docker compose ps
```

### Health check failures

```bash
# Check health status
docker inspect <container-name> | grep -A 10 Health

# Test health endpoint manually
curl http://localhost:8080/health
curl http://localhost:8000/health
```

### Database connection issues

```bash
# Check database logs
docker compose logs db

# Test database connection
docker compose exec db psql -U bookai -d bookai
```

