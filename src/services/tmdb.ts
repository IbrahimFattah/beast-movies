import {
    TMDBMovie,
    TMDBTVShow,
    TMDBMovieDetails,
    TMDBTVShowDetails,
    TMDBResponse,
    MediaItem,
    TMDBSeasonDetails,
    TMDBEpisode,
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
        .filter((item: any) => {
            // Filter out people explicitly by media_type
            if (item.media_type === 'person') {
                return false;
            }
            // Filter out items without vote_average (prevents .toFixed() crash)
            if (item.vote_average === undefined || item.vote_average === null) {
                return false;
            }
            // Must be either a movie or TV show
            return 'title' in item || 'name' in item;
        })
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

/**
 * Get next episode information for auto-play
 * Returns null if there is no next episode (end of series)
 */
export async function getNextEpisode(
    tmdbId: number,
    currentSeason: number,
    currentEpisode: number
): Promise<{ season: number; episode: number; data: TMDBEpisode; runtime?: number } | null> {
    try {
        // First, fetch the current season details
        const currentSeasonData = await getTVSeasonDetails(tmdbId, currentSeason);

        // Check if there's a next episode in the current season
        const nextEpisodeInSeason = currentSeasonData.episodes.find(
            ep => ep.episode_number === currentEpisode + 1
        );

        if (nextEpisodeInSeason) {
            // Next episode exists in current season
            return {
                season: currentSeason,
                episode: nextEpisodeInSeason.episode_number,
                data: nextEpisodeInSeason,
            };
        }

        // No next episode in current season, try next season
        try {
            const nextSeasonData = await getTVSeasonDetails(tmdbId, currentSeason + 1);

            // Get the first episode of the next season
            if (nextSeasonData.episodes.length > 0) {
                const firstEpisode = nextSeasonData.episodes[0];
                return {
                    season: currentSeason + 1,
                    episode: firstEpisode.episode_number,
                    data: firstEpisode,
                };
            }
        } catch (err) {
            // Next season doesn't exist - this is the last episode of the series
            return null;
        }

        // No next episode found
        return null;
    } catch (err) {
        console.error('Error fetching next episode:', err);
        return null;
    }
}

/**
 * Get episode runtime estimation from TV show details
 */
export async function getEpisodeRuntime(tmdbId: number): Promise<number> {
    try {
        const tvDetails = await fetchFromTMDB<TMDBTVShowDetails>(`/tv/${tmdbId}`);
        // Return average runtime (in minutes), default to 45 if not available
        return tvDetails.episode_run_time?.[0] || 45;
    } catch (err) {
        console.error('Error fetching episode runtime:', err);
        return 45; // Default to 45 minutes
    }
}

// Browse/Discover functions

/**
 * Discover movies and TV shows with filters
 */
export async function discoverMulti(
    type: 'movie' | 'tv' | 'all',
    filters: {
        genre?: number;
        year?: number;
        page?: number;
    } = {}
): Promise<MediaItem[]> {
    const page = filters.page || 1;
    const results: MediaItem[] = [];

    if (type === 'all' || type === 'movie') {
        const params: Record<string, string> = { page: page.toString() };
        if (filters.genre) params.with_genres = filters.genre.toString();
        if (filters.year) params.primary_release_year = filters.year.toString();

        const movieData = await fetchFromTMDB<TMDBResponse<TMDBMovie>>('/discover/movie', params);
        results.push(...movieData.results.map(mapMovieToMediaItem));
    }

    if (type === 'all' || type === 'tv') {
        const params: Record<string, string> = { page: page.toString() };
        if (filters.genre) params.with_genres = filters.genre.toString();
        if (filters.year) params.first_air_date_year = filters.year.toString();

        const tvData = await fetchFromTMDB<TMDBResponse<TMDBTVShow>>('/discover/tv', params);
        results.push(...tvData.results.map(mapTVShowToMediaItem));
    }

    return results;
}

/**
 * Get all available genres for movies and TV shows
 */
export async function getAllGenres(): Promise<{ id: number; name: string }[]> {
    const [movieGenres, tvGenres] = await Promise.all([
        fetchFromTMDB<{ genres: { id: number; name: string }[] }>('/genre/movie/list'),
        fetchFromTMDB<{ genres: { id: number; name: string }[] }>('/genre/tv/list'),
    ]);

    // Combine and deduplicate genres
    const genreMap = new Map<number, string>();
    [...movieGenres.genres, ...tvGenres.genres].forEach(genre => {
        genreMap.set(genre.id, genre.name);
    });

    return Array.from(genreMap.entries()).map(([id, name]) => ({ id, name }));
}

/**
 * Get available watch providers (stub for now)
 */
export async function getWatchProviders(): Promise<{ provider_id: number; provider_name: string; logo_path: string }[]> {
    // For now, return empty array since we're not using providers in filtering
    return [];
}
