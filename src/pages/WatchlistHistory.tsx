import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { watchlistApi, WatchlistItem } from '../services/watchlist';
import { watchlistHistoryApi, WatchlistHistoryItem } from '../services/watchlistHistory';
import { getMediaDetails } from '../services/tmdb';
import { MediaItem } from '../types/media';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { SectionTitle } from '../components/SectionTitle';
import { RowCarousel } from '../components/RowCarousel';

interface HistoryEntry {
    historyItem: WatchlistHistoryItem;
    media: MediaItem | null;
}

export function WatchlistHistory() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [currentItems, setCurrentItems] = useState<MediaItem[]>([]);
    const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }

        fetchData();
    }, [isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [watchlist, history] = await Promise.all([
                watchlistApi.getAll(),
                watchlistHistoryApi.getHistory(),
            ]);

            // Gather all unique tmdb IDs from both current watchlist and history
            const allIds = new Map<string, { tmdb_id: number; media_type: 'movie' | 'tv' }>();

            watchlist.forEach((w: WatchlistItem) => {
                allIds.set(`${w.media_type}-${w.tmdb_id}`, { tmdb_id: w.tmdb_id, media_type: w.media_type });
            });
            history.forEach((h: WatchlistHistoryItem) => {
                allIds.set(`${h.media_type}-${h.tmdb_id}`, { tmdb_id: h.tmdb_id, media_type: h.media_type });
            });

            // Fetch media details for all unique items in parallel
            const mediaMap = new Map<string, MediaItem>();
            const detailPromises = Array.from(allIds.values()).map(async ({ tmdb_id, media_type }) => {
                try {
                    const details = await getMediaDetails(media_type, tmdb_id);
                    mediaMap.set(`${media_type}-${tmdb_id}`, details);
                } catch (err) {
                    console.error(`Failed to fetch details for ${media_type} ${tmdb_id}:`, err);
                }
            });
            await Promise.all(detailPromises);

            // Build current watchlist items
            const current = watchlist
                .map((w: WatchlistItem) => mediaMap.get(`${w.media_type}-${w.tmdb_id}`))
                .filter((item): item is MediaItem => item !== null && item !== undefined);
            setCurrentItems(current);

            // Build history entries
            const entries: HistoryEntry[] = history.map((h: WatchlistHistoryItem) => ({
                historyItem: h,
                media: mediaMap.get(`${h.media_type}-${h.tmdb_id}`) || null,
            }));
            setHistoryEntries(entries);
        } catch (err) {
            console.error('Error fetching watchlist history:', err);
            setError(err instanceof Error ? err.message : 'Failed to load watchlist history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black">
                <ErrorMessage message={error} onRetry={fetchData} />
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white hover:text-accent transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
                    Watchlist History
                </h1>

                {/* Current Watchlist */}
                <section className="mb-12">
                    <SectionTitle title="Currently in Watchlist" />
                    {currentItems.length > 0 ? (
                        <RowCarousel items={currentItems} />
                    ) : (
                        <p className="text-gray-500 py-4">Your watchlist is currently empty.</p>
                    )}
                </section>

                {/* Activity Log - Last 30 Days */}
                <section className="mb-12">
                    <SectionTitle title="Last 30 Days Activity" />
                    {historyEntries.length > 0 ? (
                        <div className="space-y-3">
                            {historyEntries.map((entry) => (
                                <div
                                    key={entry.historyItem.id}
                                    className="flex items-center gap-4 p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                                >
                                    {/* Action icon */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                        entry.historyItem.action === 'added'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {entry.historyItem.action === 'added'
                                            ? <Plus className="w-5 h-5" />
                                            : <Minus className="w-5 h-5" />
                                        }
                                    </div>

                                    {/* Poster thumbnail */}
                                    {entry.media && (
                                        <Link to={`/details/${entry.media.type}/${entry.media.tmdbId}`} className="flex-shrink-0">
                                            <img
                                                src={entry.media.posterUrl}
                                                alt={entry.media.title}
                                                className="w-12 h-18 object-cover rounded"
                                            />
                                        </Link>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        {entry.media ? (
                                            <Link
                                                to={`/details/${entry.media.type}/${entry.media.tmdbId}`}
                                                className="text-white font-medium hover:text-accent transition-colors truncate block"
                                            >
                                                {entry.media.title}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400">Unknown title</span>
                                        )}
                                        <span className="text-sm text-gray-400 capitalize">
                                            {entry.historyItem.media_type}
                                        </span>
                                    </div>

                                    {/* Action label */}
                                    <span className={`flex-shrink-0 text-sm font-medium px-3 py-1 rounded-full ${
                                        entry.historyItem.action === 'added'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {entry.historyItem.action === 'added' ? 'Added' : 'Removed'}
                                    </span>

                                    {/* Timestamp */}
                                    <div className="flex-shrink-0 flex items-center gap-1 text-gray-500 text-sm">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatDate(entry.historyItem.action_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 py-4">No watchlist activity in the last 30 days.</p>
                    )}
                </section>
            </div>
        </div>
    );
}
