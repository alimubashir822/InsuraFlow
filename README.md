Created & Developed by [Mubashir Ali](#developer-creator) (Full-Stack Healthcare Technology Engineer | AI Healthcare Solutions Builder)

# InsuraFlow AI — Insurance Verification & Revenue Intelligence Platform

> **Healthcare system by [Med Clinic X](https://www.medclinicx.com/)**

InsuraFlow AI is a full-stack, AI-powered healthcare administration platform built with **Next.js 16**, **Prisma ORM**, and **SQLite**. It automates insurance eligibility verification, prior authorization workflows, claim scrubbing, revenue leakage detection, and patient billing transparency — all from a single unified dashboard.

---

## ✨ Key Features

### 🏥 Multi-Role Dashboard System
The platform provides **5 distinct, role-based dashboard views**, each tailored to the user's responsibilities:

| Role | Dashboard Focus |
|------|----------------|
| **Admin (Clinic Owner)** | Executive revenue intelligence, leakage detection, payout trends, billing accuracy metrics |
| **Billing Manager** | Prior authorization management, AI claim scrubbing hub, coding compliance checks |
| **Front Desk** | Verification command center, real-time scheduling reviews, card scans, eligibility audits |
| **Doctor (Provider)** | Clinical patient board, active procedure tracking, authorization statuses, rejection risk scores |
| **Patient (Self-Service)** | Healthcare cost predictor, coverage plans, payment installment options, document vault |

### 🤖 AI-Powered Capabilities
- **Insurance Eligibility Verification** — Automated real-time insurance status checks with AI-generated coverage summaries
- **Revenue Leakage Detection** — AI identifies unresolved coverage items, missed pre-authorizations, and expired policies
- **Claim Scrubbing Engine** — Pre-flight compliance checks with risk scoring before claims are submitted to payers
- **Smart Card OCR Scanning** — Simulated insurance card scanning with data extraction and auto-population
- **AI Copilot Assistant** — Built-in conversational AI assistant for platform navigation and workflow guidance

### 📋 Clinical Workflow Automation
- **Prior Authorization Management** — Submit, track, approve/deny authorization requests with full audit trails
- **Claim Lifecycle Management** — Draft → Review → Submit → Approve/Deny → Paid — complete claim pipeline
- **Automation Rules Engine** — Configurable trigger-condition-action rules for automated eligibility checks and alerts
- **Patient Intake & Registration** — Full patient onboarding with insurance details, plan information, and document upload

### 📊 Analytics & Reporting
- **Monthly Payout Trend Charts** — Interactive area charts tracking verified claims payout trends
- **Revenue Leakage Dashboard** — Detailed breakdown of missed revenue opportunities with dollar amounts
- **Claim Approval Rate Tracking** — Real-time metrics on claim success rates and denial patterns
- **Verification Performance Metrics** — Average verification time, total requests processed, and success rates

### 🔒 Administration & Compliance
- **Full Audit Trail Logging** — Every action (verification, claim update, authorization) is logged with user attribution
- **Role-Based Access Control (RBAC)** — UI elements and data access are filtered based on the active user role
- **System Logs Panel** — Admin-only view of all audit logs, automation rules, and system configuration

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **UI** | React 19, Tailwind CSS v4, Lucide Icons |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Database** | SQLite (via Prisma ORM) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **State Management** | React Context API |

---

## 📁 Project Structure

```
next-project1/
├── prisma/
│   ├── schema.prisma        # Database schema (13 models)
│   ├── seed.js              # Database seeder with sample data
│   └── dev.db               # SQLite database file
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with Header, Footer, AI Copilot
│   │   ├── page.tsx         # Home page (redirects to /dashboard)
│   │   ├── globals.css      # Global styles and Tailwind config
│   │   ├── icon.svg         # Favicon (InsuraFlow branded)
│   │   ├── dashboard/
│   │   │   └── page.tsx     # Multi-role dashboard (5 views)
│   │   ├── patients/
│   │   │   └── page.tsx     # Patient management & detail views
│   │   ├── admin/
│   │   │   └── page.tsx     # System logs, audit trails, automation rules
│   │   └── api/
│   │       ├── data/route.ts        # GET all platform data
│   │       └── patients/route.ts    # Patient CRUD operations
│   ├── components/
│   │   ├── Header.tsx       # Navigation header with role switcher
│   │   ├── Footer.tsx       # Footer with Med Clinic X attribution
│   │   └── AICopilot.tsx    # Floating AI assistant widget
│   └── lib/
│       ├── context.tsx      # Global app state provider (React Context)
│       └── prisma.ts        # Prisma client singleton
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🗃️ Database Schema

The platform uses **13 Prisma models** covering the full healthcare administration domain:

- **Organization** — Multi-clinic organization grouping
- **Clinic** — Individual clinic locations
- **User** — Platform users with role-based access
- **Patient** — Patient demographics and insurance info
- **InsurancePlan** — Active coverage plans with deductible/copay details
- **InsuranceProvider** — Payer directory (BCBS, Aetna, Cigna, etc.)
- **VerificationRequest** — Insurance eligibility check requests
- **EligibilityResult** — AI-generated eligibility verification results
- **Authorization** — Prior authorization requests and approvals
- **Claim** — Medical/dental claim submissions with risk scoring
- **Payment** — Patient payment records
- **Document** — Uploaded insurance cards and clinical notes
- **AutomationRule** — Configurable workflow automation rules
- **AIInsight** — AI-generated revenue insights and risk alerts
- **AuditLog** — Complete system audit trail

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd next-project1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed the database with sample data**
   ```bash
   node prisma/seed.js
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app** at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 🎮 Usage Guide

### Role Switching
Use the **Simulation Role** dropdown in the header to switch between the 5 available roles. Each role presents a completely different dashboard view tailored to that user's workflow.

### Insurance Verification
1. Navigate to the **Patients** page
2. Select a patient or add a new one
3. Click **Verify Insurance** to trigger an automated eligibility check
4. View the AI-generated coverage summary and risk assessment

### Claim Management
1. Switch to the **Billing Manager** role
2. Use the **AI Claim Scrubbing Hub** to review claim readiness
3. Click **Audit Code** to run compliance checks
4. Submit claims through the full lifecycle pipeline

### Prior Authorization
1. As a Billing Manager, click **Request Prior Auth**
2. Select the patient and procedure
3. Track authorization status in the **AI Prior Authorization Tracker**

### Patient Cost Transparency
1. Switch to the **Patient** role
2. Use the **Healthcare Cost Predictor** to estimate out-of-pocket costs
3. Compare insurance contribution vs. personal responsibility
4. Select payment installment plans (3-month or 6-month, 0% interest)

---

## 📜 License

This project is proprietary software developed for [Med Clinic X](https://www.medclinicx.com/).

---

<p align="center">
  <strong>Healthcare system by <a href="https://www.medclinicx.com/">Med Clinic X</a></strong><br/>
  Built with ❤️ using Next.js, Prisma & AI
</p>

---

<a id="developer-creator"></a>
## 👤 Developer & Creator

I am a Full-Stack Healthcare Technology Developer specializing in building modern, scalable, and AI-powered healthcare platforms. I create high-performance digital solutions using React.js, Next.js, TypeScript, and Tailwind CSS to deliver fast, secure, and user-friendly experiences.

My expertise covers complete application development, from frontend architecture and responsive interfaces to backend systems powered by Node.js, REST APIs, GraphQL, PostgreSQL, and Prisma ORM. I build reliable platforms designed for scalability, performance, and long-term growth.

I work with modern cloud infrastructure including AWS, Vercel Edge, Google Cloud, Cloudflare CDN, Docker, and CI/CD pipelines to deploy secure and optimized applications.

With a strong focus on healthcare technology, I develop solutions including patient portals, AI automation systems, EHR integrations, and healthcare applications built around industry standards such as FHIR APIs and HIPAA compliance requirements.

My goal is to combine modern software engineering, cloud technologies, and healthcare innovation to help organizations build smarter digital experiences that improve patient engagement, operational efficiency, and healthcare delivery.

### 📫 Connect with Me

- 💼 **LinkedIn**: <a href="https://linkedin.com/in/mubashirali822" target="_blank" rel="noopener noreferrer">mubashirali822</a>
- 📧 **Email**: <a href="mailto:alimubashir822@gmail.com" target="_blank" rel="noopener noreferrer">alimubashir822@gmail.com</a>
- 🌐 **Website**: <a href="https://www.medclinicx.com/" target="_blank" rel="noopener noreferrer">medclinicx.com</a>
- 🏥 **View More Healthcare Solutions**: <a href="https://www.medclinicx.com/demo" target="_blank" rel="noopener noreferrer">medclinicx.com/demo</a>

⭐ *Building the next generation of digital healthcare technology.*
