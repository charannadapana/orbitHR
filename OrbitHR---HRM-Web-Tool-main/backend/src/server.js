import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function startServer() {
  // Start listening immediately so the API is available (prevents CONNECTION_REFUSED)
  const server = app.listen(env.port, () => {
    console.log(`[Server] Running on http://localhost:${env.port}`);
    console.log(`[Server] Environment: ${env.nodeEnv}`);
  });

  // Attempt database connection in the background
  try {
    await connectDB();
  } catch (error) {
    console.error('--- Critical DB Error ---');
    console.error('The server is RUNNING but the database is UNREACHABLE.');
    console.error('Check your Atlas credentials and IP whitelist.');
  }
}

startServer();
