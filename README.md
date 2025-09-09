# Face Recognition Clock-In MVP

A Next.js-based employee attendance system with Face++ face recognition and FaceSet management.

## Features

- 👤 **Employee Registration** with facial recognition setup
- 🕐 **Clock-In System** with face verification
- 🎯 **FaceSet Management** for efficient employee recognition
- 📊 **Dashboard** with attendance logs and analytics
- 🔍 **High Accuracy** facial recognition using Face++ API
- 🛡️ **Secure Storage** with embedding-only data (no raw images)

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas with Mongoose
- **Face Recognition**: Face++ API (Megvii)
- **Camera**: Browser MediaDevices API

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Face++ API account (free tier available)

### 2. Clone and Install

```bash
git clone https://github.com/kuenzang24/face-attendance-prototype.git
cd face-attendance-prototype
npm install
```

### 3. Environment Configuration

Create `.env.local` with:

```env
MONGODB_URI=your_mongodb_connection_string
FACEPP_API_KEY=your_facepp_api_key
FACEPP_API_SECRET=your_facepp_api_secret
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Usage Guide

### Employee Registration

1. Navigate to **Register** page
2. Fill in Employee ID and Name
3. Click **Start Camera** and grant camera permissions
4. Position face in the camera frame
5. Click **Register Employee**
6. System will detect face and check quality
7. Registration complete when quality checks pass

### Clock-In Process

1. Navigate to **Clock In** page
2. Click **Start Camera**
3. Position face in the camera frame
4. Click **Clock In**
5. System verifies identity using FaceSet
6. Attendance recorded with timestamp

### Dashboard

- View all registered employees
- See recent clock-in logs
- Monitor system statistics

## API Endpoints

- `POST /api/register` - Register new employee
- `POST /api/clockin` - Process clock-in attempt
- `GET /api/employees` - List all employees
- `GET /api/logs` - Get attendance logs

## Browser Requirements

- Modern browser with camera support
- HTTPS (required for camera access in production)
- JavaScript enabled

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

MIT License