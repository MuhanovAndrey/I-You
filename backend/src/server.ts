import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

// IMPORTANT:
// In CommonJS, TS `import` statements are executed (required) before any code runs.
// Many local modules read process.env on import (e.g., Telegram bot config), so we must
// load dotenv before requiring those modules.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const authRoutes = require('./routes/auth.routes').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const userRoutes = require('./routes/user.routes').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const loveReasonRoutes = require('./routes/loveReason.routes').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const giftIdeaRoutes = require('./routes/giftIdea.routes').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const statePostRoutes = require('./routes/statePost.routes').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const reactionRoutes = require('./routes/reaction.routes').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const commentRoutes = require('./routes/comment.routes').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pairingRoutes = require('./routes/pairing.routes').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const telegramRoutes = require('./routes/telegram.routes').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const goalRoutes = require('./routes/goal.routes').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const telegramService = require('./services/telegram.service').default;

const app: Express = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }
}

const defaultFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([defaultFrontendUrl, ...corsOrigins]));

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl/postman) that don't send Origin.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/love-reasons', loveReasonRoutes);
app.use('/api/gift-ideas', giftIdeaRoutes);
app.use('/api/state-posts', statePostRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/pairing', pairingRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/goals', goalRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);

  // Ensure Telegram bot listeners are attached right away (polling mode).
  try {
    telegramService?.init?.();
  } catch (error) {
    console.error('Telegram init error:', error);
  }
});

export default app;
