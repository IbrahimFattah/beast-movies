import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface WatchedItem {
    id: number;
    user_id: number;
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    watched_at: string;
}

export const watchedApi = {
    async getAll(): Promise<WatchedItem[]> {
        const response = await axios.get(`${API_URL}/watched`, {
            withCredentials: true,
            timeout: 10000,
        });
        return response.data.watched;
    },

    async mark(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
        await axios.post(
            `${API_URL}/watched`,
            { tmdbId, mediaType },
            { withCredentials: true, timeout: 10000 }
        );
    },

    async unmark(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
        await axios.delete(`${API_URL}/watched/${tmdbId}`, {
            params: { mediaType },
            withCredentials: true,
            timeout: 10000,
        });
    },
};
