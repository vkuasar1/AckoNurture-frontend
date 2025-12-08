# EC2 Deployment Guide

This guide explains how to deploy the imumz-frontend application to an AWS EC2 instance.

## Prerequisites

1. **AWS Account** with EC2 access
2. **EC2 Instance** running Ubuntu 20.04 LTS or later (or Amazon Linux 2)
3. **Security Group** configured to allow:
   - Port 22 (SSH)
   - Port 80 (HTTP) - if using HTTP
   - Port 443 (HTTPS) - if using HTTPS
   - Port 5000 (or your chosen port) - for the application
4. **Elastic IP** (optional but recommended for static IP)
5. **Domain name** (optional, for custom domain)

## Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose an AMI:
   - **Ubuntu Server 20.04 LTS** (recommended)
   - Or Amazon Linux 2
3. Choose instance type:
   - **t2.micro** (free tier eligible) - for testing
   - **t2.small** or **t3.small** - for production
4. Configure security group:
   - SSH (22) from your IP
   - HTTP (80) from anywhere (0.0.0.0/0)
   - HTTPS (443) from anywhere (0.0.0.0/0)
   - Custom TCP (5000) from anywhere (0.0.0.0/0) - adjust port as needed
5. Create or select a key pair for SSH access
6. Launch the instance

## Step 2: Connect to EC2 Instance

```bash
# Replace with your key file and instance IP
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
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
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

### Install Git
```bash
sudo apt install git -y
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Install Nginx (for reverse proxy)
```bash
sudo apt install nginx -y
```

## Step 4: Clone and Setup Application

```bash
# Clone your repository (replace with your repo URL)
cd /home/ubuntu
git clone <YOUR_REPO_URL> imumz-frontend
cd imumz-frontend

# Install dependencies
npm install

# Build the application
npm run build
```

## Step 5: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cd /home/ubuntu/imumz-frontend
nano .env
```

Add the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Backend API Configuration
BACKEND_API_URL=http://13.232.37.184:8008

# Optional: If you have a database
# DATABASE_URL=postgresql://user:password@host:port/database
```

Save and exit (Ctrl+X, then Y, then Enter)

## Step 6: Start Application with PM2

```bash
# Start the application
pm2 start dist/index.cjs --name imumz-frontend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown (copy and run the sudo command)
```

### PM2 Useful Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs imumz-frontend

# Restart application
pm2 restart imumz-frontend

# Stop application
pm2 stop imumz-frontend

# Monitor
pm2 monit
```

## Step 7: Configure Nginx as Reverse Proxy

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/imumz-frontend
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or use EC2 public IP

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
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/imumz-frontend /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

## Step 8: Setup SSL with Let's Encrypt (Optional but Recommended)

If you have a domain name:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will automatically configure Nginx and renew certificates
```

## Step 9: Configure Firewall (UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 10: Verify Deployment

1. **Check application is running**:
   ```bash
   pm2 status
   curl http://localhost:5000
   ```

2. **Check Nginx is running**:
   ```bash
   sudo systemctl status nginx
   ```

3. **Access from browser**:
   - If using domain: `http://your-domain.com`
   - If using IP: `http://<EC2_PUBLIC_IP>`

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs imumz-frontend

# Check if port is in use
sudo lsof -i :5000

# Check Node.js version
node --version
```

### Nginx 502 Bad Gateway

```bash
# Check if application is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify proxy_pass URL matches your application port
sudo nano /etc/nginx/sites-available/imumz-frontend
```

### Application crashes on restart

```bash
# Check system logs
journalctl -u pm2-ubuntu -n 50

# Restart PM2
pm2 restart all
```

### Out of memory issues

```bash
# Check memory usage
free -h

# If needed, add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Updating the Application

```bash
# SSH into EC2
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>

# Navigate to application directory
cd /home/ubuntu/imumz-frontend

# Pull latest changes
git pull

# Install new dependencies (if any)
npm install

# Rebuild application
npm run build

# Restart application
pm2 restart imumz-frontend

# Check status
pm2 status
pm2 logs imumz-frontend
```

## Monitoring

### Setup CloudWatch (Optional)

1. Install CloudWatch agent:
   ```bash
   wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
   sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
   ```

2. Configure CloudWatch agent (follow AWS documentation)

### Setup Application Monitoring

Consider using:
- **PM2 Plus** (free tier available)
- **New Relic** (free tier available)
- **Datadog** (paid)

## Security Best Practices

1. **Keep system updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use SSH keys only** (disable password authentication)

3. **Configure fail2ban**:
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

4. **Regular backups**: Set up automated backups of your application data

5. **Use environment variables**: Never commit secrets to git

6. **Enable AWS Security Groups**: Restrict access to necessary ports only

## Cost Optimization

1. **Use t2.micro/t3.micro** for development/testing
2. **Stop instance when not in use** (for development)
3. **Use Reserved Instances** for production (1-3 year commitment)
4. **Enable CloudWatch alarms** to monitor costs

## Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Quick Reference Commands

```bash
# Application
pm2 start dist/index.cjs --name imumz-frontend
pm2 restart imumz-frontend
pm2 logs imumz-frontend
pm2 status

# Nginx
sudo systemctl restart nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# System
sudo apt update && sudo apt upgrade -y
free -h
df -h
```

