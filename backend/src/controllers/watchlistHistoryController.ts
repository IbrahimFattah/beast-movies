import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getWatchlistHistory = async (req: AuthRequest, res: Response) => {
    try {
        // Return history entries from the last 30 days
        const result = await pool.query(
            `SELECT * FROM watchlist_history 
             WHERE user_id = $1 AND action_at >= NOW() - INTERVAL '30 days' 
             ORDER BY action_at DESC`,
            [req.userId]
        );

        res.json({ history: result.rows });
    } catch (error) {
        console.error('Get watchlist history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
