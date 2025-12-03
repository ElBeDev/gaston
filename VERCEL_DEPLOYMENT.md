# Deploying Eva Assistant to Vercel

## Prerequisites
- Vercel account
- MongoDB Atlas account (or MongoDB instance)
- OpenAI API key
- Google OAuth credentials (optional, for Gmail/Calendar)

## Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

### Required
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_random_secret_string
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### Optional (for Google integrations)
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-vercel-app.vercel.app/auth/google/callback
```

## Deployment Steps

### 1. Install Vercel CLI (optional)
```bash
npm install -g vercel
```

### 2. Deploy from GitHub
- Go to https://vercel.com/new
- Import your GitHub repository
- Vercel will detect the configuration from `vercel.json`
- Add environment variables in project settings
- Deploy!

### 3. Or deploy via CLI
```bash
vercel --prod
```

## Post-Deployment

1. **Update CORS_ORIGIN**: Set to your Vercel deployment URL
2. **MongoDB Whitelist**: Add Vercel IPs to MongoDB Atlas network access
3. **Google OAuth**: Update redirect URIs in Google Console
4. **Test**: Visit your Vercel URL and test all features

## Project Structure
```
GastonAssistan/
├── frontend/          # React app (deployed as static site)
├── backend/           # Express API (deployed as serverless functions)
├── vercel.json        # Vercel configuration
└── .env.example       # Environment variables template
```

## Notes
- Frontend builds to `frontend/build/`
- Backend API routes start with `/api`
- Eva routes start with `/eva`
- WhatsApp sessions are ephemeral on Vercel (use external storage for production)

## Troubleshooting

### Build fails
- Check Node version compatibility (use Node 18+)
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

### API errors
- Verify environment variables are set correctly
- Check MongoDB connection string
- Review function logs in Vercel dashboard

### CORS errors
- Ensure CORS_ORIGIN matches your Vercel URL
- Check backend CORS configuration in app.js
