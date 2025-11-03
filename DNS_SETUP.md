# DNS Configuration for BookAI

## Current Issue

The domain `bookai.asenaytech.com` is currently pointing to Hostinger's default hosting, not your VPS (72.61.156.126).

## Solution: Point Domain to VPS

### Step 1: Access Your Domain DNS Settings

1. Log into your domain registrar (where you manage `asenaytech.com`)
2. Navigate to DNS Management / DNS Settings
3. Find the DNS records for `bookai.asenaytech.com` (or create a subdomain record)

### Step 2: Update DNS Records

You need to point the domain to your VPS IP: `72.61.156.126`

**Option A: A Record (Direct IP)**
```
Type: A
Name: bookai
Value: 72.61.156.126
TTL: 3600 (or 1 hour)
```

**Option B: CNAME (if using a subdomain)**
```
Type: CNAME
Name: bookai
Value: srv1057930.hostingervps.com (or your VPS hostname)
TTL: 3600
```

### Step 3: Verify DNS Propagation

After updating DNS, verify it points to your VPS:

```bash
# Check DNS resolution
nslookup bookai.asenaytech.com
# or
dig bookai.asenaytech.com

# Should return: 72.61.156.126
```

### Step 4: Test HTTP Access

Once DNS propagates (usually 5-60 minutes):

```bash
# Test via IP (should work immediately)
curl http://72.61.156.126/api/health

# Test via domain (after DNS propagates)
curl http://bookai.asenaytech.com/api/health
```

## HTTPS/SSL Setup (Next Step)

After DNS is configured, you'll need to set up SSL certificates:

1. Install Certbot on VPS
2. Configure Let's Encrypt for `bookai.asenaytech.com`
3. Update Nginx to listen on port 443 with SSL

## Current Status

- ✅ Docker containers are running and healthy
- ✅ Nginx is configured for `bookai.asenaytech.com`
- ⏳ DNS needs to point to VPS IP (72.61.156.126)
- ⏳ SSL/HTTPS needs to be configured

