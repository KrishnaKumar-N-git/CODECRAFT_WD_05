const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('? MONGODB_URI is not defined in environment variables.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'campusconnect',
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`? MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('? MongoDB connection error:', error.message);
    console.log('?? Will retry MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
