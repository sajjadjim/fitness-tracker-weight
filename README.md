# FitTrack — Smart Weight & BMI Tracker 🏋️‍♂️✨

FitTrack is a modern, full-stack fitness software application built with **Next.js (App Router)** in **ONE unified codebase** containing both the responsive frontend and the secure server backend (Route Handlers).

Powered by **Firebase Authentication (Google Sign-In)**, **Firebase Admin SDK** for server verification, **MongoDB Atlas** for persistent storage, **Mongoose**, **Tailwind CSS**, and **Recharts**.

---

## ⚡ Key Highlights & Architecture

- **Single Full-Stack Codebase**: No separate `client` or `server` folders, no standalone Express or Render services. Everything runs within Next.js App Router.
- **Authoritative Server APIs**: Route Handlers inside `src/app/api/` handle all database queries and business logic.
- **Secure Authentication**:
  - Client-side Google Sign-In via Firebase Web SDK.
  - Server-side token verification using Firebase Admin SDK with secure, HttpOnly session cookies.
  - Strict data isolation: users can only query and mutate their own records.
- **Live Demo Mode**: Instant preview mode available right out of the box with zero external configuration required for initial evaluation.

---

## 📸 Application Preview & Screenshots

### 1. 🌟 Landing Page & Interactive Live BMI Gauge
> Engaging hero experience with instant WHO BMI screening calculator, Bengali/English language switcher, dark/light mode toggle, and one-click guest demo access.

![FitTrack Landing Page](images/image1.png)

<br />

### 2. 📊 Personal Fitness Dashboard & Health Metrics
> Authoritative health telemetry featuring dual-unit display (**KG** and **LBS** simultaneously), color-coded WHO standard BMI gauge bar, healthy adult reference weight range, and adaptive goal progress tracker.

![FitTrack Dashboard Overview](images/image2.png)

<br />

### 3. 📈 Multi-Span Progress Charts & Analytics
> Dynamic weight progression visualization built with Recharts, supporting 7-day, 30-day, 90-day, 1-year, and all-time interactive spans with target milestone reference line and log history table.

![FitTrack Progress Chart & Analytics](images/image3.png)

---

## 🚀 Core Features

1. **Public Landing Page**: Premium presentation with live interactive BMI slider calculator, features overview, and Google Sign-In.
2. **First-Time Onboarding**: Interactive 3-step setup configuring height, starting weight, default unit (KG / LBS), and target fitness milestone.
3. **Personal Fitness Dashboard**:
   - Current weight displayed simultaneously in **KG** and **LBS** (1 kg = 2.20462 lbs).
   - Previous recorded weight and weight delta since last entry.
   - Total weight progress since baseline measurement.
   - Authoritative World Health Organization (WHO) BMI standard calculation: `weight (kg) / [height (m)]²`.
   - Four-category classification: Underweight (&lt; 18.5), Normal weight (18.5–24.9), Overweight (25–29.9), and Obesity (≥ 30.0).
   - Adult healthy reference weight range based on user's height.
   - Health disclaimer regarding body composition screening.
4. **Interactive BMI Gauge Bar**: Visual multi-segment color track with dynamic pointer needle.
5. **Adaptive Fitness Goals**: Target weight tracking supporting weight loss, muscle gain, or maintenance with animated progress percentages.
6. **Multi-Span Interactive Charts**: Built with Recharts, supporting 7-day, 30-day, 90-day, and 1-year time windows with target milestone reference line.
7. **Daily Weight Logs**: Supports multiple daily entries with timestamps and optional workout/nutrition notes.
8. **Measurement History Table**: Complete search, edit, delete with confirmation, and instant **CSV Data Export**.
9. **Dark & Light Modes**: Elegant emerald green & teal accents with persistent theme switcher.
10. **Profile & Settings**: Adjust height, display name, toggle default unit, or delete account.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router) with TypeScript |
| **Styling** | Tailwind CSS with custom glassmorphism and emerald/teal tokens |
| **Icons & UI** | Lucide React |
| **Data Visualization** | Recharts (Responsive Area Chart with dynamic tooltips) |
| **Authentication (Client)** | Firebase Auth (Google Sign-In) |
| **Authentication (Server)** | Firebase Admin SDK (`verifyIdToken` & `createSessionCookie`) |
| **Database** | MongoDB Atlas via Mongoose with serverless connection pooling |
| **Validation** | Zod request validation schemas |
| **State & Fetching** | TanStack React Query |
| **Notifications** | Custom animated Toast notifications |
| **Deployment Target** | Vercel (Single Full-Stack Project) |

---

## 📁 Project Directory Structure

```
fitness-tracker-weight/
├── images/
│   ├── image1.png                         # Landing page & interactive BMI gauge
│   ├── image2.png                         # Health dashboard, BMI bar & goal cards
│   └── image3.png                         # Recharts progression analytics & history
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/session/route.ts      # HttpOnly session cookie handler
│   │   │   ├── dashboard/summary/route.ts # Telemetry & metrics aggregator
│   │   │   ├── goals/route.ts             # POST new fitness goal
│   │   │   ├── goals/current/route.ts     # GET active fitness goal
│   │   │   ├── goals/[id]/route.ts        # PATCH fitness goal
│   │   │   ├── users/me/route.ts          # GET, PATCH, DELETE user profile
│   │   │   ├── weights/route.ts           # GET & POST weight entries
│   │   │   ├── weights/[id]/route.ts      # PATCH & DELETE weight entry
│   │   │   └── weights/export/route.ts    # Direct CSV data export
│   │   ├── globals.css                    # Tailored styling & design tokens
│   │   ├── layout.tsx                     # Root layout with SEO and Providers
│   │   └── page.tsx                       # Smart Landing / Dashboard switcher
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AddWeightModal.tsx         # Weight entry modal with live BMI preview
│   │   │   ├── BmiGauge.tsx               # Interactive BMI visual scale bar
│   │   │   ├── DashboardHeader.tsx        # Top navigation & user profile
│   │   │   ├── DashboardView.tsx          # Main dashboard coordinator
│   │   │   ├── GoalModal.tsx              # Target milestone editor
│   │   │   ├── GoalProgressCard.tsx       # Animated progress card
│   │   │   ├── SummaryMetrics.tsx         # 4-card metric overview
│   │   │   └── WeightChart.tsx            # Recharts multi-span interactive chart
│   │   ├── history/
│   │   │   └── WeightHistoryView.tsx      # History table, search, edit, delete, CSV export
│   │   ├── landing/
│   │   │   └── LandingPage.tsx            # Public landing with interactive calculator
│   │   ├── onboarding/
│   │   │   └── OnboardingModal.tsx        # 3-step setup modal for new users
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx           # Firebase Auth & Demo Mode provider
│   │   │   ├── QueryProvider.tsx          # TanStack React Query provider
│   │   │   └── ThemeProvider.tsx          # Dark / Light theme provider
│   │   ├── settings/
│   │   │   └── SettingsModal.tsx          # Profile & unit settings modal
│   │   └── ui/
│   │       └── Toast.tsx                  # Toast notification context
│   └── lib/
│       ├── auth.ts                        # Server authentication & session verification
│       ├── calculations.ts                # BMI, KG/LBS conversion, and goal formulas
│       ├── fallbackStore.ts               # In-memory store for instant evaluation
│       ├── firebase/
│       │   ├── admin.ts                   # Firebase Admin SDK server setup
│       │   └── client.ts                  # Firebase client SDK setup
│       ├── models/
│       │   ├── FitnessGoal.ts             # Mongoose FitnessGoal schema
│       │   ├── User.ts                    # Mongoose User schema
│       │   └── WeightEntry.ts             # Mongoose WeightEntry schema
│       ├── mongodb.ts                     # Cached MongoDB connection utility
│       ├── utils.ts                       # Class merging (cn) & date formatters
│       └── validations/
│           └── schemas.ts                 # Zod validation schemas
├── .env.example                           # Complete environment configuration template
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate the variables with your credentials:

```ini
# 1. MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fittrack?retryWrites=true&w=majority

# 2. Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef

# 3. Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> **Note**: If you run the project without setting up Firebase and MongoDB initially, FitTrack automatically enters **Demo Mode** so you can preview, interact, test BMI calculations, log entries, and explore all dashboard features immediately.

---

## 💻 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Verify production build & lint:**
   ```bash
   npm run lint
   npm run build
   ```

---

## 🚢 Full-Stack Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import this repository.
3. Keep the default Next.js build settings:
   - Framework Preset: `Next.js`
   - Build Command: `next build`
   - Output Directory: `.next`
4. In the **Environment Variables** section, add the variables from `.env.example` (`MONGODB_URI`, `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_ADMIN_*`).
   - *Tip*: For `FIREBASE_ADMIN_PRIVATE_KEY`, ensure the multiline `\n` string is enclosed in quotes.
5. In your Firebase Console under **Authentication -> Settings -> Authorized domains**, add your Vercel deployment domain (e.g. `your-app.vercel.app`).
6. Click **Deploy**. Vercel will build and deploy the entire full-stack application!

---

## 🔒 Security & Privacy

- **Server-Side Token Verification**: API endpoints never trust client headers blindly. Tokens are validated via the Firebase Admin SDK.
- **HttpOnly Cookies**: Session tokens are transmitted via secure, HttpOnly cookies with `SameSite=lax` protection.
- **Strict Data Isolation**: Every MongoDB query scopes operations strictly to `auth.user._id`. Users cannot view, modify, or delete another user's records.
- **Sensitive Credentials Protected**: Neither MongoDB connection strings nor Firebase Admin service account private keys are ever shipped to the browser.
