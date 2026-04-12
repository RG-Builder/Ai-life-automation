# 🚀 LifePilot AI Deployment Guide

This guide provides step-by-step instructions to deploy the LifePilot AI application (React + Express + Firebase + OpenRouter) to **Railway**, which is highly recommended for full-stack Node.js applications.

---

## 1. Recommended Platform: Railway
**Why Railway?**
- **Monolith Friendly**: Handles Express + React static serving perfectly.
- **Automatic Deploys**: Connects directly to your GitHub repo.
- **Environment Management**: Simple UI for secrets.
- **Scalability**: Easy to upgrade as your user base grows.

### Setup Instructions:
1. Go to [Railway.app](https://railway.app/) and sign up with GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your `Ai-life-automation` repository.
4. Click **"Add Variables"** before the first deploy.

---

## 2. Environment Variables (.env.production)

Copy these into the Railway **Variables** tab. Do NOT commit these to GitHub.

| Variable | Description | How to Obtain |
| :--- | :--- | :--- |
| `NODE_ENV` | Set to `production` | Manual entry |
| `OPENROUTER_API_KEY` | Your OpenRouter API Key | [OpenRouter Keys](https://openrouter.ai/keys) |
| `OPENROUTER_PRIMARY_MODEL` | `google/gemini-2.0-flash-exp` | OpenRouter Docs |
| `OPENROUTER_FAST_MODEL` | `google/gemini-1.5-flash` | OpenRouter Docs |
| `FIREBASE_SERVICE_ACCOUNT` | Minified JSON string of your SA key | Firebase Console -> Project Settings -> Service Accounts |
| `FIREBASE_DATABASE_ID` | Your Firestore Database ID | Firebase Console -> Firestore |
| `APP_URL` | Your Railway App URL (e.g., `https://lifepilot.up.railway.app`) | Provided by Railway after deploy |
| `JWT_SECRET` | A long random string for token signing | Generate via `openssl rand -base64 32` |
| `GMAIL_USER` | Your Gmail address | For email verification |
| `GMAIL_PASS` | Gmail App Password | [Google App Passwords](https://myaccount.google.com/apppasswords) |
| `RAZORPAY_KEY_ID` | Razorpay API Key | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay API Secret | Razorpay Dashboard |

---

## 3. Build & Deployment Configuration

### Railway Settings:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Port**: `3000` (Railway automatically detects this from `server.ts`)

### Static File Serving:
The `server.ts` is already configured to serve the `dist` folder in production:
```typescript
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}
```

---

## 4. Pre-Deployment Testing Script

Create a file named `test-deploy.sh` locally to verify your AI and Auth endpoints:

```bash
#!/bin/bash
# Test AI Generation
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEST_JWT" \
  -d '{"prompt": "Test connection", "taskType": "simple"}'

# Test Health Check
curl http://localhost:3000/api/health
```

---

## 5. Post-Deployment Checklist

1. **Verify AI**: Log in to the app and send a chat message. Check `ai-errors.log` if it fails.
2. **Check Firebase**: Ensure you can see new user documents in the Firestore console.
3. **Test Payments**: Use Razorpay Test Mode to verify the subscription flow.
4. **Email Verification**: Register a new account and ensure the verification email arrives.
5. **Rate Limiting**: Try sending 5 rapid requests to `/api/ai/generate` to see if the 429/403 error triggers.

---

## 6. Troubleshooting Common Issues

- **CORS Errors**: Ensure `APP_URL` in environment variables matches your actual domain.
- **Firebase 403**: Check if your Service Account has "Cloud Datastore User" or "Editor" permissions.
- **OpenRouter 401**: Verify your API key has enough credits/balance.
- **Vite Build Fails**: Ensure all `devDependencies` are installed (Railway does this by default).

---

## 7. Cost Optimization Tips (OpenRouter)
- **Use Fast Models**: Default to `gemini-1.5-flash` for simple tasks.
- **Caching**: The app already has Firestore caching enabled—monitor the `ai_cache` collection to see savings.
- **Context Window**: Keep system prompts concise to save input tokens.
