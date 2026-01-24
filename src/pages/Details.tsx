import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Calendar, Star, Bookmark } from 'lucide-react';
import { getMediaDetails } from '../services/tmdb';
import { getContinueWatchingItem } from '../services/storage';

import { watchlistApi } from '../services/watchlist';
import { useAuth } from '../contexts/AuthContext';
import { BadgePills } from '../components/BadgePills';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EpisodeSelector } from '../components/EpisodeSelector';
import { MediaItem } from '../types/media';

export function Details() {
    const { type, tmdbId } = useParams<{ type: string; tmdbId: string }>();
    const navigate = useNavigate();
    const episodesRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuth();
    const [media, setMedia] = useState<MediaItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isInWatchlist, setIsInWatchlist] = useState(false);

    const fetchDetails = async () => {
        if (!type || !tmdbId || (type !== 'movie' && type !== 'tv')) {
            setError('Invalid media type or ID');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getMediaDetails(type as 'movie' | 'tv', parseInt(tmdbId));

            // Merge with continue watching data
            const watchData = getContinueWatchingItem(parseInt(tmdbId));
            if (watchData) {
                data.continueWatching = {
                    progress: watchData.progress,
                    season: watchData.season,
                    episode: watchData.episode,
                };
            }

            setMedia(data);
        } catch (err) {
            console.error('Error fetching media details:', err);
            setError(err instanceof Error ? err.message : 'Failed to load media details');
        } finally {
            setLoading(false);
        }
    };

    // Fetch watchlist status for logged in users
    useEffect(() => {
        const fetchWatchlist = async () => {
            if (!isAuthenticated || !tmdbId) return;

            try {
                const watchlist = await watchlistApi.getAll();
                const numericTmdbId = parseInt(tmdbId);
                setIsInWatchlist(watchlist.some((w: any) => w.tmdb_id === numericTmdbId));
            } catch (err) {
                console.error('Error fetching watchlist:', err);
            }
        };

        fetchWatchlist();
    }, [isAuthenticated, tmdbId]);

    useEffect(() => {
        fetchDetails();
    }, [type, tmdbId]);



    const toggleWatchlist = async () => {
        if (!media || !isAuthenticated) return;

        try {
            if (isInWatchlist) {
                await watchlistApi.remove(media.tmdbId, media.type);
                setIsInWatchlist(false);
            } else {
                await watchlistApi.add(media.tmdbId, media.type);
                setIsInWatchlist(true);
            }
        } catch (err) {
            console.error('Error toggling watchlist:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !media) {
        return (
            <div className="min-h-screen bg-black">
                <ErrorMessage
                    message={error || 'Content not found'}
                    onRetry={fetchDetails}
                />
            </div>
        );
    }

    const handlePlay = () => {
        if (media.type === 'movie') {
            navigate(`/watch/movie/${media.tmdbId}`);
        } else {
            const season = media.continueWatching?.season || 1;
            const episode = media.continueWatching?.episode || 1;
            navigate(`/watch/tv/${media.tmdbId}/${season}/${episode}`);
        }
    };

    const scrollToEpisodes = () => {
        episodesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Backdrop Header */}
            <div className="relative h-[60vh] min-h-[500px]">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={media.backdropUrl}
                        alt={media.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-24 left-8 z-10 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            {media.title}
                        </h1>
                        <BadgePills
                            rating={media.rating}
                            year={media.year}
                            genres={media.genres}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* Action Buttons */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={handlePlay}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                        <Play className="w-6 h-6 fill-black" />
                        <span>Play Now</span>
                    </button>

                    {/* Watchlist Button - Logged In Only */}
                    {isAuthenticated && (
                        <button
                            onClick={toggleWatchlist}
                            className={`flex items-center gap-2 px-6 py-3 font-medium text-base rounded-lg border-2 transition-all duration-200 ${isInWatchlist
                                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                                : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 backdrop-blur-sm'
                                }`}
                        >
                            <Bookmark className={`w-5 h-5 ${isInWatchlist ? 'fill-current' : ''}`} />
                            <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                        </button>
                    )}

                    {/* Browse Episodes Button - TV Shows Only */}
                    {media.type === 'tv' && (
                        <button
                            onClick={scrollToEpisodes}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium text-base rounded-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
                        >
                            <span>Browse Episodes</span>
                        </button>
                    )}
                </div>

                {/* Overview */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
                        {media.overview}
                    </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-dark-700 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-white font-semibold">Rating</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {media.rating.toFixed(1)}/10
                        </p>
                    </div>

                    <div className="bg-dark-700 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-accent" />
                            <h3 className="text-white font-semibold">Release Year</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">{media.year}</p>
                    </div>

                    <div className="bg-dark-700 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-5 h-5 bg-accent rounded" />
                            <h3 className="text-white font-semibold">Type</h3>
                        </div>
                        <p className="text-2xl font-bold text-white capitalize">
                            {media.type}
                        </p>
                    </div>
                </div>

                {/* Genres */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">Genres</h2>
                    <div className="flex flex-wrap gap-3">
                        {media.genres.map((genre) => (
                            <span
                                key={genre}
                                className="px-4 py-2 bg-dark-700 text-white rounded-full border border-white/10"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Episodes Section - TV Shows Only */}
                {media.type === 'tv' && (
                    <div ref={episodesRef} className="mb-12 scroll-mt-24">
                        <h2 className="text-2xl font-bold text-white mb-6">Episodes</h2>
                        <EpisodeSelector
                            tmdbId={media.tmdbId}
                            totalSeasons={media.numberOfSeasons || 1}
                            defaultSeason={media.continueWatching?.season || 1}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
