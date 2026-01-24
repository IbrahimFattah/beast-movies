import axios from 'axios';
import { ContinueWatchingItem } from '../types/media';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface ServerContinueWatchingItem {
    tmdbId: number;
    type: 'movie' | 'tv';
    progress: number;
    season?: number;
    episode?: number;
    lastWatched: number;
}

export const continueWatchingApi = {
    async getAll(): Promise<ContinueWatchingItem[]> {
        const response = await axios.get(`${API_URL}/continue-watching`, {
            withCredentials: true,
        });
        return response.data.items.map((item: ServerContinueWatchingItem) => ({
            tmdbId: item.tmdbId,
            type: item.type,
            progress: item.progress,
            season: item.season,
            episode: item.episode,
            lastWatched: item.lastWatched,
        }));
    },

    async upsert(
        tmdbId: number,
        mediaType: 'movie' | 'tv',
        progress: number,
        season?: number,
        episode?: number
    ): Promise<void> {
        await axios.post(
            `${API_URL}/continue-watching`,
            { tmdbId, mediaType, progress, season, episode },
            { withCredentials: true }
        );
    },

    async remove(tmdbId: number): Promise<void> {
        await axios.delete(`${API_URL}/continue-watching/${tmdbId}`, {
            withCredentials: true,
        });
    },
};
