import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getWatchlist = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM watchlists WHERE user_id = $1 ORDER BY added_at DESC',
            [req.userId]
        );

        res.json({ watchlist: result.rows });
    } catch (error) {
        console.error('Get watchlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addToWatchlist = async (req: AuthRequest, res: Response) => {
    try {
        const { tmdbId, mediaType } = req.body;

        if (!tmdbId || !mediaType) {
            return res.status(400).json({ message: 'tmdbId and mediaType are required' });
        }

        const result = await pool.query(
            'INSERT INTO watchlists (user_id, tmdb_id, media_type) VALUES ($1, $2, $3) ON CONFLICT (user_id, tmdb_id, media_type) DO NOTHING RETURNING *',
            [req.userId, tmdbId, mediaType]
        );

        res.status(201).json({ item: result.rows[0] });
    } catch (error) {
        console.error('Add to watchlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response) => {
    try {
        const { tmdbId } = req.params;
        const { mediaType } = req.query;

        await pool.query(
            'DELETE FROM watchlists WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3',
            [req.userId, tmdbId, mediaType]
        );

        res.json({ message: 'Removed from watchlist' });
    } catch (error) {
        console.error('Remove from watchlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
