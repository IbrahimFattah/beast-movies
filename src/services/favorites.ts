import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface FavoriteItem {
    id: number;
    user_id: number;
    tmdb_id: number;
    media_type: 'movie' | 'tv';
    added_at: string;
}

export const favoritesApi = {
    async getAll(): Promise<FavoriteItem[]> {
        const response = await axios.get(`${API_URL}/favorites`, {
            withCredentials: true,
        });
        return response.data.favorites;
    },

    async add(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
        await axios.post(
            `${API_URL}/favorites`,
            { tmdbId, mediaType },
            { withCredentials: true }
        );
    },

    async remove(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
        await axios.delete(`${API_URL}/favorites/${tmdbId}`, {
            params: { mediaType },
            withCredentials: true,
        });
    },
};
