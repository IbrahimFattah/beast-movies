import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import favoritesRoutes from './routes/favorites';
import continueWatchingRoutes from './routes/continueWatching';
import watchlistRoutes from './routes/watchlist';
import watchlistHistoryRoutes from './routes/watchlistHistory';
import watchedRoutes from './routes/watched';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
// Get allowed origins from environment variable or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3005'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, curl, or same-origin)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Global request timeout - no request should hang longer than 15 seconds
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setTimeout(15000, () => {
        console.error(`Request timeout: ${req.method} ${req.path}`);
        if (!res.headersSent) {
            res.status(408).json({ message: 'Request timeout' });
        }
    });
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/continue-watching', continueWatchingRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/watchlist-history', watchlistHistoryRoutes);
app.use('/api/watched', watchedRoutes);

// Health check - also checks DB connectivity
app.get('/health', async (req: express.Request, res: express.Response) => {
    try {
        const pool = (await import('./config/database')).default;
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
        res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
    }
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
