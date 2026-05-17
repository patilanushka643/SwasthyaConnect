const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing in environment variables.');
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      autoIndex: false,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB runtime error:', error.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect automatically...');
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
