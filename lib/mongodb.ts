import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Connecting to MongoDB...');
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${cached.conn.connection.db?.databaseName || 'N/A'}`);
    console.log(`🌐 Host: ${cached.conn.connection.host}`);
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection failed:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
