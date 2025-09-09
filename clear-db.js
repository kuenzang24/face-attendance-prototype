// Simple Node.js script to clear the database collections
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://kuenzangdorji:T%4010punakha@face-recognition.8wxbm.mongodb.net/face_attendance?retryWrites=true&w=majority&appName=face-recognition";

async function clearDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop collections
    const db = mongoose.connection.db;
    
    try {
      await db.collection('employees').drop();
      console.log('Dropped employees collection');
    } catch (err) {
      console.log('Employees collection does not exist or already dropped');
    }

    try {
      await db.collection('clocklogs').drop();
      console.log('Dropped clocklogs collection');
    } catch (err) {
      console.log('ClockLogs collection does not exist or already dropped');
    }

    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

clearDatabase();
