# EventHub Marketplace & AI Intelligence Platform

EventHub is a decoupled, two-sided event vendor marketplace and AI acquisition service engineered for high trust, reputation verification, and geographical search intelligence.

## System Architecture

1. **Marketplace Web Application (Next.js & Prisma)**
   - Exposes client routes for search, discovery, portfolios, vendor dashboards, and admin vetting consoles.
   - Powered by a relational **PostgreSQL** schema modeled in Prisma, representing many-to-many categories, claims, analytics views, and reputation stats.
   
2. **AI Acquisition & Growth Service (FastAPI & Python)**
   - Exposes crawlers that automate discovery (Agent 1), parsing (Agent 2), normalization (Agent 3), categories scoring (Agent 4), credibility analysis (Agent 5), deduplication (Agent 6), and claiming alerts (Agent 7).

---

## Directory Layout

```text
Eventhub/
├── package.json         # Next.js configurations & scripts
├── tsconfig.json        # TypeScript configuration
├── next.config.js       # Next.js bundler settings
├── README.md            # Setup and operations guide
├── prisma/
│   ├── schema.prisma    # Relational Database Models (PostgreSQL)
│   └── seed.js          # DB seed script (Seeds categories & mock profiles)
├── src/
│   ├── app/
│   │   ├── globals.css  # CSS custom properties, variables, and animations
│   │   ├── layout.tsx   # Root layout and semantic HTML structure
│   │   ├── page.tsx     # Landing Page discovery portal
│   │   ├── login/       # Login page
│   │   ├── signup/      # Signup page
│   │   ├── search/      # Filtering and searching directory
│   │   ├── vendors/     # Vendor detail pages & inquiry submissions
│   │   ├── admin/       # Admin console & AI agents simulator terminal
│   │   └── api/         # Next.js App Router API endpoints (Auth, Search, Reviews)
│   └── lib/
│       ├── db.ts        # Global PrismaClient instantiator
│       └── auth.ts      # Password hashing & JWT session verification
└── ai_service/
    ├── requirements.txt # Python dependencies
    └── main.py          # FastAPI multi-agent simulation server
```

---

## Setup & Running Guide

Once you install Node.js, Python, and PostgreSQL on your Windows system, follow these steps to run the application:

### 1. Database Setup
1. Create a PostgreSQL database named `eventhub`.
2. Create a `.env` file in the root of the project:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/eventhub"
   JWT_SECRET="your_jwt_secret_key"
   ```

### 2. Install Dependencies & Generate Client
Open PowerShell in the `Eventhub` directory and run:
```powershell
# Install node packages
npm install

# Run Prisma migrations to construct database tables
npx prisma migrate dev --name init

# Generate Prisma Client types
npx prisma generate

# Seed categories and test users
npm run prisma:seed
```

### 3. Run the Next.js Marketplace Web App
```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run the FastAPI AI Service
1. Open a separate PowerShell window in `Eventhub/ai_service`.
2. Configure a virtual environment and launch the server:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
The AI Agent service will be active at [http://localhost:8000](http://localhost:8000).

---

## Verification Test Credentials

The database seeding script creates three pre-configured accounts for testing validation:

- **Admin Account**: `admin@eventhub.com` / `password123`
- **Vendor Account**: `vendor@eventhub.com` / `password123`
- **Customer Account**: `customer@eventhub.com` / `password123`
