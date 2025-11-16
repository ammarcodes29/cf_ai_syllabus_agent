# Deployment Guide

Complete guide for deploying cf_ai_syllabus_agent to Cloudflare Workers.

## Prerequisites

1. **Cloudflare Account**
   - Sign up at https://dash.cloudflare.com/sign-up
   - Free tier is sufficient for development

2. **Wrangler CLI**
   - Already installed via npm in this project
   - Version 3.90.0 or higher

3. **Node.js**
   - Version 18 or higher

## Quick Start Deployment

```bash
# 1. Install dependencies
npm install

# 2. Login to Cloudflare
npm run login

# 3. Deploy
npm run deploy
```

## Detailed Deployment Steps

### Step 1: Authentication

```bash
npm run login
```

This opens your browser to authenticate with Cloudflare. After successful login, verify:

```bash
npm run whoami
```

You should see your Cloudflare account email.

### Step 2: Configure (Optional)

The `wrangler.toml` is already configured with:
- AI binding for Workers AI (Llama 3.3)
- Durable Objects for UserMemory
- Workflows for SyllabusWorkflow
- Static assets from `public/` directory

**Optional customizations:**

```toml
# Change worker name
name = "my-custom-name"

# Add custom domain
routes = [
  { pattern = "syllabus.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### Step 3: Deploy

```bash
npm run deploy
```

Expected output:
```
Total Upload: ~50 KiB
Uploaded cf-ai-syllabus-agent (2.5 sec)
Published cf-ai-syllabus-agent (0.8 sec)
  https://cf-ai-syllabus-agent.your-subdomain.workers.dev
```

**Copy the deployment URL!** You'll need it for testing.

### Step 4: Verify Deployment

**Test via Browser:**
1. Open `https://cf-ai-syllabus-agent.your-subdomain.workers.dev`
2. You should see the upload UI
3. Try uploading a test syllabus

**Test via API:**
```bash
# Set your deployment URL
export WORKER_URL="https://cf-ai-syllabus-agent.your-subdomain.workers.dev"

# Test upload endpoint
curl -X POST $WORKER_URL/upload-syllabus \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_001",
    "syllabusText": "Course: Introduction to AI\nAssignment 1: Due 2024-02-15\nMidterm: 2024-03-20"
  }'

# Expected response:
# {"success":true,"syllabusJson":{...},"message":"Syllabus uploaded and processed successfully"}
```

### Step 5: Monitor (Optional)

View real-time logs:
```bash
npm run tail
```

This shows all requests, console.log outputs, and errors from your deployed Worker.

## Troubleshooting

### Issue: "Unauthorized" error

**Solution:** Re-authenticate
```bash
npm run login
```

### Issue: Durable Object not found

**Solution:** Ensure migrations are applied. They run automatically on first deploy, but you can check:
```bash
npx wrangler deployments list
```

### Issue: AI binding error

**Solution:** Workers AI is available on Workers Paid plan ($5/month). Ensure your account has:
- Workers Paid plan enabled
- AI models enabled in dashboard

Check at: https://dash.cloudflare.com/workers-ai

### Issue: 500 errors on requests

**Solution:** Check logs
```bash
npm run tail
```

Look for error messages in the logs to identify the issue.

### Issue: Static files not loading

**Solution:** Verify assets configuration in `wrangler.toml`:
```toml
[assets]
directory = "./public"
```

Redeploy:
```bash
npm run deploy
```

## Advanced Configuration

### Custom Domain

1. Add to `wrangler.toml`:
```toml
routes = [
  { pattern = "syllabus.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

2. Deploy:
```bash
npm run deploy
```

3. Configure DNS in Cloudflare Dashboard:
   - Go to your domain's DNS settings
   - The route will be automatically configured

### Environment Variables/Secrets

If you need to add secrets:

```bash
# Set a secret
npx wrangler secret put MY_SECRET_KEY

# Access in code
env.MY_SECRET_KEY
```

### Multiple Environments

Create separate configs:

**wrangler.dev.toml:**
```toml
name = "cf-ai-syllabus-agent-dev"
# ... other config
```

**Deploy to dev:**
```bash
npx wrangler deploy --config wrangler.dev.toml
```

## Production Checklist

Before going to production:

- [ ] Test all endpoints thoroughly
- [ ] Set up error monitoring
- [ ] Configure custom domain (optional)
- [ ] Set up usage alerts in Cloudflare Dashboard
- [ ] Review Workers AI usage limits
- [ ] Test with real syllabus documents
- [ ] Verify Durable Objects are working
- [ ] Check WebSocket functionality (if using)
- [ ] Update README with actual deployment URL

## Updating Deployment

To update your deployed Worker:

```bash
# Make your code changes
git add .
git commit -m "Your changes"

# Deploy updated version
npm run deploy
```

Changes are live immediately after deployment!

## Rollback

If you need to rollback to a previous version:

```bash
# View recent deployments
npx wrangler deployments list

# Rollback to specific deployment
npx wrangler rollback [deployment-id]
```

## Cost Estimation

**Free Tier Includes:**
- 100,000 requests/day
- 10ms CPU time per request
- Durable Objects: First 1M reads/writes free

**Workers Paid Plan ($5/month):**
- 10M requests/month included
- Workers AI access
- Additional requests: $0.50/million

**Typical costs for this app:**
- Development: Free tier sufficient
- Production (< 1000 users): $5-10/month
- High traffic: Based on usage

Monitor costs at: https://dash.cloudflare.com/billing

## Resources

- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Workflows](https://developers.cloudflare.com/workflows/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## Support

Issues? Check:
1. [Cloudflare Workers Discord](https://discord.gg/cloudflaredev)
2. [GitHub Issues](https://github.com/yourusername/cf_ai_syllabus_agent/issues)
3. [Cloudflare Community](https://community.cloudflare.com/)

