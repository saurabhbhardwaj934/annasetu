# 🌾 Annasetu — Surplus Food Rescue Network (MERN)

**Real problem:** Har din Indian restaurants/hotels mein lakhon meals waste hote hain, jabki paas mein hi log bhookhe hain. Annasetu ek **Setu (bridge)** hai — restaurants surplus food post karte hain, NGOs/volunteers paas ki donations claim karke pickup-deliver karte hain, aur poora impact (meals rescued, CO₂ saved) live track hota hai.

```
annasetu/
├── server/                     # Express + Mongoose + MongoDB Atlas
│   ├── .env                    # ← YAHI EDIT KARNA HAI (Atlas URI)
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/             # env.js (dotenv), db.js (Atlas connection)
│       ├── models/             # User, Donation, Claim
│       ├── controllers/        # auth, donation, claim, impact
│       ├── middlewares/        # protect (JWT), errorHandler, notFound
│       ├── routes/             # /api/v1/{auth,donations,claims,impact,health}
│       ├── utils/              # ApiError, ApiResponse, asyncHandler, geo
│       ├── data/               # NCR places (geo coords)
│       └── server.js
│
└── client/                     # React + Vite (modern UI)
    └── src/
        ├── api/                # fetch wrapper (auto JWT header)
        ├── context/            # AuthContext, Toast
        ├── components/         # Navbar, Footer, DonationCard, PlaceSelect, UI kit
        ├── pages/              # Home, Feed, DonationDetail, PostDonation,
        │                       # MyDonations, MyClaims, Impact, Login, Register, Profile
        ├── data/               # NCR places (client mirror)
        └── utils/format.js
```

---

## 🚀 Run karna (2 terminal)

### Step 0 — MongoDB Atlas setup (ek baar, 5 min)
1. https://www.mongodb.com/cloud/atlas → sign up (free **M0** cluster)
2. **Database Access** → *Add New Database User* (username + password yaad rakho)
3. **Network Access** → *Add IP Address* → `0.0.0.0/0` (dev ke liye)
4. **Clusters** → *Connect* → *Drivers* → connection string copy karo
5. `<password>` ki jagah apna password, DB name `annasetu`:

```ini
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/annasetu?retryWrites=true&w=majority
```

### Step 1 — Backend
```bash
cd server
npm install
# server/.env kholo → MONGODB_URI me apni Atlas string paste karo
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # JWT_SECRET ke liye
npm run dev        # → http://localhost:5000
```

### Step 2 — Frontend (naya terminal)
```bash
cd client
npm install
npm run dev        # → http://localhost:5173
```

> Register karte waqt role chuno (Restaurant / NGO / Volunteer). Donation post karo, dusre role se claim karo, pickup → deliver karo — sab **real data** tumhare Atlas `annasetu` database mein.

---

## 🗄️ Database highlights (interview me bolna!)

| Feature | Kaise implement hua |
|---|---|
| **TTL auto-expiry** | `expiresAt` = pickup window end. `expireAfterSeconds: 0` index → Atlas khud unclaimed + expired donations DELETE karta hai. Claim par `$unset` → history safe. |
| **Geo search** | `2dsphere` index on `location` + `$geoWithin/$centerSphere` — "donations within 10 km" |
| **No double-claim** | Atomic `findOneAndUpdate` (`status: available` guard) + `unique` index on `Claim.donation` — race-condition proof |
| **Rollback** | Claim create fail ho to donation wapas `available` + `expiresAt` restore |
| **Aggregation** | Impact dashboard: `$group/$sum` totals, `$dateToString` monthly trend, `$lookup` join for top donors/rescuers |
| **Denormalised counters** | `mealsDonated` / `mealsRescued` on User — atomic `$inc` on deliver |
| **Status workflow** | Available → Claimed → Picked up → Delivered (timestamps har step pe) |
| **JWT auth** | httpOnly cookie + Bearer; bcrypt hashing; role-based access |

## 🔌 API (base: `/api/v1`)

```
POST   /auth/register   (role: restaurant | ngo | volunteer)
POST   /auth/login      GET /auth/me      POST /auth/logout

GET    /donations?lat&lng&radius&foodType     POST   /donations
GET    /donations/mine                        GET    /donations/:id
PATCH  /donations/:id/cancel

POST   /claims/donations/:donationId/claim    GET    /claims/mine
PATCH  /claims/:id/pickup                     PATCH  /claims/:id/deliver
PATCH  /claims/:id/cancel

GET    /impact          GET /health
```

## 📦 Tech stack
- **M**ongoDB Atlas (M0 free tier) + Mongoose 8 — TTL, 2dsphere, aggregation
- **E**xpress 4 · JWT + bcryptjs · cookie-parser · cors
- **R**eact 18 + Vite + React Router 6
- **N**ode 20

*Estimates: 1 meal ≈ 0.45 kg food waste avoided ≈ 2.5 kg CO₂e saved (industry-standard rough numbers).*
