# UNRE GE Request System - Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Database Setup (Supabase)

- [ ] Create Supabase project
- [ ] Execute database schema from `.same/database-schema.sql`
- [ ] Verify all tables created (30+ tables)
- [ ] Verify triggers and functions working
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create initial admin user
- [ ] Insert default roles and expense types

### 2. Environment Configuration

- [ ] Set up production environment variables
- [ ] Configure Supabase connection
- [ ] Set up file storage bucket
- [ ] Configure email service (optional)
- [ ] Set PGAS integration parameters

### 3. Security

- [ ] Review and test RLS policies
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS settings
- [ ] Set up authentication rules
- [ ] Enable audit logging

---

## 🚀 Deployment Options

### Option 1: Netlify (Recommended for Quick Start)

**Advantages:**
- Fast deployment
- Automatic HTTPS
- Easy environment variable management
- Built-in CDN

**Steps:**

1. **Build the Project**
```bash
cd unre-ge-system
bun install
bun run build
```

2. **Deploy to Netlify**
   - Option A: Use Netlify CLI
     ```bash
     npm install -g netlify-cli
     netlify login
     netlify deploy --prod
     ```

   - Option B: Connect GitHub repository
     - Push code to GitHub
     - Connect repository in Netlify dashboard
     - Configure build settings:
       - Build command: `bun run build`
       - Publish directory: `.next`

3. **Configure Environment Variables**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add all variables from `.env.example`

4. **Custom Domain (Optional)**
   - Add custom domain in Netlify dashboard
   - Update DNS records as instructed

---

### Option 2: Vercel

**Advantages:**
- Optimized for Next.js
- Serverless functions
- Global edge network

**Steps:**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd unre-ge-system
vercel --prod
```

3. **Configure Environment Variables**
   - Add via Vercel dashboard or CLI
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   # ... add all other variables
   ```

---

### Option 3: On-Premise Server (UNRE Infrastructure)

**Advantages:**
- Full control over infrastructure
- Data stays within UNRE network
- Integration with existing systems

**Requirements:**
- Ubuntu Server 22.04 LTS (or similar)
- Node.js 18+ or Bun
- PostgreSQL 14+
- Nginx
- SSL certificate

**Installation Steps:**

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Or install Bun (recommended)
curl -fsSL https://bun.sh/install | bash

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx
```

#### 2. Database Setup

```bash
# Create database
sudo -u postgres createdb unre_ge_system

# Create database user
sudo -u postgres psql
postgres=# CREATE USER unre_admin WITH PASSWORD 'secure_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE unre_ge_system TO unre_admin;
postgres=# \q

# Import schema
sudo -u postgres psql unre_ge_system < .same/database-schema.sql
```

#### 3. Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/unre-ge-system
sudo chown $USER:$USER /var/www/unre-ge-system

# Clone or copy application
cd /var/www/unre-ge-system
# Copy your built application here

# Install dependencies
bun install

# Build application
bun run build

# Create .env.local file
nano .env.local
# Add all environment variables
```

#### 4. PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'unre-ge-system',
    script: 'bun',
    args: 'run start',
    cwd: '/var/www/unre-ge-system',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up auto-start on boot
pm2 startup
```

#### 5. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/unre-ge-system
```

```nginx
server {
    listen 80;
    server_name ge.unre.ac.pg;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ge.unre.ac.pg;

    ssl_certificate /etc/ssl/certs/unre-ge.crt;
    ssl_certificate_key /etc/ssl/private/unre-ge.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/unre-ge-system /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d ge.unre.ac.pg

# Auto-renewal is set up automatically
```

---

## 🔧 Post-Deployment Configuration

### 1. Initial Data Setup

```sql
-- Create first admin user
INSERT INTO user_profiles (id, email, full_name, employee_id, is_active)
VALUES (
  'uuid-from-supabase-auth',
  'admin@unre.ac.pg',
  'System Administrator',
  'EMP001',
  true
);

-- Assign System Admin role
INSERT INTO user_roles (user_id, role_id, is_active)
SELECT 'uuid-from-supabase-auth', id, true
FROM roles WHERE name = 'System Admin';

-- Create sample cost centres
INSERT INTO cost_centres (code, name, type, is_active) VALUES
  ('AGR', 'School of Agriculture', 'School', true),
  ('SCI', 'Faculty of Science', 'Faculty', true),
  ('NRS', 'School of Natural Resources', 'School', true),
  ('ADM', 'Administration', 'Division', true);
```

### 2. Configure PGAS Integration

1. Export initial budget data from PGAS
2. Navigate to Dashboard → PGAS Sync
3. Upload CSV file with budget lines
4. Verify all budget lines imported correctly
5. Set up regular sync schedule

### 3. User Training

- Schedule training sessions for:
  - Staff/Requestors
  - HODs and Deans
  - Bursary staff
  - System administrators

### 4. Testing Checklist

- [ ] User can register/login
- [ ] Create sample GE request
- [ ] Test approval workflow
- [ ] Verify budget validation
- [ ] Upload documents
- [ ] Test PGAS import
- [ ] Generate reports
- [ ] Test email notifications (if enabled)
- [ ] Verify audit trail
- [ ] Test payment processing

---

## 📊 Monitoring & Maintenance

### Daily Tasks
- [ ] Check application uptime
- [ ] Monitor error logs
- [ ] Review pending approvals

### Weekly Tasks
- [ ] Sync PGAS data
- [ ] Review budget utilization
- [ ] Check for system updates
- [ ] Backup database

### Monthly Tasks
- [ ] Generate usage reports
- [ ] Review user access
- [ ] System performance analysis
- [ ] Update documentation

---

## 🔄 Backup Strategy

### Database Backups

```bash
# Daily automated backup
0 2 * * * /usr/bin/pg_dump unre_ge_system > /backups/unre_ge_$(date +\%Y\%m\%d).sql

# Weekly full backup
0 3 * * 0 /usr/bin/pg_dump -Fc unre_ge_system > /backups/weekly/unre_ge_$(date +\%Y\%m\%d).dump

# Retention policy: Keep daily backups for 7 days, weekly for 4 weeks
```

### File Storage Backups

If using Supabase Storage:
- Automatic backups included
- Configure bucket policies for retention

If using local storage:
```bash
# Daily backup of uploads
0 2 * * * rsync -avz /var/www/unre-ge-system/uploads/ /backups/uploads/
```

---

## 🚨 Troubleshooting

### Common Issues

**Application won't start**
- Check environment variables are set
- Verify database connection
- Check PM2 logs: `pm2 logs unre-ge-system`

**Database connection errors**
- Verify PostgreSQL is running
- Check firewall rules
- Verify credentials in .env.local

**PGAS sync fails**
- Check CSV format matches template
- Verify cost centre codes exist
- Check file encoding (UTF-8)

**Users can't login**
- Verify Supabase Auth is configured
- Check RLS policies
- Verify user exists in database

---

## 📞 Support Contacts

**Technical Issues:**
- Email: itsupport@unre.ac.pg
- Phone: +675 XXX XXXX

**System Administration:**
- Email: admin@unre.ac.pg

**Bursary Department:**
- Email: bursary@unre.ac.pg

---

## 📝 Deployment Checklist

### Pre-Production
- [ ] All tests passing
- [ ] Security review completed
- [ ] Database schema finalized
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Backup strategy in place

### Go-Live
- [ ] Deploy application
- [ ] Import initial data
- [ ] Create admin users
- [ ] Test all functionality
- [ ] Train users
- [ ] Monitor for issues

### Post-Production
- [ ] Document any issues
- [ ] Schedule regular maintenance
- [ ] Set up monitoring alerts
- [ ] Plan for future enhancements

---

**Deployment Prepared By**: Same.New Development Team
**Last Updated**: January 2025
**Version**: 1.0.0
