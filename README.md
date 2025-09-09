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
git clone <your-repo-url>
cd face_attendance_prototype
npm install
```

### 3. Environment Configuration

1. Copy the environment template:
```bash
copy .env.example .env.local
```

2. Fill in your configuration in `.env.local`:

**MongoDB Atlas:**
- Create a cluster at https://cloud.mongodb.com/
- Get your connection string
- Replace `MONGODB_URI` with your connection string

**Face++ API:**
- Register at https://www.faceplusplus.com/
- Create an API key and secret
- Replace `FACEPP_API_KEY` and `FACEPP_API_SECRET`

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
4. Position face in the camera frame (follow the blue guides)
5. Click **Register Employee**
6. System will detect face and check quality
7. Registration complete when quality checks pass

### Clock-In Process

1. Navigate to **Clock In** page
2. Click **Start Camera**
3. Position face in the circular guide
4. Click **Clock In**
5. System verifies identity using FaceSet
6. Attendance recorded with timestamp

### Dashboard

- View all registered employees
- See recent clock-in logs
- Monitor system statistics

## Security Features

- ✅ **Face Quality Analysis** - Ensures clear, high-quality face images
- ✅ **FaceSet Management** - Efficient employee face storage and retrieval
- ✅ **Real-time Verification** - High accuracy face recognition
- ✅ **Secure Storage** - Only face embeddings stored, no raw images
- ✅ **Confidence Scoring** - Configurable thresholds for security levels

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

## Troubleshooting

**Camera not working:**
- Ensure browser permissions are granted
- Check if camera is already in use by another application
- Try refreshing the page

**Registration fails:**
- Ensure good lighting for face detection
- Keep face centered in the frame
- Verify Face++ API credentials

**Database connection issues:**
- Check MongoDB Atlas connection string
- Verify network access from your IP
- Ensure database user has proper permissions

## Production Deployment

1. Set up MongoDB Atlas production cluster
2. Configure Face++ API for production limits
3. Set production environment variables
4. Deploy to Vercel, Netlify, or your hosting platform
5. Ensure HTTPS for camera access

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please check the troubleshooting section or create an issue in the repository.
