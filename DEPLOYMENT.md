# EC2 Deployment Guide

This guide explains how to deploy the imumz-frontend application to an AWS EC2 instance.

## Prerequisites

1. **AWS Account** with EC2 access
2. **EC2 Instance** (recommended: Ubuntu 22.04 LTS, t2.medium or larger)
3. **Security Group** configured to allow:
   - SSH (port 22) from your IP
   - HTTP (port 80) from anywhere (0.0.0.0/0)
   - HTTPS (port 443) from anywhere (0.0.0.0/0)
   - Application port (default 5000) from anywhere (or just from load balancer)
4. **Domain name** (optional, for production)
5. **SSL Certificate** (optional, for HTTPS)

## Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 22.04 LTS**
3. Select instance type: **t2.medium** (minimum) or **t3.medium** (recommended)
4. Configure security group:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere
   - Custom TCP (5000) from anywhere (or restrict to load balancer)
5. Create or select a key pair for SSH access
6. Launch instance

## Step 2: Connect to EC2 Instance

```bash
# Replace with your key file and instance IP
ssh -i your-key.pem ubuntu@your-ec2-ip-address
```

## Step 3: Install Dependencies

### Update system packages
```bash
sudo apt update
sudo apt upgrade -y
```

### Install Node.js (using NodeSource repository)
```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

### Install Git
```bash
sudo apt install -y git
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Install Nginx (Reverse Proxy)
```bash
sudo apt install -y nginx
```

## Step 4: Clone and Setup Application

```bash
# Clone your repository
cd /home/ubuntu
git clone <your-repository-url> imumz-frontend
cd imumz-frontend

# Install dependencies
npm install

# Build the application
npm run build
```

## Step 5: Configure Environment Variables

Create a `.env` file in the project root:

```bash
nano .env
```

Add the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Backend API Configuration
BACKEND_API_URL=http://13.232.37.184:8008

# Database (if using database)
# DATABASE_URL=postgresql://user:password@host:port/database

# Optional: Session Secret (generate a random string)
# SESSION_SECRET=your-random-secret-key-here
```

Generate a session secret:
```bash
openssl rand -base64 32
```

## Step 6: Configure Nginx as Reverse Proxy

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/imumz-frontend
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 IP

    # Increase body size limit for file uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/imumz-frontend /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Step 7: Setup PM2 for Process Management

Create a PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

Add the following:

```javascript
module.exports = {
  apps: [{
    name: 'imumz-frontend',
    script: 'dist/index.cjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false
  }]
};
```

Create logs directory:

```bash
mkdir -p logs
```

Start the application with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable PM2 on system startup
```

## Step 8: Setup SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 9: Configure Firewall (UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

## Step 10: Verify Deployment

1. **Check application status:**
   ```bash
   pm2 status
   pm2 logs imumz-frontend
   ```

2. **Check Nginx status:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Test the application:**
   - Open browser: `http://your-ec2-ip` or `http://your-domain.com`
   - Verify the application loads correctly

## Step 11: Setup Auto-Deployment (Optional)

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/imumz-frontend
            git pull
            npm install
            npm run build
            pm2 restart imumz-frontend
```

Add secrets in GitHub repository settings:
- `EC2_HOST`: Your EC2 instance IP or domain
- `EC2_SSH_KEY`: Your private SSH key

### Manual Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
cd /home/ubuntu/imumz-frontend
git pull
npm install
npm run build
pm2 restart imumz-frontend
```

Make it executable:
```bash
chmod +x deploy.sh
```

## Monitoring and Maintenance

### View Application Logs
```bash
pm2 logs imumz-frontend
pm2 logs imumz-frontend --lines 100  # Last 100 lines
```

### Monitor Application
```bash
pm2 monit
```

### Restart Application
```bash
pm2 restart imumz-frontend
```

### Stop Application
```bash
pm2 stop imumz-frontend
```

### Update Application
```bash
cd /home/ubuntu/imumz-frontend
git pull
npm install
npm run build
pm2 restart imumz-frontend
```

## Troubleshooting

### Application not starting
1. Check PM2 logs: `pm2 logs imumz-frontend`
2. Check if port 5000 is in use: `sudo lsof -i :5000`
3. Verify environment variables: `cat .env`
4. Check build output: `ls -la dist/`

### Nginx 502 Bad Gateway
1. Check if application is running: `pm2 status`
2. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify proxy_pass URL matches application port

### High Memory Usage
1. Monitor with: `pm2 monit`
2. Adjust `max_memory_restart` in `ecosystem.config.js`
3. Consider upgrading instance type

### SSL Certificate Issues
1. Check certificate status: `sudo certbot certificates`
2. Renew manually: `sudo certbot renew`
3. Check Nginx SSL configuration

## Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use SSH keys only** (disable password authentication)

3. **Configure fail2ban** to prevent brute force attacks:
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   ```

4. **Regular backups** of application data

5. **Monitor logs** for suspicious activity

6. **Use environment variables** for sensitive data (never commit secrets)

7. **Enable CloudWatch** for monitoring (optional)

## Scaling Considerations

### Horizontal Scaling (Multiple Instances)
1. Use **Application Load Balancer (ALB)** in front of multiple EC2 instances
2. Configure health checks
3. Update Nginx to use ALB as upstream

### Vertical Scaling
1. Upgrade EC2 instance type (t3.medium → t3.large → t3.xlarge)
2. Monitor CPU and memory usage

### Database
- Consider using **RDS** for PostgreSQL
- Use connection pooling
- Enable read replicas for high traffic

## Cost Optimization

1. **Use Reserved Instances** for predictable workloads
2. **Use Spot Instances** for development/staging
3. **Enable CloudWatch** to monitor and optimize
4. **Use S3** for static assets (if applicable)
5. **Enable CloudFront** CDN for global distribution

## Backup Strategy

1. **Application code:** Git repository
2. **Database:** Regular automated backups (if using database)
3. **Environment variables:** Store securely (AWS Secrets Manager)
4. **PM2 configuration:** Version control

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Support

For issues or questions:
1. Check application logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Review this deployment guide
4. Check application documentation

