import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { buildVidSrcEmbedUrl } from '../utils/vidsrc';
import { buildVidLinkEmbedUrl } from '../utils/vidlink';
import { buildVidKingEmbedUrl } from '../utils/vidking';
import { StreamingProvider, DEFAULT_PROVIDER } from '../types/streaming';
import { useAuth } from '../contexts/AuthContext';
import { saveContinueWatching } from '../services/storage';
import { continueWatchingApi } from '../services/continueWatching';
import { getNextEpisode, getEpisodeRuntime, buildImageUrl, IMAGE_SIZES } from '../services/tmdb';
import { NextEpisodeOverlay } from '../components/NextEpisodeOverlay';
import { NextEpisodeButton } from '../components/NextEpisodeButton';
import { ProviderSelector } from '../components/ProviderSelector';

export function Watch() {
    const { tmdbId, season, episode } = useParams<{
        tmdbId: string;
        season?: string;
        episode?: string;
    }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [showControls, setShowControls] = useState(true);

    // Streaming provider state
    const [selectedProvider, setSelectedProvider] = useState<StreamingProvider>(() => {
        const saved = localStorage.getItem('streamingProvider');
        return (saved as StreamingProvider) || DEFAULT_PROVIDER;
    });

    // Auto-play next episode state
    const [showNextEpisodeOverlay, setShowNextEpisodeOverlay] = useState(false);
    const [nextEpisodeData, setNextEpisodeData] = useState<{
        season: number;
        episode: number;
        title: string;
        thumbnail: string;
    } | null>(null);
    const [autoPlayCancelled, setAutoPlayCancelled] = useState(false);

    // Extract type from pathname early (needed for save progress)
    const pathSegments = location.pathname.split('/');
    const mediaType = pathSegments[2] as 'movie' | 'tv';

    // Progress tracking
    const [watchStartTime] = useState(Date.now());
    const [hasUpdatedProgress, setHasUpdatedProgress] = useState(false);

    // Save progress when starting to watch
    useEffect(() => {
        if (!tmdbId || !mediaType || (mediaType !== 'movie' && mediaType !== 'tv')) {
            return;
        }

        const saveProgress = async () => {
            const numericTmdbId = parseInt(tmdbId);
            const seasonNum = season ? parseInt(season) : undefined;
            const episodeNum = episode ? parseInt(episode) : undefined;

            // Save with 5% progress initially (marks as "started watching")
            if (isAuthenticated) {
                try {
                    await continueWatchingApi.upsert(
                        numericTmdbId,
                        mediaType,
                        5,
                        seasonNum,
                        episodeNum
                    );
                } catch (err) {
                    console.error('Failed to save continue watching to server:', err);
                    // Fall back to localStorage
                    saveContinueWatching(numericTmdbId, mediaType, 5, seasonNum, episodeNum);
                }
            } else {
                saveContinueWatching(numericTmdbId, mediaType, 5, seasonNum, episodeNum);
            }
        };

        saveProgress();
    }, [tmdbId, mediaType, season, episode, isAuthenticated]);

    // Update progress based on watch time when user leaves or navigates away
    useEffect(() => {
        const updateProgressOnLeave = async () => {
            if (!tmdbId || !mediaType || hasUpdatedProgress) return;

            const watchDuration = (Date.now() - watchStartTime) / 1000 / 60; // in minutes
            const numericTmdbId = parseInt(tmdbId);
            const seasonNum = season ? parseInt(season) : undefined;
            const episodeNum = episode ? parseInt(episode) : undefined;

            // Estimate progress: for TV shows ~45min, movies ~120min
            const estimatedDuration = mediaType === 'tv' ? 45 : 120;
            const progress = Math.min(Math.round((watchDuration / estimatedDuration) * 100), 95);

            // Only update if progress is significant (more than 5 minutes watched)
            if (watchDuration > 5) {
                try {
                    if (isAuthenticated) {
                        await continueWatchingApi.upsert(
                            numericTmdbId,
                            mediaType,
                            progress,
                            seasonNum,
                            episodeNum
                        );
                    } else {
                        saveContinueWatching(numericTmdbId, mediaType, progress, seasonNum, episodeNum);
                    }
                    setHasUpdatedProgress(true);
                } catch (err) {
                    console.error('Failed to update progress:', err);
                }
            }
        };

        // Update progress when component unmounts
        return () => {
            updateProgressOnLeave();
        };
    }, [tmdbId, mediaType, season, episode, isAuthenticated, watchStartTime, hasUpdatedProgress]);

    // Handle mouse movement to show/hide controls and next episode button
    useEffect(() => {
        let timeout: number;

        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = window.setTimeout(() => {
                setShowControls(false);
            }, 3000); // Hide after 3 seconds of inactivity
        };

        const handleMouseLeave = () => {
            setShowControls(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        // Initial timeout
        timeout = window.setTimeout(() => {
            setShowControls(false);
        }, 3000);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(timeout);
        };
    }, []);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            // When exiting fullscreen, show controls
            if (!document.fullscreenElement) {
                setShowControls(true);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
        document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
        document.addEventListener('MSFullscreenChange', handleFullscreenChange); // IE/Edge

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);


    // Fetch next episode data and trigger auto-play overlay for TV shows
    useEffect(() => {
        if (mediaType !== 'tv' || !tmdbId || !season || !episode) {
            return;
        }

        const numericTmdbId = parseInt(tmdbId);
        const seasonNum = parseInt(season);
        const episodeNum = parseInt(episode);

        let overlayTimeout: number | null = null;

        const setupAutoPlay = async () => {
            try {
                // Fetch next episode information
                const nextEp = await getNextEpisode(numericTmdbId, seasonNum, episodeNum);

                if (!nextEp) {
                    // No next episode (end of series)
                    return;
                }

                // Store next episode data for the overlay
                setNextEpisodeData({
                    season: nextEp.season,
                    episode: nextEp.episode,
                    title: nextEp.data.name,
                    thumbnail: buildImageUrl(nextEp.data.still_path, IMAGE_SIZES.backdropSmall),
                });

                // Get episode runtime to calculate when to show overlay
                const runtime = await getEpisodeRuntime(numericTmdbId);
                console.log('DEBUG: Fetched runtime:', runtime, 'minutes');

                // Show overlay at 85% of runtime (convert minutes to milliseconds)
                const triggerTime = runtime * 60 * 1000 * 0.95;
                console.log('DEBUG: Trigger time set for:', triggerTime, 'ms');
                console.log('DEBUG: Will show overlay in approx:', triggerTime / 1000, 'seconds');

                // For testing: Show overlay after 10 seconds
                // const triggerTime = 10000;

                // Set timeout to show overlay
                overlayTimeout = setTimeout(() => {
                    if (!autoPlayCancelled) {
                        setShowNextEpisodeOverlay(true);
                    }
                }, triggerTime);
            } catch (err) {
                console.error('Error setting up auto-play:', err);
            }
        };

        setupAutoPlay();

        // Cleanup timeout on unmount or when dependencies change
        return () => {
            if (overlayTimeout) {
                clearTimeout(overlayTimeout);
            }
        };
    }, [tmdbId, season, episode, mediaType, autoPlayCancelled]);

    // Reset auto-play state when episode changes
    useEffect(() => {
        setShowNextEpisodeOverlay(false);
        setAutoPlayCancelled(false);
        setNextEpisodeData(null);
    }, [tmdbId, season, episode]);

    // Handle hiding the overlay
    const handleHideOverlay = () => {
        setShowNextEpisodeOverlay(false);
        setAutoPlayCancelled(true);
    };

    // Handle countdown complete - navigate to next episode
    const handleCountdownComplete = () => {
        if (nextEpisodeData && !autoPlayCancelled) {
            // Hide overlay first
            setShowNextEpisodeOverlay(false);

            // Clear history stack: Replace current state with fresh history
            // This ensures back button always goes to Details page
            const detailsUrl = `/details/tv/${tmdbId}`;
            const nextEpisodeUrl = `/watch/tv/${tmdbId}/${nextEpisodeData.season}/${nextEpisodeData.episode}`;

            // Reset history: Details → Next Episode (only 2 items in stack)
            window.history.replaceState(null, '', detailsUrl);
            window.history.pushState(null, '', nextEpisodeUrl);

            // Force a re-render by navigating with replace
            navigate(nextEpisodeUrl, { replace: true });
        }
    };


    if (!mediaType || !tmdbId || (mediaType !== 'movie' && mediaType !== 'tv')) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Invalid URL</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Handle provider change
    const handleProviderChange = (provider: StreamingProvider) => {
        setSelectedProvider(provider);
        localStorage.setItem('streamingProvider', provider);
    };

    // Build embed URL based on selected provider
    let embedUrl: string;
    try {
        const buildUrl =
            selectedProvider === 'vidsrc' ? buildVidSrcEmbedUrl :
                selectedProvider === 'vidlink' ? buildVidLinkEmbedUrl :
                    buildVidKingEmbedUrl;

        if (mediaType === 'movie') {
            embedUrl = buildUrl({
                type: 'movie',
                tmdbId: parseInt(tmdbId),
            });
        } else if (mediaType === 'tv') {
            if (!season || !episode) {
                throw new Error('Season and episode required for TV shows');
            }
            embedUrl = buildUrl({
                type: 'tv',
                tmdbId: parseInt(tmdbId),
                season: parseInt(season),
                episode: parseInt(episode),
            });
        } else {
            throw new Error('Invalid media type');
        }
    } catch (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Error Loading Player
                    </h1>
                    <p className="text-gray-400 mb-6">
                        {error instanceof Error ? error.message : 'Unknown error'}
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black"
            onMouseEnter={() => setShowControls(true)}
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onTouchStart={() => setShowControls(!showControls)}
        >
            {/* Back Arrow Overlay - Always Visible */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <div className="p-6">
                    <button
                        onClick={() => {
                            // Navigate to show details page for TV shows, or home for movies
                            // Use replace to avoid cluttering browser history
                            if (mediaType === 'tv') {
                                navigate(`/details/tv/${tmdbId}`, { replace: true });
                            } else {
                                navigate('/', { replace: true });
                            }
                        }}
                        className="flex items-center justify-center w-12 h-12 text-accent hover:text-accent-light transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-8 h-8" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Provider Selector */}
            <ProviderSelector
                selectedProvider={selectedProvider}
                onProviderChange={handleProviderChange}
                visible={showControls}
            />

            {/* Fullscreen Video Player */}
            <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Video Player"
            />


            {/* Persistent Next Episode Button - TV Shows Only */}
            {mediaType === 'tv' && nextEpisodeData && !autoPlayCancelled && (
                <NextEpisodeButton
                    seasonNumber={nextEpisodeData.season}
                    episodeNumber={nextEpisodeData.episode}
                    onClick={handleCountdownComplete}
                    visible={showControls}
                />
            )}

            {/* Next Episode Overlay - TV Shows Only */}
            {showNextEpisodeOverlay && nextEpisodeData && (
                <NextEpisodeOverlay
                    episodeThumbnail={nextEpisodeData.thumbnail}
                    episodeTitle={nextEpisodeData.title}
                    seasonNumber={nextEpisodeData.season}
                    episodeNumber={nextEpisodeData.episode}
                    totalSeconds={15}
                    onHide={handleHideOverlay}
                    onCountdownComplete={handleCountdownComplete}
                    onPlayNow={handleCountdownComplete}
                />
            )}
        </div>
    );
}
