interface VidSrcEmbedParams {
    type: 'movie' | 'tv';
    tmdbId: number;
    season?: number;
    episode?: number;
}

/**
 * Builds a VidSrc.pro embed URL for movies and TV shows
 * @param params - Configuration for the embed
 * @returns Complete embed URL string
 */
export function buildVidSrcEmbedUrl(params: VidSrcEmbedParams): string {
    const { type, tmdbId, season, episode } = params;

    const baseUrl = 'https://vidsrc.to/embed';

    if (type === 'movie') {
        return `${baseUrl}/movie/${tmdbId}`;
    } else {
        if (!season || !episode) {
            throw new Error('Season and episode required for TV shows');
        }
        return `${baseUrl}/tv/${tmdbId}/${season}/${episode}`;
    }
}
