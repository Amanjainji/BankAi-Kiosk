# Deployment Guide: Bank AI Platform

This guide explains how to deploy the **AI-Powered Unified Self-Service Platform** MVP. Since the application consists of a separate Vite-based React frontend and a Node.js/Express backend, we will deploy them to two different platforms:

1. **Backend (Node.js/Express)** -> [Render](https://render.com/) or [Railway](https://railway.app/)
2. **Frontend (React/Vite)** -> [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)

---

## 1. Backend Deployment (Render)

Render is an excellent platform for hosting Node.js applications for free or at a low cost.

### Prerequisites
- Push your code to a GitHub repository.
- Ensure your `backend/package.json` has a `start` script:
  ```json
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
  ```

### Steps to Deploy on Render
1. Go to [Render.com](https://render.com/) and sign in with GitHub.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing this project.
4. Fill in the deployment details:
   - **Name**: `bank-ai-backend` (or your preferred name)
   - **Root Directory**: `backend` (Important: since this is a monorepo structure, tell Render to only look in the `backend` folder).
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**: Add the following under "Environment Variables":
   - `PORT`: `5000`
   - `JWT_SECRET`: `your_super_secret_jwt_key`
   - `FRONTEND_URL`: The URL of your future Vercel deployment (e.g., `https://bank-ai-frontend.vercel.app`) to configure CORS properly.
6. Click **Create Web Service**. 
7. Once deployed, Render will give you a URL (e.g., `https://bank-ai-backend.onrender.com`). **Save this URL for the frontend setup.**

---

## 2. Frontend Deployment (Vercel)

Vercel is the best place to host Vite/React applications.

### Prerequisites
- In your frontend code, ensure API calls point to the backend URL using an environment variable. 
  Create an `.env` file in the `frontend` folder (locally) for testing:
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```
  *Make sure your API calls in the code use `import.meta.env.VITE_API_URL` instead of hardcoding `http://localhost:5000/api`.*

### Steps to Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure the Project:
   - **Project Name**: `bank-ai-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Click edit and select the `frontend` folder).
5. **Environment Variables**: 
   - Name: `VITE_API_URL`
   - Value: `https://bank-ai-backend.onrender.com/api` (Use the URL you got from Render in Step 1).
6. Click **Deploy**.
7. Vercel will build and deploy your frontend, providing you with a live URL.

---

## 3. Database Deployment (Optional / Future)

Currently, the MVP uses an in-memory or mock database. For a production-ready application, you should use a real PostgreSQL database.

**Recommended Free PostgreSQL Hosts:**
- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)
- [Render PostgreSQL](https://render.com/docs/databases)

**Integration Steps:**
1. Create a database on one of the above platforms.
2. Obtain the Connection String (URI).
3. In your Render Backend Environment Variables, add:
   - `DATABASE_URL`: `postgresql://user:password@host/dbname`
4. Install `pg` and configure your Node.js app to connect to this database using Sequelize, Prisma, or standard pg pools.

---

## 4. Keeping the App Awake (Free Tier Constraints)

If you use Render's free tier for the backend, the server will "spin down" after 15 minutes of inactivity. When a demo starts, the first API request might take 30-50 seconds to respond as the server wakes up.

**Workaround for Hackathons:**
Use a free pinging service like [cron-job.org](https://cron-job.org/) to hit your backend `GET /` or a health check route every 10 minutes to keep it awake during your presentation.
