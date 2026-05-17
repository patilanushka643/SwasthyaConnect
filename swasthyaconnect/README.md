# SwasthyaConnect - AIIMS-Inspired Hospital Management System

**Production-Ready MERN Stack HMS** | Modular | Scalable | Real-time | Secure

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-ISC-brightgreen)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Features](#features)

---

## 🏥 Overview

SwasthyaConnect is a comprehensive hospital management system inspired by AIIMS architecture, built with the MERN stack. It provides:

✅ **OPD Management** - Atomic appointment booking with live token queues  
✅ **Clinical Workflows** - Doctor dashboards, prescriptions, medical records  
✅ **Pharmacy Logistics** - Inventory management with low-stock alerts  
✅ **Emergency Triage** - Real-time bed allocation and patient prioritization  
✅ **Real-time Updates** - Socket.io powered live queue broadcasting  
✅ **Secure Authentication** - JWT-based multi-role access control  

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Socket.io Client, Axios |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), Socket.io |
| **Authentication** | JWT, bcryptjs |
| **File Handling** | Multer (PDF/Image upload) |
| **Real-time** | Socket.io (live queue, emergency updates) |

---

## 📁 Project Structure

```
swasthyaconnect/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── models/
│   │   ├── User.js                  # Patient, Doctor, Admin
│   │   ├── Appointment.js           # OPD booking
│   │   ├── MedicalRecord.js         # Prescriptions & diagnoses
│   │   ├── Inventory.js             # Pharmacy stock
│   │   └── Emergency.js             # Triage cases
│   ├── middleware/
│   │   ├── auth.js                  # JWT validation & role checks
│   │   └── upload.js                # Multer file handling
│   ├── controllers/
│   │   ├── authController.js        # Signup, login, staff fetch
│   │   ├── opdController.js         # Booking, queue management
│   │   ├── clinicalController.js    # Medical records, timeline
│   │   └── logisticsController.js   # Inventory, emergency, uploads
│   ├── routes/
│   │   └── api.js                   # Unified API routing
│   ├── server.js                    # Express + Socket.io bootstrap
│   ├── seed.js                      # Database seeding
│   ├── package.json                 # Dependencies
│   ├── .env.example                 # Environment template
│   └── uploads/                     # Lab files & reports
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # User state & Axios setup
│   │   │   └── SocketContext.jsx    # Socket.io lifecycle
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Role-aware navigation
│   │   │   └── ProtectedRoute.jsx   # Route guarding
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Authentication UI
│   │   │   ├── PatientDashboard.jsx # Booking, timeline, queue
│   │   │   ├── DoctorDashboard.jsx  # Waitlist, prescriptions
│   │   │   └── AdminDashboard.jsx   # Operations hub
│   │   ├── App.jsx                  # Route orchestration
│   │   ├── index.css                # Tailwind setup
│   │   └── main.jsx                 # React entry point
│   ├── index.html                   # Vite HTML template
│   ├── tailwind.config.js           # Tailwind customization
│   ├── package.json                 # Dependencies
│   └── .env.example                 # Environment template
├── QA_TESTING_MANUAL.md             # Comprehensive test suite
└── README.md                         # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB Atlas** account (free tier available at https://www.mongodb.com/cloud/atlas)
- **Git**

### Deployment Options

- **Local Development:** Follow [Quick Start](#quick-start) below
- **Render Cloud:** See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)
- **Pre-Deployment Check:** Run `bash validate-deployment.sh`

### 1. Clone & Setup Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your MongoDB URI
# PORT=5000
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/swasthyaconnect
# JWT_SECRET=your-super-secret-key-at-least-32-characters-long
# CLIENT_URL=http://localhost:5173
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Seed Database

```bash
npm run seed
```

**Expected Output:**
```
✅ Seeded 5 users.
   - Rajesh Kumar (patient1@swasthya.com) - Role: patient
   - Dr. Vikram Verma (doctor1@swasthya.com) - Role: doctor
   - Admin User (admin@swasthya.com) - Role: admin
✅ Seeded 5 medicines.
✅ Seeded 3 emergency cases.

🔐 Test Credentials:
   Patient: patient1@swasthya.com / patient123
   Doctor:  doctor1@swasthya.com / doctor123
   Admin:   admin@swasthya.com / admin123
```

### 4. Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
MongoDB connected: cluster.mongodb.net
Server running on port 5000
```

### 5. Setup Frontend

In a **new terminal**:

```bash
cd frontend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

**Expected Output:**
```
VITE v5.4.10 ready in 234 ms
➜  Local:   http://localhost:5173/
```

### 6. Open Browser

Navigate to `http://localhost:5173` and login with:

**Patient:**
- Email: `patient1@swasthya.com`
- Password: `patient123`

**Doctor:**
- Email: `doctor1@swasthya.com`
- Password: `doctor123`

**Admin:**
- Email: `admin@swasthya.com`
- Password: `admin123`

---

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login & get JWT token
- `GET /api/v1/auth/staff` - Fetch doctors & admin (admin-only)

### OPD Management
- `GET /api/v1/opd/doctors` - Search doctors by specialization
- `POST /api/v1/opd/book` - Book appointment (atomic booking)
- `GET /api/v1/opd/my-appointments` - Patient's appointments
- `GET /api/v1/opd/doctor-queue` - Doctor's patient queue
- `GET /api/v1/opd/queue/:appointmentId` - Queue rank & status

### Clinical
- `GET /api/v1/clinical/timeline` - Patient's medical history
- `POST /api/v1/clinical/record` - Submit medical record (doctor-only)

### Logistics
- `POST /api/v1/logistics/pharmacy/decrement` - Reduce medicine stock
- `POST /api/v1/logistics/records/:recordId/upload` - Upload lab file
- `PUT /api/v1/logistics/emergency/:emergencyId?` - Triage management
- `GET /api/v1/logistics/admin/overview` - Admin dashboard stats

---

## 🧪 Testing

A comprehensive **QA Testing Manual** is included: [QA_TESTING_MANUAL.md](./QA_TESTING_MANUAL.md)

Covers:
1. Component & Server Startup Check
2. Authentication & Access Governance
3. OPD Engines & Race Condition Simulation
4. Clinical Workspace & Logistics Testing
5. Postman / cURL Test Suite

### Quick Test Example

```bash
# Health check
curl http://localhost:5000/health | jq .

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@swasthya.com","password":"patient123"}' | jq -r '.token')

echo "Token: $TOKEN"

# Get doctors
curl -s -X GET http://localhost:5000/api/v1/opd/doctors \
  -H "Authorization: Bearer $TOKEN" | jq '.doctors'
```

---

## ✨ Key Features

### 1. Atomic Appointment Booking
- Prevents double-booking with MongoDB transactions
- Sequential token allocation per doctor per day
- Race condition resilience

### 2. Live Queue Broadcasting
- Socket.io real-time queue updates
- Instant status changes across all connected clients
- Patient queue rank tracking

### 3. Multi-Role Access Control
- Patient Dashboard: booking, timeline, queue status
- Doctor Dashboard: waitlist, prescriptions, file uploads
- Admin Dashboard: inventory alerts, emergency triage, staff grid

### 4. Secure File Uploads
- Multer integration with 5MB file size limit
- PDF & image validation
- Direct database linking to medical records

### 5. Inventory & Emergency Management
- Automated low-stock alerts
- Real-time emergency bed allocation
- Triage level prioritization (Red/Yellow/Green)

### 6. Medical Timeline
- Chronological medical record display
- Complete prescription history
- Lab report accessibility

---

## 🔒 Security Features

✅ JWT-based authentication with 30-day expiry  
✅ Bcryptjs password hashing (12-round salting)  
✅ Role-based access control (RBAC) on backend & frontend  
✅ Protected API routes requiring valid tokens  
✅ Secure file upload validation  
✅ CORS enabled for frontend communication  
✅ MongoDB connection with SSL/TLS support  

---

## 📊 Database Schema

### Users
```javascript
{
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum['patient', 'doctor', 'admin'],
  name: String,
  specialization: String (doctors only),
  phone: String,
  timestamps
}
```

### Appointments
```javascript
{
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: User),
  appointmentDate: Date,
  slotTime: String,
  status: Enum['Pending', 'Confirmed', 'Completed', 'Cancelled'],
  tokenNumber: Number (sequential per doctor per day)
}
```

### Medical Records
```javascript
{
  appointmentId: ObjectId (ref: Appointment, unique),
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: User),
  diagnosis: String,
  medicines: [{name, dosage, frequency}],
  instructions: String,
  fileUrl: String (lab report)
}
```

### Inventory
```javascript
{
  medicineName: String (unique),
  stockQuantity: Number,
  thresholdAlertCount: Number
}
```

### Emergency Cases
```javascript
{
  patientName: String,
  triageLevel: Enum['Red', 'Yellow', 'Green'],
  assignedBed: String,
  status: Enum['Waiting', 'Admitted', 'Discharged']
}
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/swasthyaconnect
JWT_SECRET=your-super-secret-key-minimum-32-chars-long
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Production Deployment

### Build Frontend

```bash
cd frontend
npm run build
# Output: dist/
```

### Deployment to Render

For comprehensive Render deployment instructions, see:
- **[RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)** — Complete step-by-step deployment guide
- **[DEPLOYMENT_CONFIGURATION_SUMMARY.md](./DEPLOYMENT_CONFIGURATION_SUMMARY.md)** — Configuration changes and verification
- **[validate-deployment.sh](./validate-deployment.sh)** — Pre-deployment validation script

#### Quick Deployment Checklist

```bash
# 1. Validate configuration
bash validate-deployment.sh

# 2. Push to GitHub
git add .
git commit -m "Production-ready for Render deployment"
git push origin main

# 3. Deploy on Render.com
# - Backend: Create Web Service (build: cd backend && npm install)
# - Frontend: Create Static Site (build: cd frontend && npm install && npm run build)
# - Set environment variables in Render dashboard
# - Monitor deployment logs
```

### Other Deployment Options

- **Railway.app** (free tier available)
- **Heroku** (paid)
- **AWS EC2 / ECS**
- **DigitalOcean App Platform**

### Database

- Use **MongoDB Atlas** (free tier: 512MB)
- Enable IP Whitelist
- Use connection string with TLS

---

## 📝 License

ISC

---

## 👨‍💼 Architecture Notes

### Atomic Booking (Race Condition Prevention)
- Uses MongoDB `findOneAndUpdate` with `upsert: true`
- Unique compound index on `(doctorId, appointmentDate, slotTime)`
- Session transactions for token number consistency

### Real-time Updates
- Socket.io broadcasts on `queue:update` and `appointment:completed`
- All connected clients receive live queue changes
- No polling required

### Multi-tenant Ready
- Role-based queries (patient sees only their data)
- Doctor sees only assigned appointments
- Admin has unrestricted access

---

## 🎯 Next Steps

1. **Read QA_TESTING_MANUAL.md** for comprehensive test coverage
2. **Run seed script** to populate test data
3. **Login with test credentials** and explore dashboards
4. **Review API endpoints** for backend integration
5. **Customize** models/controllers for your hospital's specific needs

---

## 📞 Support

For detailed testing instructions, see [QA_TESTING_MANUAL.md](./QA_TESTING_MANUAL.md)

---

**Built with ❤️ for healthcare innovation**

