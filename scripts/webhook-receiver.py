#!/usr/bin/env python3
"""
GitHub Webhook Receiver for BookAI Auto-Deploy
Run this on VPS to listen for GitHub push events and auto-deploy
"""
import os
import subprocess
import hmac
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "your-secret-key-change-this")
DEPLOY_SCRIPT = "/var/www/bookai.asenaytech.com/scripts/vps-auto-deploy.sh"
LOG_FILE = "/var/log/bookai-webhook.log"

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        # Verify webhook signature (optional but recommended)
        signature = self.headers.get('X-Hub-Signature-256', '')
        if signature:
            expected = 'sha256=' + hmac.new(
                WEBHOOK_SECRET.encode(),
                body,
                hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(signature, expected):
                self.send_response(401)
                self.end_headers()
                return
        
        try:
            event = json.loads(body.decode())
            if event.get('ref') == 'refs/heads/main':
                # Trigger deploy
                with open(LOG_FILE, 'a') as f:
                    f.write(f"[{os.popen('date').read().strip()}] Push detected, triggering deploy...\n")
                
                subprocess.Popen(['bash', DEPLOY_SCRIPT], 
                               stdout=open(LOG_FILE, 'a'),
                               stderr=subprocess.STDOUT)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "deploying"}')
            else:
                self.send_response(200)
                self.end_headers()
        except Exception as e:
            with open(LOG_FILE, 'a') as f:
                f.write(f"Error: {str(e)}\n")
            self.send_response(500)
            self.end_headers()
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'BookAI Webhook Receiver - Running')

if __name__ == '__main__':
    port = int(os.getenv('WEBHOOK_PORT', 9000))
    server = HTTPServer(('0.0.0.0', port), WebhookHandler)
    print(f"Webhook receiver listening on port {port}")
    server.serve_forever()

