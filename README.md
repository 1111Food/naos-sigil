# NAOS Platform

Bio-Architectural Identity & Astrology Engine.

## Tech Stack
- **Frontend**: React + Vite + Framer Motion (Glassmorphism UI)
- **Backend**: Fastify + TypeScript + Gemini AI integration
- **Database**: Supabase (Auth & Real-time storage)

## Deployment Instructions

### 1. GitHub
Initial push:
```bash
git init
git add .
git commit -m "feat: Initial architecture and Master Cards integration"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 2. Vercel (Frontend)
1. Import the repository in Vercel.
2. Select the `client` folder as the root.
3. Add the environment variables from `client/.env.example`.
4. Deploy.

### 3. Backend Deployment
The server is a Fastify application. You can deploy it as a separate project in Vercel using the `vercel.json` provided or use services like Railway/Render.

## Environment Variables
Ensure you provide the following keys in your deployment platform:
- `GEMINI_API_KEY`
- `ASTROLOGY_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
