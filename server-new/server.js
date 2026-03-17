import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';


import connectDB from './config/database.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import videoRoutes from './routes/video.routes.js';
import commentRoutes from './routes/comment.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import achievementRoutes from './routes/achievement.routes.js';
import transcriptionRoutes from './routes/transcription.routes.js'
import watchPartyRoutes from './routes/watchParty.routes.js'


// Load env variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;
const FE_URL = process.env.FE_URL || 'http://localhost:3000';

// Security middleware
app.use(helmet());

const __dirname = path.resolve();
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// CORS
app.use(cors({
  origin: [FE_URL, 'http://localhost:3000', "https://devido.live", "https://www.devido.live"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Devido API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/transcripts', transcriptionRoutes);
app.use('/api/watch-parties', watchPartyRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${FE_URL}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;
