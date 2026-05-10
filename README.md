# ⚡ Campus Event Management System —cinematic futuristic event platform

A full-stack campus event management platform with a cinematic Naruto-anime UI. Built with React + Vite, Node.js + Express, and MongoDB.

---

## 🗂️ Project Structure

```
campus-event-system/
├── frontend/          # React + Vite + Tailwind + Framer Motion
└── backend/           # Node.js + Express + MongoDB
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy env and configure
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Razorpay keys, and email credentials




# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

---


## 🎮 Features

### Student
- Browse & search events with filters
- Book free and paid tickets
- Razorpay payment integration
- QR code ticket generation & download
- View booking history with status
- Cancel bookings

### Staff
- Create & manage events
- Upload event banner images
- Track bookings per event
- View event analytics

### Admin
- Approve / reject events with feedback
- Manage all users (activate/deactivate, change roles)
- Feature/unfeature events
- Full analytics dashboard (charts, revenue, trends)
- Real-time updates via WebSocket

---

## 🧱 Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Utility styling |
| Framer Motion | Animations |
| GSAP | Complex animations |
| React Router v6 | Routing |
| Axios | HTTP client |
| Recharts | Analytics charts |
| Socket.io-client | Real-time updates |
| React QR Code | QR ticket generation |
| React Hot Toast | Notifications |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | Server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Socket.io | Real-time events |
| Razorpay | Payment gateway |
| Nodemailer | Email notifications |
| QRCode | QR code generation |
| Multer | File uploads |

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me`
- `PUT  /api/auth/me`
- `PUT  /api/auth/change-password`

### Events
- `GET  /api/events`
- `GET  /api/events/featured`
- `GET  /api/events/:id`
- `POST /api/events` *(staff/admin)*
- `PUT  /api/events/:id` *(staff/admin)*
- `DELETE /api/events/:id` *(staff/admin)*
- `GET  /api/events/:id/analytics` *(staff/admin)*

### Bookings
- `POST /api/bookings`
- `GET  /api/bookings/my`
- `GET  /api/bookings/:id`
- `PUT  /api/bookings/:id/cancel`
- `GET  /api/bookings/:id/ticket`
- `PUT  /api/bookings/:id/checkin` *(staff/admin)*

### Payments
- `POST /api/payments/create-order`
- `POST /api/payments/verify`

### Admin
- `GET  /api/admin/analytics`
- `GET  /api/admin/users`
- `PUT  /api/admin/users/:id/toggle`
- `PUT  /api/admin/users/:id/role`
- `GET  /api/admin/events`
- `PUT  /api/admin/events/:id/review`
- `PUT  /api/admin/events/:id/feature`

---

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_events
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=app_password
CLIENT_URL=http://localhost:3000
```

---

## 🎨 Design Theme

- **Style**: Naruto anime-inspired dark UI
- **Colors**: `#FF6A00` (chakra orange), `#FFB347` (amber), `#FACC15` (gold), `#060B14` (dark)
- **Fonts**: Bebas Neue (headings), Exo 2 (UI), DM Sans (body)
- **Effects**: Particle background, kanji overlays, glassmorphism, neon borders, framer motion transitions

---

## ⚡ Believe it!
