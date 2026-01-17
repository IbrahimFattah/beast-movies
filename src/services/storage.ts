import { MediaItem, ContinueWatchingItem } from '../types/media';

const CONTINUE_WATCHING_KEY = 'beast_movies_continue_watching';

/**
 * Get all continue watching items from localStorage
 */
export function getContinueWatching(): ContinueWatchingItem[] {
    try {
        const stored = localStorage.getItem(CONTINUE_WATCHING_KEY);
        if (!stored) return [];

        const items: ContinueWatchingItem[] = JSON.parse(stored);

        // Sort by last watched (most recent first)
        return items.sort((a, b) => b.lastWatched - a.lastWatched);
    } catch (error) {
        console.error('Error reading continue watching data:', error);
        return [];
    }
}

/**
 * Save or update continue watching progress
 */
export function saveContinueWatching(
    tmdbId: number,
    type: 'movie' | 'tv',
    progress: number,
    season?: number,
    episode?: number
): void {
    try {
        const items = getContinueWatching();

        // Find existing item or create new one
        const existingIndex = items.findIndex(item => item.tmdbId === tmdbId);

        const newItem: ContinueWatchingItem = {
            tmdbId,
            type,
            progress,
            season,
            episode,
            lastWatched: Date.now(),
        };

        if (existingIndex >= 0) {
            items[existingIndex] = newItem;
        } else {
            items.push(newItem);
        }

        // Keep only the 20 most recent items
        const limitedItems = items.slice(0, 20);

        localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(limitedItems));
    } catch (error) {
        console.error('Error saving continue watching data:', error);
    }
}

/**
 * Remove an item from continue watching
 */
export function removeContinueWatching(tmdbId: number): void {
    try {
        const items = getContinueWatching();
        const filtered = items.filter(item => item.tmdbId !== tmdbId);
        localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error removing continue watching item:', error);
    }
}

/**
 * Clear all continue watching data
 */
export function clearContinueWatching(): void {
    try {
        localStorage.removeItem(CONTINUE_WATCHING_KEY);
    } catch (error) {
        console.error('Error clearing continue watching data:', error);
    }
}

/**
 * Get continue watching item for a specific media
 */
export function getContinueWatchingItem(tmdbId: number): ContinueWatchingItem | null {
    const items = getContinueWatching();
    return items.find(item => item.tmdbId === tmdbId) || null;
}

/**
 * Merge continue watching data with MediaItems
 */
export function mergeContinueWatching(items: MediaItem[]): MediaItem[] {
    const continueWatchingMap = new Map(
        getContinueWatching().map(item => [item.tmdbId, item])
    );

    return items.map(item => {
        const watchData = continueWatchingMap.get(item.tmdbId);
        if (watchData) {
            return {
                ...item,
                continueWatching: {
                    progress: watchData.progress,
                    season: watchData.season,
                    episode: watchData.episode,
                },
            };
        }
        return item;
    });
}
