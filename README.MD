
# Hospital Management System

A full-stack hospital management application with patient, doctor, medicine, and billing management.

## Project Structure

```
hospital/
├── backend/          # Node.js REST API
└── frontend/         # React + Vite web application
```

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React, Vite, Tailwind CSS, ESLint
- **Database**: (Configure in `.env`)

## Installation

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm start
```

**Dependencies**: Check `backend/package.json`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Dependencies**: React, Vite, Tailwind CSS, PostCSS

## Features

- 👥 Patient Management
- 👨‍⚕️ Doctor Management
- 💊 Medicine Inventory
- 📋 Prescription Management
- 💳 Payment & Billing
- 📊 Reporting & Dashboard

## Running the Application

1. Start backend: `npm start` (in backend folder)
2. Start frontend: `npm run dev` (in frontend folder)
3. Open `http://localhost:5173` in your browser

## Project Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment variables template |
| `server.js` | Backend entry point |
| `vite.config.js` | Frontend build configuration |
| `tailwind.config.js` | Tailwind CSS setup |
