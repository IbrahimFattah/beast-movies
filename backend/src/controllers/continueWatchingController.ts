import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getContinueWatching = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT tmdb_id as "tmdbId", media_type as "type", progress, season, episode, 
                    EXTRACT(EPOCH FROM last_watched) * 1000 as "lastWatched"
             FROM continue_watching 
             WHERE user_id = $1 
             ORDER BY last_watched DESC
             LIMIT 20`,
            [req.userId]
        );

        res.json({ items: result.rows });
    } catch (error) {
        console.error('Get continue watching error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const upsertContinueWatching = async (req: AuthRequest, res: Response) => {
    try {
        const { tmdbId, mediaType, progress, season, episode } = req.body;

        if (!tmdbId || !mediaType) {
            return res.status(400).json({ message: 'tmdbId and mediaType are required' });
        }

        if (progress !== undefined && (progress < 0 || progress > 100)) {
            return res.status(400).json({ message: 'progress must be between 0 and 100' });
        }

        const result = await pool.query(
            `INSERT INTO continue_watching (user_id, tmdb_id, media_type, progress, season, episode, last_watched)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id, tmdb_id) 
             DO UPDATE SET 
                media_type = EXCLUDED.media_type,
                progress = EXCLUDED.progress,
                season = EXCLUDED.season,
                episode = EXCLUDED.episode,
                last_watched = CURRENT_TIMESTAMP
             RETURNING tmdb_id as "tmdbId", media_type as "type", progress, season, episode`,
            [req.userId, tmdbId, mediaType, progress || 0, season || null, episode || null]
        );

        res.status(201).json({ item: result.rows[0] });
    } catch (error) {
        console.error('Upsert continue watching error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeContinueWatching = async (req: AuthRequest, res: Response) => {
    try {
        const { tmdbId } = req.params;

        await pool.query(
            'DELETE FROM continue_watching WHERE user_id = $1 AND tmdb_id = $2',
            [req.userId, tmdbId]
        );

        res.json({ message: 'Removed from continue watching' });
    } catch (error) {
        console.error('Remove continue watching error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
