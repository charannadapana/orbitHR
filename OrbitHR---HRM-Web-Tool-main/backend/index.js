import app from './src/app.js';
import { connectDB } from './src/config/db.js';

// Vercel Serverless Function entry point
export default async (req, res) => {
  try {
    // Ensure DB is connected for every request (using the idempotent check)
    await connectDB();
    
    // Pass the request to the Express app
    return app(req, res);
  } catch (error) {
    console.error('SERVERLESS_ERROR:', error);
    
    // Add manual CORS headers so the browser allows the frontend to see this error
    const allowedOrigin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    res.status(500).json({
      success: false,
      message: 'Critical server initialization failure',
      error: error.message
    });
  }
};
