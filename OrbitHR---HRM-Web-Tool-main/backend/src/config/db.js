import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log('[DB] Using existing database connection');
      return;
    }

    const cleanUri = env.mongodbUri.trim().replace(/[\r\n\t]/g, '');
    
    // Better masking: show the protocol and the username, hide only the password
    // Format is mongodb+srv://username:password@host
    const maskedUri = cleanUri.replace(/:([^:]+)@/, ':****@');
    
    console.log(`[DB] Attempting connection to: ${maskedUri}`);
    
    const options = {
      serverSelectionTimeoutMS: 10000,
    };

    await mongoose.connect(cleanUri, options);
    
    console.log('[DB] --- MongoDB Connected Successfully ---');
  } catch (error) {
    console.error('[DB] --- MongoDB Connection Failed ---');
    console.error(`[DB] Error name: ${error.name}`);
    console.error(`[DB] Error message: ${error.message}`);
    throw error;
  }
}
