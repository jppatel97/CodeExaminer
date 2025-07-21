const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error');
const mongoose = require('mongoose');
const Exam = require('./src/models/Exam');
const { initializeEditorSocket } = require('./src/editorSocket');
const executeRoutes = require('./src/routes/execute');

// Load env vars
dotenv.config();

// Check for required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV === 'production') {
    console.error('Continuing without required env vars in production');
  } else {
    process.exit(1);
  }
}

// Connect to database
const initializeDB = async () => {
  try {
    await connectDB();
    
    // Drop all indexes from exams collection
    const collections = await mongoose.connection.db.collections();
    const examsCollection = collections.find(c => c.collectionName === 'exams');
    if (examsCollection) {
      await examsCollection.dropIndexes();
      console.log('All indexes dropped successfully');
    }
    
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Initialize DB only if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  initializeDB();
}

// Route files
const auth = require('./src/routes/auth');
const exam = require('./src/routes/exam');
const contact = require('./src/routes/contact');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS with production settings
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://code-examiner.vercel.app',
        'https://code-examiner-ptkqwusn8-jeet-patels-projects-57eef44f.vercel.app',
        'https://code-examiner-la6uu6git-jeet-patels-projects-57eef44f.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
      ]
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    socketPath: '/editor-socket'
  });
});

// Socket.IO status endpoint
app.get('/socket-status', (req, res) => {
  res.status(200).json({ 
    socketEnabled: true,
    path: '/editor-socket',
    transports: ['websocket', 'polling']
  });
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/exams', exam);
app.use('/api/contact', contact);
app.use('/api/execute', executeRoutes);

// Error handler
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO for collaborative editor
const io = initializeEditorSocket(server);

// For Vercel serverless deployment
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // For local development
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Socket.IO available at: http://localhost:${PORT}/editor-socket`);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
} 