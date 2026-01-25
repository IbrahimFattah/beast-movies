import { StreamingEmbedParams } from './vidsrc';

/**
 * Builds a VidKing.net embed URL for movies and TV shows
 * @param params - Configuration for the embed
 * @returns Complete embed URL string
 */
export function buildVidKingEmbedUrl(params: StreamingEmbedParams): string {
    const { type, tmdbId, season, episode } = params;

    const baseUrl = 'https://www.vidking.net/embed';
    const color = 'ffa500'; // Orange theme color

    if (type === 'movie') {
        return `${baseUrl}/movie/${tmdbId}?color=${color}`;
    } else {
        if (!season || !episode) {
            throw new Error('Season and episode required for TV shows');
        }
        return `${baseUrl}/tv/${tmdbId}/${season}/${episode}?color=${color}`;
    }
}
