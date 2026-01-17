import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getFavorites = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1 ORDER BY added_at DESC',
            [req.userId]
        );

        res.json({ favorites: result.rows });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addFavorite = async (req: AuthRequest, res: Response) => {
    try {
        const { tmdbId, mediaType } = req.body;

        if (!tmdbId || !mediaType) {
            return res.status(400).json({ message: 'tmdbId and mediaType are required' });
        }

        const result = await pool.query(
            'INSERT INTO favorites (user_id, tmdb_id, media_type) VALUES ($1, $2, $3) ON CONFLICT (user_id, tmdb_id, media_type) DO NOTHING RETURNING *',
            [req.userId, tmdbId, mediaType]
        );

        res.status(201).json({ favorite: result.rows[0] });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
    try {
        const { tmdbId } = req.params;
        const { mediaType } = req.query;

        await pool.query(
            'DELETE FROM favorites WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3',
            [req.userId, tmdbId, mediaType]
        );

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
