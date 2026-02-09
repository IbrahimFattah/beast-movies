import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface WatchlistHistoryItem {
    id: number;
    user_id: number;
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    action: 'added' | 'removed';
    action_at: string;
}

export const watchlistHistoryApi = {
    async getHistory(): Promise<WatchlistHistoryItem[]> {
        const response = await axios.get(`${API_URL}/watchlist-history`, {
            withCredentials: true,
            timeout: 10000,
        });
        return response.data.history;
    },
};
