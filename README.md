# Ai-life-automation

## Firebase Setup (Optional)

For full functionality with authentication and Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Google Sign-In)
4. Create a Firestore Database
5. Get your config values and add to .env.local:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_ID=your_database_id
```

**Note:** The app works in "Demo Mode" without Firebase config.
