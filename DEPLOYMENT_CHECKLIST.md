# Deployment Checklist

Use this checklist before running `wrangler deploy`.

## Pre-Deployment

### Code Quality
- [ ] All TypeScript files compile without errors
- [ ] No linter warnings in critical files
- [ ] All TODO comments resolved or documented
- [ ] Local testing passes: `npm run dev` works

### Configuration Files
- [ ] `wrangler.toml` has correct worker name
- [ ] Static assets directory configured: `[assets] directory = "./public"`
- [ ] AI binding configured: `[ai] binding = "AI"`
- [ ] Durable Object configured: `USER_MEMORY`
- [ ] Workflow configured: `SYLLABUS_WORKFLOW`

### Dependencies
- [ ] `package.json` has all required dependencies
- [ ] `node_modules/` installed: `npm install`
- [ ] Wrangler version 3.90.0 or higher: `npx wrangler --version`

### Authentication
- [ ] Logged into Cloudflare: `npm run whoami`
- [ ] Account has Workers AI access (Paid plan $5/mo)

### Static Assets
- [ ] `public/index.html` exists and is valid HTML
- [ ] `public/style.css` exists
- [ ] `public/script.js` exists
- [ ] No broken references in HTML to CSS/JS files

### Code Files
- [ ] `src/worker.ts` exports `UserMemory` and `SyllabusWorkflow`
- [ ] `src/ai.ts` exports `runLLM` function
- [ ] `src/durable-objects/UserMemory.ts` implements required methods
- [ ] `src/workflows/workflow.ts` exports workflow functions

## Deployment

### Execute Deployment
```bash
npm run deploy
```

### Verify Output
- [ ] No errors during upload
- [ ] Deployment URL received
- [ ] Copy deployment URL for testing

## Post-Deployment

### Basic Testing
- [ ] Open deployment URL in browser
- [ ] Static files load correctly (HTML, CSS, JS)
- [ ] No console errors in browser DevTools

### API Testing
```bash
export WORKER_URL="YOUR_DEPLOYMENT_URL_HERE"

# Test CORS
curl -I $WORKER_URL

# Test upload endpoint
curl -X POST $WORKER_URL/upload-syllabus \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","syllabusText":"Test"}'
```

- [ ] Upload endpoint returns 200 or valid response
- [ ] Response includes `success: true` or valid error
- [ ] Durable Object stores data (check logs)

### Functional Testing
- [ ] Upload a test syllabus through UI
- [ ] Submit preferences form
- [ ] Generate a study plan
- [ ] Send a chat message
- [ ] Verify plan updates correctly

### Monitoring
- [ ] Start tail logs: `npm run tail`
- [ ] Perform actions and watch logs
- [ ] No unexpected errors
- [ ] Console.log statements appear

## Documentation Updates

### Update README.md
- [ ] Replace placeholder URL with actual deployment URL
- [ ] Update "Live Demo" link at top
- [ ] Update "Live Deployment" section at bottom

### Update Repository
- [ ] Commit all changes: `git add . && git commit -m "Deploy to production"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Add deployment URL to repository description
- [ ] Create a release tag: `git tag v1.0.0 && git push --tags`

## Troubleshooting

If deployment fails, check:

### Common Issues

**"Unauthorized" error:**
```bash
npm run login
```

**Durable Object errors:**
- Ensure migrations are in `wrangler.toml`
- Check class names match exactly

**AI binding errors:**
- Verify Workers AI is enabled on your account
- Check you have a Paid plan ($5/month)
- Go to: https://dash.cloudflare.com/workers-ai

**Static assets not loading:**
- Verify `[assets] directory = "./public"` in `wrangler.toml`
- Check files exist in `public/` directory
- Redeploy

**500 errors:**
```bash
npm run tail
```
Check logs for detailed error messages.

## Production Readiness

Before announcing to users:

- [ ] All features tested thoroughly
- [ ] Error handling works correctly
- [ ] Performance is acceptable (< 1s response times)
- [ ] CORS headers allow frontend access
- [ ] Rate limiting considered (if needed)
- [ ] Usage alerts set up in Cloudflare Dashboard
- [ ] Documentation is complete and accurate
- [ ] Support channels identified (GitHub Issues, etc.)

## Rollback Plan

If issues occur in production:

```bash
# View recent deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback [deployment-id]
```

Keep previous deployment ID handy:
- Deployment ID: `_________________`
- Deployed at: `_________________`

## Success Criteria

Deployment is successful when:

✅ Worker is accessible at deployment URL
✅ Static files (HTML/CSS/JS) load correctly  
✅ All API endpoints respond correctly
✅ Durable Objects persist data
✅ AI responses are generated successfully
✅ Chat history is maintained across sessions
✅ No errors in tail logs during normal usage
✅ README updated with live URL

---

**Deployment Date:** `_________________`
**Deployed By:** `_________________`
**Deployment URL:** `_________________`
**Notes:** `_________________`

