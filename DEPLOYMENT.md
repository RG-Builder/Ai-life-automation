# LifePilot AI — Production Deployment Guide

## Quick Start (Local Development)

```bash
npm install
cp .env.example .env.local   # Fill in your values
npm run dev                  # Starts server + Vite at http://localhost:3000
```

---

## Pre-Launch Checklist

### 1. Firebase Setup
- [ ] Create project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable **Authentication** → Email/Password + Google Sign-In
- [ ] Add your domain to **Authorized Domains** (Authentication → Settings)
- [ ] Create **Firestore Database** (Start in production mode)
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Copy your Web App config into `firebase-applet-config.json`
- [ ] Generate a **Service Account key** → paste into `FIREBASE_SERVICE_ACCOUNT` env var

### 2. Environment Variables
- [ ] Copy `.env.example` → `.env.local`
- [ ] Fill in all required values (see comments in the file)
- [ ] **Never commit `.env.local` to git** (it's in `.gitignore`)

### 3. Payments (Razorpay)
- [ ] Create account at [razorpay.com](https://razorpay.com)
- [ ] Get Live API keys from Dashboard → Settings → API Keys
- [ ] Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `VITE_RAZORPAY_KEY_ID`
- [ ] Add your domain to Razorpay's allowed list

### 4. AI Keys
- [ ] Get Gemini API key from [aistudio.google.com](https://aistudio.google.com/apikey)
- [ ] (Optional) Get OpenRouter key for server-side multi-model AI

---

## Deploying to Google Cloud Run (Recommended)

```bash
# 1. Build the frontend
npm run build

# 2. Build Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/lifepilot-ai

# 3. Deploy to Cloud Run
gcloud run deploy lifepilot-ai \
  --image gcr.io/YOUR_PROJECT_ID/lifepilot-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets FIREBASE_SERVICE_ACCOUNT=firebase-sa:latest,JWT_SECRET=jwt-secret:latest
```

## Deploying to Railway / Render / Fly.io

1. Connect your GitHub repo
2. Set all environment variables in the dashboard
3. Set build command: `npm run build`
4. Set start command: `npm run start`
5. Set port: `3000`

---

## Monetization Setup

### Current Pricing (in `src/App.tsx` → `renderSettings`)
- **Free/Trial**: 3 AI requests total, max 10 tasks
- **Premium**: ₹499/month — unlimited tasks, 50 AI requests/day

### To change pricing:
1. Update the UI in `renderSettings()` → pricing overlay
2. Update limits in `server.ts` → `handle_ai_request()` function
3. Update `initiatePayment(499)` call to your desired amount

---

## Security Checklist Before Going Live

- [ ] `JWT_SECRET` is a strong random string (min 64 chars)
- [ ] `FIREBASE_SERVICE_ACCOUNT` is stored as a secret, not in code
- [ ] `RAZORPAY_KEY_SECRET` is stored as a secret
- [ ] Firestore rules deny unauthenticated reads/writes (check `firestore.rules`)
- [ ] Rate limiting is enabled (already in `server.ts`)
- [ ] HTTPS is enforced (Cloud Run does this automatically)
- [ ] `NODE_ENV=production` is set

---

## Bug Fixes Applied (v2.0)

| # | Bug | Fix |
|---|-----|-----|
| 1 | Wrong AI model name (`gemini-3-flash-preview`) | Changed to `gemini-2.0-flash` |
| 2 | `process.env.GEMINI_API_KEY` in Vite frontend | Changed to `import.meta.env.VITE_GEMINI_API_KEY` |
| 3 | `mission.importance` undefined in task sorting | Uses `urgency_score` instead |
| 4 | `user?.subscription_plan` used wrong object | Changed to `userProfile?.subscription_plan` |
| 5 | Home nav button had hardcoded grey color | Removed inline style override |
| 6 | Duplicate `fetchNextAction` useEffect | Removed duplicate |
| 7 | Task category always saved as `'work'` | Now uses `category` state |
| 8 | `timelineMatrix` never populated (schedule tab always empty) | Derives from `missions` with `startTime` |
| 9 | `checkStreaks` return type mismatch | Fixed field mapping (`current_streak`, `focus_streak`) |
| 10 | `resetForm` didn't clear `category` or `deadlineError` | Fixed |
| 11 | No deadline validation (past dates allowed) | Added future-date check |
| 12 | `process.env.VITE_RAZORPAY_KEY_ID` in frontend | Changed to `import.meta.env` |
| 13 | Components inlined in 3,686-line App.tsx | Extracted to `FocusMode`, `AiPanel`, `MissionCard` |
| 14 | `saveMission` no loading state during save | Added `setLoading` |

---

## Support
Email: lifepilotai.app@gmail.com
