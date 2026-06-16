# EventHub Production Hosting & Deployment Manual

This guide details the step-by-step setup required to deploy the EventHub marketplace and AI acquisition backend to production.

---

## 🗄️ Step 1: Database Setup (Neon PostgreSQL)

1. Sign up for a free serverless PostgreSQL database at [Neon.tech](https://neon.tech).
2. Create a new project named `eventhub`.
3. In the project dashboard, select the **Connection string** widget:
   * Copy the connection string (with the pooled connection option if using serverless).
   * Note: The connection string format should look like: `postgresql://<user>:<password>@<host>/neondb?sslmode=require`.
4. Run migrations locally to initialize the production schema (or let the GitHub Actions pipeline execute it):
   ```bash
   DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
   ```

---

## ⚡ Step 2: Frontend Deployment (Vercel)

1. Sign up/log in at [Vercel](https://vercel.com).
2. Click **Add New** > **Project** and import your `EventHub` GitHub repository.
3. In the **Environment Variables** section, configure the following variables:
   * `DATABASE_URL`: Your Neon PostgreSQL connection string.
   * `JWT_SECRET`: A high-security random string used to sign user session tokens (e.g. run `openssl rand -base64 32` to generate one).
   * `AI_SERVICE_URL`: The production URL of your FastAPI backend (once deployed in Step 3, e.g. `https://eventhub-backend.up.railway.app`).
   * `RESEND_API_KEY`: *(Optional)* Your Resend API key for sending claim verification emails. If omitted, emails will fall back to stdout logging.
   * `EMAIL_FROM`: The verified sender address in your Resend account (e.g., `onboarding@yourdomain.com`).
4. Click **Deploy**. Vercel will automatically compile the TypeScript, optimize bundles, and launch the site.

---

## 🤖 Step 3: FastAPI Backend Deployment (Render or Railway)

You can deploy the Python FastAPI microservice on any container-friendly provider. We recommend **Railway** or **Render** because of their native Docker support.

### Option A: Deployment on Railway

1. Go to [Railway.app](https://railway.app) and create a new project.
2. Select **Deploy from GitHub repository** and select the `EventHub` repo.
3. In the service settings:
   * Set the **Build Command** to use `backend.Dockerfile`:
     * Target path: `./backend.Dockerfile`
   * Set the internal port to `8000`.
4. Configure the following **Environment Variables**:
   * `DATABASE_URL`: Your Neon PostgreSQL connection string (the backend writes crawled candidates directly to PostgreSQL).
   * `OPENAI_API_KEY` or `DEEPSEEK_API_KEY`: Your LLM API key. This is required for live crawling extraction and standardization jobs.
5. Railway will build the Docker container and provide a public URL (e.g., `https://eventhub-backend.up.railway.app`).

### Option B: Deployment on Render

1. Go to [Render.com](https://render.com) and click **New** > **Web Service**.
2. Link your GitHub repository.
3. Set the service properties:
   * **Runtime:** `Docker`
   * **Docker File Path:** `backend.Dockerfile`
4. In the **Environment Variables** configuration, add:
   * `DATABASE_URL`
   * `OPENAI_API_KEY` or `DEEPSEEK_API_KEY`
5. Click **Deploy Web Service**.

---

## 🔑 Production Environment Variable Reference

### Next.js Frontend (`.env.production`)

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
JWT_SECRET="generate-a-secure-random-key"
AI_SERVICE_URL="https://your-backend-url.railway.app"
RESEND_API_KEY="re_yourResendApiKeyHere"
EMAIL_FROM="onboarding@yourdomain.com"
```

### FastAPI Python Backend (`.env.backend.production`)

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
OPENAI_API_KEY="sk-proj-yourOpenAiKeyHere"
# Or if using DeepSeek:
DEEPSEEK_API_KEY="sk-yourDeepseekKeyHere"
```
