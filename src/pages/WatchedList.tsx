import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Film, Tv } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { watchedApi, WatchedItem } from '../services/watched';
import { getMediaDetails } from '../services/tmdb';
import { MediaItem } from '../types/media';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

type FilterType = 'all' | 'movie' | 'tv';

interface WatchedEntry {
    watchedItem: WatchedItem;
    media: MediaItem;
}

export function WatchedList() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [entries, setEntries] = useState<WatchedEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [toggling, setToggling] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }

        fetchWatched();
    }, [isAuthenticated]);

    const fetchWatched = async () => {
        setLoading(true);
        setError(null);

        try {
            const watched = await watchedApi.getAll();

            // Fetch media details for all items in parallel
            const results = await Promise.all(
                watched.map(async (w: WatchedItem) => {
                    try {
                        const media = await getMediaDetails(w.media_type, w.tmdb_id);
                        return { watchedItem: w, media } as WatchedEntry;
                    } catch (err) {
                        console.error(`Failed to fetch details for ${w.media_type} ${w.tmdb_id}:`, err);
                        return null;
                    }
                })
            );

            setEntries(results.filter((r): r is WatchedEntry => r !== null));
        } catch (err) {
            console.error('Error fetching watched list:', err);
            setError(err instanceof Error ? err.message : 'Failed to load watched list');
        } finally {
            setLoading(false);
        }
    };

    const handleUnmark = async (entry: WatchedEntry) => {
        const tmdbId = entry.watchedItem.tmdb_id;
        setToggling(prev => new Set(prev).add(tmdbId));

        try {
            await watchedApi.unmark(tmdbId, entry.watchedItem.media_type);
            setEntries(prev => prev.filter(e => e.watchedItem.tmdb_id !== tmdbId || e.watchedItem.media_type !== entry.watchedItem.media_type));
        } catch (err) {
            console.error('Error unmarking as watched:', err);
        } finally {
            setToggling(prev => {
                const next = new Set(prev);
                next.delete(tmdbId);
                return next;
            });
        }
    };

    const filteredEntries = filter === 'all'
        ? entries
        : entries.filter(e => e.watchedItem.media_type === filter);

    const movieCount = entries.filter(e => e.watchedItem.media_type === 'movie').length;
    const tvCount = entries.filter(e => e.watchedItem.media_type === 'tv').length;

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
                <ErrorMessage message={error} onRetry={fetchWatched} />
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                            Watched Checklist
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {entries.length} title{entries.length !== 1 ? 's' : ''} watched
                            {movieCount > 0 && tvCount > 0 && (
                                <span> &middot; {movieCount} movie{movieCount !== 1 ? 's' : ''}, {tvCount} show{tvCount !== 1 ? 's' : ''}</span>
                            )}
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {(['all', 'movie', 'tv'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                    filter === f
                                        ? 'bg-accent text-white'
                                        : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
                                }`}
                            >
                                {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV Shows'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Checklist */}
                {filteredEntries.length > 0 ? (
                    <div className="space-y-3">
                        {filteredEntries.map((entry) => {
                            const isToggling = toggling.has(entry.watchedItem.tmdb_id);

                            return (
                                <div
                                    key={`${entry.watchedItem.media_type}-${entry.watchedItem.tmdb_id}`}
                                    className="flex items-center gap-4 p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors group"
                                >
                                    {/* Check toggle */}
                                    <button
                                        onClick={() => handleUnmark(entry)}
                                        disabled={isToggling}
                                        className="flex-shrink-0 text-green-400 hover:text-gray-400 transition-colors disabled:opacity-50"
                                        title="Unmark as watched"
                                    >
                                        {isToggling ? (
                                            <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-6 h-6" />
                                        )}
                                    </button>

                                    {/* Poster thumbnail */}
                                    <Link to={`/details/${entry.media.type}/${entry.media.tmdbId}`} className="flex-shrink-0">
                                        <img
                                            src={entry.media.posterUrl}
                                            alt={entry.media.title}
                                            className="w-12 h-[72px] object-cover rounded"
                                        />
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/details/${entry.media.type}/${entry.media.tmdbId}`}
                                            className="text-white font-medium hover:text-accent transition-colors truncate block"
                                        >
                                            {entry.media.title}
                                        </Link>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            {entry.media.type === 'movie' ? (
                                                <Film className="w-3.5 h-3.5" />
                                            ) : (
                                                <Tv className="w-3.5 h-3.5" />
                                            )}
                                            <span className="capitalize">{entry.media.type}</span>
                                            {entry.media.year > 0 && <span>&middot; {entry.media.year}</span>}
                                            {entry.media.rating > 0 && <span>&middot; {entry.media.rating.toFixed(1)}/10</span>}
                                        </div>
                                    </div>

                                    {/* Watched date */}
                                    <span className="flex-shrink-0 text-sm text-gray-500 hidden sm:block">
                                        Watched {formatDate(entry.watchedItem.watched_at)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Circle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {filter === 'all' ? 'No watched titles yet' : `No watched ${filter === 'movie' ? 'movies' : 'TV shows'} yet`}
                        </h3>
                        <p className="text-gray-400">
                            Mark movies and TV shows as watched from their details page.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
