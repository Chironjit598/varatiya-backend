# বাসা লাগবে (Basha Lagbe) - Production REST API Backend

> All-in-one Home Searching, Mess Seat Booking, Mess Management, Bachelor Meal Tracking, and Family Expense Tracking Platform Backend API.

---

## 🛠 Tech Stack & Architecture
- **Runtime & Framework**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM (GeoJSON `2dsphere` index for nearby property search, connection pooling, embedded persistent fallback in development)
- **Authentication**: JWT (`accessToken` + `refreshToken`) via `Authorization: Bearer <token>` + `bcryptjs` password hashing
- **File Uploads**: `multer` (`multipart/form-data` under field name `images`) with Cloudinary & local `/uploads` static serving
- **Port & Base Path**: Default port `5001`, base URL `/api`, health check at `GET /health`

---

## 📦 Global API Response Envelope

### Success Response (`HTTP 200 / 201`)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response (`HTTP 400 / 401 / 403 / 404 / 500`)
```json
{
  "success": false,
  "message": "বাংলা বা ইংরেজিতে স্পষ্ট এরর মেসেজ",
  "errors": ["Optional detailed error string 1"]
}
```

---

## 📁 Project Structure

```text
src/
├── config/
│   ├── cloudinary.js         # Cloudinary storage configuration
│   ├── db.js                 # MongoDB connection with embedded fallback
│   └── env.js                # Environment variables configuration
├── middlewares/
│   ├── auth.middleware.js    # Bearer JWT authentication & RBAC
│   ├── error.middleware.js   # Centralized global error & 404 handler
│   ├── rateLimiter.js        # Rate limiters for OTP, login, and general routes
│   └── upload.middleware.js  # Multer multipart/form-data & type normalization
├── modules/
│   ├── auth/                 # Auth endpoints (/api/auth) & User/OTP schemas
│   ├── user/                 # User lookup & phone search (/api/users)
│   ├── property/             # Property & Mess listings (/api/properties)
│   ├── mess/                 # Mess Management, Border Portal & Meal Tracker (/api/messes)
│   ├── family-expense/       # Family Expense Tracker (/api/family-expenses)
│   ├── alert/                # Rental Alert Subscriptions (/api/alerts)
│   └── upload/               # Standalone image upload endpoints (/api/upload)
├── utils/
│   ├── apiResponse.js        # Standardized JSON response wrapper
│   ├── messHelper.js         # Room generation, seat preservation & financial formulas
│   └── smsHelper.js          # SMS & OTP helper (default dev OTP: 1234)
├── app.js                    # Express application setup
└── server.js                 # HTTP server entry point & graceful shutdown
```

---

## 🔗 Complete REST API Endpoints

### 1. Authentication & User Lookup (`/api/auth` & `/api/users`)
- `POST /api/auth/register` — Register account (`{ name, phoneNumber, password, role }`) -> Returns `{ user, accessToken, refreshToken }`
- `POST /api/auth/verify-otp` — Verify OTP (`{ phoneNumber, otp, purpose }`) -> Returns `{ user, accessToken, refreshToken }`
- `POST /api/auth/resend-otp` — Resend OTP (`{ phoneNumber, purpose }`)
- `POST /api/auth/login` — Login (`{ phoneNumber, password }`) -> Returns `{ user, accessToken, refreshToken }`
- `GET /api/auth/profile` — Get current user profile (`Auth Required`)
- `POST /api/auth/refresh-token` — Issue new `accessToken` from `refreshToken`
- `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/change-password`
- `GET /api/users/search?q=<query>` & `GET /api/users/by-phone/:phone` (`Auth Required`) — Searches registered users by normalized phone number; returns `404` with `"এই নম্বরে কোনো অ্যাকাউন্ট নেই! অনুগ্রহ করে তাকে আগে অ্যাকাউন্ট খুলতে বলুন।"` if not found.

### 2. Property & Mess Listings (`/api/properties`)
- `GET /api/properties` — Public feed with filters (`page`, `limit`, `sortBy`, `search`, `area`, `subArea`, `tenantType`, `minPrice`, `maxPrice`, `minBedrooms`, `isMess`, `rentType`, `lat`, `lng`, `radiusKm`)
- `GET /api/properties/:id` — Single property details
- `POST /api/properties` (`Auth Required`) — Create Entire Flat, Single Room, or Mess Seat Post (`isMess: true`). Auto-generates `rooms`, creates linked `ManagedMess` with matching ID, and increments `matchCount` on matching `Alert` subscriptions.
- `GET /api/properties/my/posts` (`Auth Required`) — Current user's posted properties
- `PATCH /api/properties/:id/toggle-status` (`Auth Required`) — Flip `isActive`
- `PUT /api/properties/:id` (`Auth Required`) — Update property & sync linked `ManagedMess`
- `DELETE /api/properties/:id` (`Auth Required`) — Delete property & linked `ManagedMess`

### 3. Mess Management & Border Portal (`/api/messes`)
- `GET /api/messes/managed` (`Auth Required`) — Get all `ManagedMess` where user is manager, member, or seat border
- `POST /api/messes` (`Auth Required`) — Create a new `ManagedMess` or Bachelor Mess Group
- `GET /api/messes/:messId` (`Auth Required`) — Get single `ManagedMess` details
- `PUT /api/messes/:messId` (`Auth Required`) — Edit Mess, rebuild rooms while preserving booked seats, and sync with linked `Property`
- `POST /api/messes/:messId/assign-border` (`Auth Required`) — Verify registered account by phone, book seat, add to `members`, and update `vacantSeats`
- `POST /api/messes/:messId/vacate-seat` (`Auth Required`) — Free seat and update `vacantSeats`
- `POST /api/messes/:messId/shared-bills` & `DELETE /api/messes/:messId/shared-bills/:billId` (`Auth Required`)
- `POST /api/messes/:messId/notices` (`Auth Required`)
- `DELETE /api/messes/:messId/notices/:noticeId` (`Auth Required`) — Delete notice (Manager or author only)

### 4. Bachelor Meal Tracker & Daily Operations (`/api/messes/:messId/...`)
- `PATCH /api/messes/:messId/meals-per-day` — Configure `2` or `3` meals per day
- `PATCH /api/messes/:messId/members/:memberId/toggle-slot` — Toggle member meal slot (`slotIndex`, `date`)
- `POST /api/messes/:messId/bazar` — Add itemized bazar entry & increment buyer's `totalMoneyDeposited`
- `DELETE /api/messes/:messId/bazar/:bazarId` (`Auth Required`) — Delete bazar entry, deduct buyer deposit & recompute financial metrics
- `POST /api/messes/:messId/members/:memberId/deposit` — Add deposit amount to `totalMoneyDeposited`
- `POST /api/messes/:messId/members` & `DELETE /api/messes/:messId/members/:memberId` — Add/remove registered user in Bachelor Mess
- `PATCH /api/messes/:messId/manager` — Change mess manager role
- `POST /api/messes/:messId/meal-requests` & `PATCH /api/messes/:messId/meal-requests/:requestId/resolve` — Create & resolve meal requests

### 5. Family Expenses & Rental Alerts (`/api/family-expenses` & `/api/alerts`)
- `GET /api/family-expenses`, `POST /api/family-expenses`, `PATCH /api/family-expenses/:id/toggle-paid`, `DELETE /api/family-expenses/:id`
- `GET /api/alerts`, `POST /api/alerts`, `PATCH /api/alerts/:id/toggle`, `DELETE /api/alerts/:id`
