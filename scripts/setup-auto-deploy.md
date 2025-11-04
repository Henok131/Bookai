# Auto-Deploy Setup for BookAI VPS

## Quick Setup (Recommended: Cron Polling)

### Step 1: Copy scripts to VPS

```bash
# On your VPS
cd /var/www/bookai.asenaytech.com
git pull origin main
chmod +x scripts/vps-auto-deploy.sh
```

### Step 2: Set up cron job (checks every 5 minutes)

```bash
# Edit crontab
crontab -e

# Add this line (check every 5 minutes for new commits)
*/5 * * * * cd /var/www/bookai.asenaytech.com && git fetch origin main && [ $(git rev-parse HEAD) != $(git rev-parse origin/main) ] && bash scripts/vps-auto-deploy.sh
```

### Step 3: Test manual deploy

```bash
bash /var/www/bookai.asenaytech.com/scripts/vps-auto-deploy.sh
```

---

## Alternative: GitHub Webhook (More Real-time)

### Step 1: Install Python dependencies

```bash
pip3 install flask
```

### Step 2: Set environment variable

```bash
export WEBHOOK_SECRET="your-secret-key-here"
```

### Step 3: Run webhook receiver (in background)

```bash
nohup python3 scripts/webhook-receiver.py > /dev/null 2>&1 &
```

### Step 4: Configure GitHub Webhook

1. Go to: https://github.com/Henok131/Bookai/settings/hooks
2. Click "Add webhook"
3. Payload URL: `http://your-vps-ip:9000` (or use ngrok for testing)
4. Content type: `application/json`
5. Secret: (same as WEBHOOK_SECRET)
6. Events: Just "push" event
7. Save

---

## Verify Auto-Deploy

```bash
# Check logs
tail -f /var/log/bookai-deploy.log

# Check webhook logs
tail -f /var/log/bookai-webhook.log
```

---

**After setup, when I push to GitHub, VPS will automatically deploy!**

