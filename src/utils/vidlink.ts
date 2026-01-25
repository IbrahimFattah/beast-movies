import { StreamingEmbedParams } from './vidsrc';

/**
 * Builds a VidLink.pro embed URL for movies and TV shows
 * @param params - Configuration for the embed
 * @returns Complete embed URL string
 */
export function buildVidLinkEmbedUrl(params: StreamingEmbedParams): string {
    const { type, tmdbId, season, episode } = params;

    const baseUrl = 'https://vidlink.pro';
    const primaryColor = 'f4a029'; // Orange theme color
    const secondaryColor = 'd88a1f'; // Darker orange

    if (type === 'movie') {
        return `${baseUrl}/movie/${tmdbId}?primaryColor=${primaryColor}&secondaryColor=${secondaryColor}`;
    } else {
        if (!season || !episode) {
            throw new Error('Season and episode required for TV shows');
        }
        return `${baseUrl}/tv/${tmdbId}/${season}/${episode}?primaryColor=${primaryColor}&secondaryColor=${secondaryColor}`;
    }
}
