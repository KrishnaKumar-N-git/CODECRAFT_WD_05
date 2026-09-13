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
    await ensureAdminUsers();
  } catch (error) {
    console.error('? MongoDB connection error:', error.message);
    console.log('?? Will retry MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;

const ensureAdminUsers = async () => {
  try {
    const User = require('../models/User');
    // Ensure default admin user
    let defaultAdmin = await User.findOne({ email: 'admin@campusconnect.edu' });
    if (!defaultAdmin) {
      await User.create({
        username: 'admin',
        email: 'admin@campusconnect.edu',
        password: 'Admin@123',
        fullName: 'Campus Administrator',
        role: 'admin',
        department: 'Administration',
        college: 'CampusConnect HQ',
      });
      console.log('✅ Created default admin: admin@campusconnect.edu / Admin@123');
    } else if (defaultAdmin.role !== 'admin') {
      defaultAdmin.role = 'admin';
      await defaultAdmin.save();
    }

    // Also grant admin to raj@gmail.com and krishna accounts if they exist
    await User.updateMany(
      { email: { $in: ['raj@gmail.com', 'krishna@college.edu', 'krish1110kj@gmail.com'] } },
      { $set: { role: 'admin' } }
    );
  } catch (err) {
    console.error('Error in ensureAdminUsers:', err.message);
  }
};
