import {
    TMDBMovie,
    TMDBTVShow,
    TMDBMovieDetails,
    TMDBTVShowDetails,
    TMDBResponse,
    MediaItem,
    TMDBSeasonDetails,
} from '../types/media';

// Environment variables
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

// Image size configurations
export const IMAGE_SIZES = {
    poster: 'w500',
    backdrop: 'w1280',
    posterSmall: 'w342',
    backdropSmall: 'w780',
};

// Helper to build image URL
export function buildImageUrl(path: string | null, size: string = IMAGE_SIZES.backdrop): string {
    if (!path) {
        // Return placeholder for missing images
        return 'https://placehold.co/1920x1080/0a0a0a/404040?text=No+Image';
    }
    return `${IMAGE_BASE_URL}/${size}${path}`;
}

// Helper to make API requests
async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!API_KEY) {
        throw new Error('TMDB API key is not configured. Please add VITE_TMDB_API_KEY to your .env file.');
    }

    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Map TMDB movie to MediaItem
function mapMovieToMediaItem(movie: TMDBMovie | TMDBMovieDetails): MediaItem {
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
    const genres = 'genres' in movie
        ? movie.genres.map(g => g.name)
        : []; // For list responses, we'd need to map genre_ids

    return {
        id: movie.id.toString(),
        type: 'movie',
        tmdbId: movie.id,
        title: movie.title,
        year,
        rating: Math.round(movie.vote_average * 10) / 10,
        genres,
        overview: movie.overview,
        posterUrl: buildImageUrl(movie.poster_path, IMAGE_SIZES.poster),
        backdropUrl: buildImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop),
    };
}

// Map TMDB TV show to MediaItem
function mapTVShowToMediaItem(tvShow: TMDBTVShow | TMDBTVShowDetails): MediaItem {
    const year = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 0;
    const genres = 'genres' in tvShow
        ? tvShow.genres.map(g => g.name)
        : [];

    return {
        id: `tv-${tvShow.id}`,
        type: 'tv',
        tmdbId: tvShow.id,
        title: tvShow.name,
        year,
        rating: tvShow.vote_average,
        genres,
        overview: tvShow.overview,
        posterUrl: buildImageUrl(tvShow.poster_path, IMAGE_SIZES.poster),
        backdropUrl: buildImageUrl(tvShow.backdrop_path, IMAGE_SIZES.backdrop),
        numberOfSeasons: 'number_of_seasons' in tvShow ? tvShow.number_of_seasons : undefined,
    };
}

// API Functions

/**
 * Get trending content (movies and TV shows)
 */
export async function getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<MediaItem[]> {
    const data = await fetchFromTMDB<TMDBResponse<TMDBMovie | TMDBTVShow>>(
        `/trending/all/${timeWindow}`
    );

    return data.results.map(item => {
        if ('title' in item) {
            return mapMovieToMediaItem(item as TMDBMovie);
        } else {
            return mapTVShowToMediaItem(item as TMDBTVShow);
        }
    });
}

/**
 * Get popular movies
 */
export async function getPopularMovies(page: number = 1): Promise<MediaItem[]> {
    const data = await fetchFromTMDB<TMDBResponse<TMDBMovie>>('/movie/popular', {
        page: page.toString(),
    });

    return data.results.map(mapMovieToMediaItem);
}

/**
 * Get popular TV shows
 */
export async function getPopularTVShows(page: number = 1): Promise<MediaItem[]> {
    const data = await fetchFromTMDB<TMDBResponse<TMDBTVShow>>('/tv/popular', {
        page: page.toString(),
    });

    return data.results.map(mapTVShowToMediaItem);
}

/**
 * Get top rated movies
 */
export async function getTopRatedMovies(page: number = 1): Promise<MediaItem[]> {
    const data = await fetchFromTMDB<TMDBResponse<TMDBMovie>>('/movie/top_rated', {
        page: page.toString(),
    });

    return data.results.map(mapMovieToMediaItem);
}

/**
 * Get movie details by TMDB ID
 */
export async function getMovieDetails(tmdbId: number): Promise<MediaItem> {
    const data = await fetchFromTMDB<TMDBMovieDetails>(`/movie/${tmdbId}`);
    return mapMovieToMediaItem(data);
}

/**
 * Get TV show details by TMDB ID
 */
export async function getTVShowDetails(tmdbId: number): Promise<MediaItem> {
    const data = await fetchFromTMDB<TMDBTVShowDetails>(`/tv/${tmdbId}`);
    return mapTVShowToMediaItem(data);
}

/**
 * Search for movies and TV shows
 */
export async function searchMulti(query: string, page: number = 1): Promise<MediaItem[]> {
    const data = await fetchFromTMDB<TMDBResponse<TMDBMovie | TMDBTVShow>>('/search/multi', {
        query,
        page: page.toString(),
    });

    return data.results
        .filter(item => 'title' in item || 'name' in item) // Filter out people
        .map(item => {
            if ('title' in item) {
                return mapMovieToMediaItem(item as TMDBMovie);
            } else {
                return mapTVShowToMediaItem(item as TMDBTVShow);
            }
        });
}

/**
 * Get details for any media type (movie or TV show)
 */
export async function getMediaDetails(type: 'movie' | 'tv', tmdbId: number): Promise<MediaItem> {
    if (type === 'movie') {
        return getMovieDetails(tmdbId);
    } else {
        return getTVShowDetails(tmdbId);
    }
}

/**
 * Get TV show season details with episodes
 */
export async function getTVSeasonDetails(
    tmdbId: number,
    seasonNumber: number
): Promise<TMDBSeasonDetails> {
    return await fetchFromTMDB<TMDBSeasonDetails>(`/tv/${tmdbId}/season/${seasonNumber}`);
}
