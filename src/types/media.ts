// TMDB API Response Types
export interface TMDBMovie {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    genre_ids: number[];
    vote_average: number;
    vote_count: number;
    popularity: number;
    adult: boolean;
    original_language: string;
}

export interface TMDBTVShow {
    id: number;
    name: string;
    original_name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    genre_ids: number[];
    vote_average: number;
    vote_count: number;
    popularity: number;
    origin_country: string[];
    original_language: string;
}

export interface TMDBMovieDetails extends TMDBMovie {
    genres: { id: number; name: string }[];
    runtime: number;
    budget: number;
    revenue: number;
    status: string;
    tagline: string;
}

export interface TMDBTVShowDetails extends TMDBTVShow {
    genres: { id: number; name: string }[];
    episode_run_time: number[];
    number_of_episodes: number;
    number_of_seasons: number;
    status: string;
    tagline: string;
    seasons: Array<{
        id: number;
        season_number: number;
        episode_count: number;
        name: string;
    }>;
}

// Episode and Season types for TV shows
export interface TMDBEpisode {
    id: number;
    episode_number: number;
    name: string;
    overview: string;
    still_path: string | null;
    air_date: string;
}

export interface TMDBSeasonDetails {
    id: number;
    season_number: number;
    name: string;
    episodes: TMDBEpisode[];
}

export interface TMDBResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

// Application Types
export interface MediaItem {
    id: string;
    type: 'movie' | 'tv';
    tmdbId: number;
    title: string;
    year: number;
    rating: number;
    genres: string[];
    overview: string;
    posterUrl: string;
    backdropUrl: string;
    numberOfSeasons?: number; // For TV shows only
    continueWatching?: {
        progress: number; // 0-100
        season?: number;
        episode?: number;
    };
}

export interface ContinueWatchingItem {
    tmdbId: number;
    type: 'movie' | 'tv';
    progress: number;
    season?: number;
    episode?: number;
    lastWatched: number; // timestamp
}
