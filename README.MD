
# Hospital Management System

A comprehensive full-stack hospital management application built with modern technologies. This system enables efficient management of patients, doctors, medicines, prescriptions, and billing operations.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Dependencies](#dependencies)
- [Features](#features)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Environment Configuration](#environment-configuration)
- [Project Structure Details](#project-structure-details)
- [Troubleshooting](#troubleshooting)

## Overview

This Hospital Management System is a full-stack web application designed to streamline healthcare operations. The system provides an intuitive interface for managing patient records, doctor schedules, medicine inventory, prescriptions, payments, and generating comprehensive reports.

## Project Structure

```
hospital/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── DashboardContent.jsx
│   │   │   ├── DoctorModal.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── MedicineModal.jsx
│   │   │   ├── PatientModal.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   ├── PrescriptionModal.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── BillingPage.jsx
│   │   │   ├── DoctorPage.jsx
│   │   │   ├── MedicinePage.jsx
│   │   │   ├── PasienPage.jsx
│   │   │   ├── PatientPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   ├── PrescriptionPage.jsx
│   │   │   └── ReportingPage.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
└── README.md
```

## Tech Stack

### Backend
- **Runtime**: Node.js (v16.x or higher)
- **Framework**: Express.js
- **Database**: MongoDB / MySQL / PostgreSQL (configure in .env)
- **Authentication**: JWT (JSON Web Tokens)
- **Environment Management**: dotenv

### Frontend
- **Library**: React 18.x
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **HTTP Client**: Axios
- **State Management**: React Hooks / Context API
- **CSS Processing**: PostCSS

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: v16.x or higher ([Download](https://nodejs.org/))
- **npm**: v7.x or higher (comes with Node.js)
- **Git**: For version control
- **Database**: MongoDB, MySQL, or PostgreSQL
- **Code Editor**: VS Code recommended

Verify installations:
```bash
node --version
npm --version
git --version
```

## Installation & Setup

### Step 1: Clone or Navigate to Project

```bash
cd /home/peter/Desktop/project/hospital
```

### Step 2: Backend Setup

#### Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all backend dependencies listed in `package.json`.

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/hospital
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
API_VERSION=v1
LOG_LEVEL=debug
```

#### Start Backend Server

```bash
npm start
```

The backend server will run on `http://localhost:5000`

### Step 3: Frontend Setup

#### Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install all frontend dependencies listed in `package.json`.

#### Environment Configuration (if needed)

Create `.env.local` file in frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Hospital Management System
```

#### Start Frontend Development Server

```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`

## Dependencies

### Backend Dependencies

```json
{
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "joi": "^17.9.1",
    "express-validator": "^7.0.0",
    "axios": "^1.4.0"
}
```

### Backend Dev Dependencies

```json
{
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
}
```

### Frontend Dependencies

```json
{
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.4.0",
    "react-router-dom": "^6.12.0",
    "vite": "^4.3.9"
}
```

### Frontend Dev Dependencies

```json
{
    "tailwindcss": "^3.3.2",
    "postcss": "^8.4.24",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.43.0",
    "eslint-plugin-react": "^7.32.2",
    "@vitejs/plugin-react": "^4.0.0"
}
```

## Features

### 👥 Patient Management
- Create, read, update, and delete patient records
- Track patient medical history
- Store patient contact information and demographics
- Search and filter patient database
- Patient admission and discharge management

### 👨‍⚕️ Doctor Management
- Manage doctor profiles and specializations
- Track doctor availability and schedules
- Assign doctors to patients
- View doctor performance metrics
- Department and specialty management

### 💊 Medicine Inventory
- Maintain medicine catalog and stock levels
- Track medicine expiration dates
- Low stock alerts and notifications
- Medicine pricing and batch management
- Supplier information and purchase orders

### 📋 Prescription Management
- Create and manage prescriptions
- Link prescriptions to patients and doctors
- Track prescription fulfillment
- Medicine dosage and duration specifications
- Prescription history and archives

### 💳 Payment & Billing
- Generate patient bills and invoices
- Track payment status and history
- Multiple payment method support
- Automated billing calculations
- Payment reconciliation and reports

### 📊 Reporting & Dashboard
- Comprehensive dashboard with key metrics
- Patient statistics and analytics
- Revenue and billing reports
- Doctor performance analysis
- Medicine inventory reports
- Monthly and annual trend analysis

## Running the Application

### Development Mode

**Terminal 1 - Backend**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
# Application runs on http://localhost:5173
```

### Production Mode

**Build Frontend**
```bash
cd frontend
npm run build
```

**Start Backend (Production)**
```bash
cd backend
NODE_ENV=production npm start
```

### Access the Application

Open your web browser and navigate to:
```
http://localhost:5173
```

## API Endpoints

### Patients
- `GET /api/v1/patients` - List all patients
- `POST /api/v1/patients` - Create new patient
- `GET /api/v1/patients/:id` - Get patient details
- `PUT /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient

### Doctors
- `GET /api/v1/doctors` - List all doctors
- `POST /api/v1/doctors` - Create new doctor
- `GET /api/v1/doctors/:id` - Get doctor details
- `PUT /api/v1/doctors/:id` - Update doctor
- `DELETE /api/v1/doctors/:id` - Delete doctor

### Medicines
- `GET /api/v1/medicines` - List all medicines
- `POST /api/v1/medicines` - Add new medicine
- `GET /api/v1/medicines/:id` - Get medicine details
- `PUT /api/v1/medicines/:id` - Update medicine
- `DELETE /api/v1/medicines/:id` - Delete medicine

### Prescriptions
- `GET /api/v1/prescriptions` - List prescriptions
- `POST /api/v1/prescriptions` - Create prescription
- `GET /api/v1/prescriptions/:id` - Get prescription details
- `PUT /api/v1/prescriptions/:id` - Update prescription
- `DELETE /api/v1/prescriptions/:id` - Delete prescription

### Payments
- `GET /api/v1/payments` - List all payments
- `POST /api/v1/payments` - Record new payment
- `GET /api/v1/payments/:id` - Get payment details
- `PUT /api/v1/payments/:id` - Update payment status

## Environment Configuration

### Backend .env Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development/production |
| `DATABASE_URL` | Database connection string | mongodb://localhost:27017/hospital |
| `JWT_SECRET` | JWT signing key | your_secret_key_123 |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:5173 |
| `API_VERSION` | API version prefix | v1 |
| `LOG_LEVEL` | Logging level | debug/info/warn/error |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:5000/api |
| `VITE_APP_NAME` | Application name | Hospital Management System |

## Project Structure Details

### Backend Structure

- **server.js**: Main entry point, initializes Express server and middleware
- **package.json**: Node.js dependencies and scripts
- **.env**: Environment variables (sensitive data)
- **.env.example**: Template for environment variables
- **.gitignore**: Files to exclude from Git

### Frontend Structure

- **src/components**: Reusable React components
    - Modal components for data entry
    - Header and Sidebar navigation
    - Dashboard content component
    
- **src/pages**: Page components for each feature
    - Patient management page
    - Doctor management page
    - Medicine inventory page
    - Prescription page
    - Billing and payment pages
    - Reporting page

- **src/assets**: Images, icons, and static files
- **public/**: Public assets served directly
- **vite.config.js**: Vite build configuration
- **tailwind.config.js**: Tailwind CSS customization
- **postcss.config.js**: PostCSS plugins configuration
- **eslint.config.js**: Code linting rules

## Troubleshooting

### Backend Issues

**Port already in use**
```bash
# Change PORT in .env file or kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Database connection error**
```bash
# Verify DATABASE_URL in .env
# Ensure database service is running
# Check database credentials
```

**Module not found**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Vite port conflict**
```bash
# Frontend will automatically use port 5174 if 5173 is taken
# Or specify port: npm run dev -- --port 3000
```

**Tailwind CSS not working**
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**ESLint errors**
```bash
cd frontend
npm run lint -- --fix
```

### General Issues

**CORS errors**
- Ensure `VITE_API_URL` matches backend `CORS_ORIGIN` in .env

**Hot reload not working**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart development servers

