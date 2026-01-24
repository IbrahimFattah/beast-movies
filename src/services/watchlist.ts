import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface WatchlistItem {
    id: number;
    user_id: number;
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    added_at: string;
}

export const watchlistApi = {
    async getAll(): Promise<WatchlistItem[]> {
        const response = await axios.get(`${API_URL}/watchlist`, {
            withCredentials: true,
        });
        return response.data.watchlist;
    },

    async add(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
        await axios.post(
            `${API_URL}/watchlist`,
            { tmdbId, mediaType },
            { withCredentials: true }
        );
    },

    async remove(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
        await axios.delete(`${API_URL}/watchlist/${tmdbId}`, {
            params: { mediaType },
            withCredentials: true,
        });
    },
};
