# 🚀 AI Nexus - Deployment Guide

This guide covers deploying AI Nexus to various platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Vercel Deployment (Frontend)](#vercel-deployment)
- [Render Deployment (Backend)](#render-deployment)
- [Railway Deployment](#railway-deployment)
- [AWS EC2 Deployment](#aws-ec2-deployment)
- [DigitalOcean Deployment](#digitalocean-deployment)
- [Production Checklist](#production-checklist)

## Prerequisites

Before deploying, ensure you have:

- [ ] MongoDB database (MongoDB Atlas recommended)
- [ ] Redis instance (Redis Cloud, AWS ElastiCache, or similar)
- [ ] OpenAI API key
- [ ] Cloudinary account (for image storage)
- [ ] SMTP email service
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (Let's Encrypt or similar)

## Environment Configuration

Create `.env` files based on `.env.example`:

### Frontend (.env)
```env
VITE_API_URL=https://your-api-domain.com/api/v1
```

### Backend (server/.env)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_nexus
REDIS_URL=redis://username:password@redis-server:6379
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=sk-your-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://your-frontend-domain.com
```

## Docker Deployment

### 1. Build Images

```bash
# Build frontend
docker build -f Dockerfile.frontend -t ai-nexus-frontend .

# Build backend
docker build -f Dockerfile.backend -t ai-nexus-backend .
```

### 2. Using Docker Compose

```bash
# Copy and configure environment
cp .env.example .env
cp server/.env.example server/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Production Docker Compose

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

## Vercel Deployment

### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Method 2: GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables:
   - `VITE_API_URL`: Your backend API URL
7. Deploy!

### Vercel Environment Variables

```
VITE_API_URL=https://your-backend-url.com/api/v1
```

## Render Deployment

### Backend Deployment

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: ai-nexus-backend
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Choose based on your needs

5. Add Environment Variables:
```
NODE_ENV=production
MONGO_URI=<your-mongodb-uri>
REDIS_URL=<your-redis-url>
JWT_SECRET=<your-secret>
OPENAI_API_KEY=<your-key>
CLOUDINARY_CLOUD_NAME=<your-cloud>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-password>
FRONTEND_URL=<your-frontend-url>
```

6. Click "Create Web Service"

### MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for Render)
5. Get connection string
6. Replace `<password>` with your database user password

### Redis Cloud Setup

1. Go to [redis.com/try-free](https://redis.com/try-free/)
2. Create a free database
3. Get connection string
4. Add to `REDIS_URL` environment variable

## Railway Deployment

### Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project or create new
railway link

# Deploy backend
cd server
railway up

# Deploy frontend
cd ..
railway up
```

### Using Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add services:
   - Backend (server directory)
   - Frontend (root directory)
   - MongoDB (from template)
   - Redis (from template)
6. Configure environment variables
7. Deploy!

## AWS EC2 Deployment

### 1. Launch EC2 Instance

```bash
# Create Ubuntu 22.04 LTS instance
# Choose t3.medium or larger
# Configure security group:
#   - SSH (22) from your IP
#   - HTTP (80) from anywhere
#   - HTTPS (443) from anywhere
#   - Custom TCP (5000) from anywhere
```

### 2. Connect and Setup

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Redis
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2
sudo npm install -g pm2
```

### 3. Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/ai-nexus.git
cd ai-nexus

# Install dependencies
npm install
cd server
npm install
cd ..

# Build frontend
npm run build

# Configure environment
cp .env.example .env
cp server/.env.example server/.env
# Edit .env files with your configuration

# Start backend with PM2
cd server
pm2 start server.js --name ai-nexus-backend
pm2 save
pm2 startup

# Serve frontend with Nginx
sudo cp dist/* /var/www/html/
```

### 4. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is setup automatically
```

## DigitalOcean Deployment

### Using App Platform

1. Go to [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
2. Click "Create App"
3. Connect GitHub repository
4. Configure components:
   - **Frontend**: Static Site
     - Build command: `npm run build`
     - Output directory: `dist`
   - **Backend**: Web Service
     - Source directory: `server`
     - Build command: `npm install`
     - Run command: `npm start`
5. Add managed databases:
   - MongoDB
   - Redis
6. Configure environment variables
7. Deploy!

### Using Droplet (Similar to EC2)

Follow AWS EC2 instructions above, using Ubuntu 22.04 droplet.

## Production Checklist

### Security

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (generate with `openssl rand -base64 64`)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup firewall rules
- [ ] Regular security updates
- [ ] Implement backup strategy

### Performance

- [ ] Enable Redis caching
- [ ] Configure CDN (Cloudinary for images)
- [ ] Optimize database indexes
- [ ] Enable gzip compression
- [ ] Minimize bundle sizes
- [ ] Setup monitoring (Datadog, New Relic, etc.)

### Monitoring

- [ ] Setup error tracking (Sentry)
- [ ] Configure log aggregation
- [ ] Setup uptime monitoring
- [ ] Configure alerts
- [ ] Setup analytics

### Backup

- [ ] Database backups (automated)
- [ ] File storage backups
- [ ] Configuration backups
- [ ] Disaster recovery plan

### Domain & DNS

- [ ] Configure A records
- [ ] Setup CNAME for www
- [ ] Configure MX records for email
- [ ] Setup SSL certificate

### Testing

- [ ] Test all API endpoints
- [ ] Test authentication flows
- [ ] Test file uploads
- [ ] Test real-time features
- [ ] Load testing
- [ ] Security testing

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check connection string
# Ensure IP is whitelisted in MongoDB Atlas
# Check username/password
```

**Redis Connection Failed**
```bash
# Check Redis is running
sudo systemctl status redis-server

# Test connection
redis-cli ping
```

**Port Already in Use**
```bash
# Find process using port
sudo lsof -i :5000

# Kill process
kill -9 <PID>
```

**Build Failed**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist .vite
npm run build
```

## Scaling

### Horizontal Scaling

- Use load balancer (Nginx, AWS ALB)
- Run multiple backend instances
- Use session store (Redis)
- Stateless architecture

### Vertical Scaling

- Upgrade server resources
- Optimize database queries
- Implement caching strategy
- Use CDN for static assets

### Database Scaling

- Enable MongoDB sharding
- Read replicas
- Connection pooling
- Query optimization

## Support

For deployment issues:
- Check logs: `pm2 logs ai-nexus-backend`
- Discord: [Join our community](https://discord.gg/ainexus)
- Email: support@ainexus.com
- GitHub Issues: [Report deployment issues](https://github.com/yourusername/ai-nexus/issues)

---

**Need help?** Join our [Discord community](https://discord.gg/ainexus) for support!
