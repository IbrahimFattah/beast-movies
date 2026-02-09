import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { buildVidSrcEmbedUrl } from '../utils/vidsrc';
import { buildVidLinkEmbedUrl } from '../utils/vidlink';
import { buildVidKingEmbedUrl } from '../utils/vidking';
import { StreamingProvider, DEFAULT_PROVIDER } from '../types/streaming';
import { useAuth } from '../contexts/AuthContext';
import { saveContinueWatching } from '../services/storage';
import { continueWatchingApi } from '../services/continueWatching';
import { getNextEpisode } from '../services/tmdb';
import { NextEpisodeButton } from '../components/NextEpisodeButton';
import { ProviderSelector } from '../components/ProviderSelector';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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

    // Next episode state (for the button only, no auto-play)
    const [nextEpisodeData, setNextEpisodeData] = useState<{
        season: number;
        episode: number;
    } | null>(null);

    // Extract type from pathname early (needed for save progress)
    const pathSegments = location.pathname.split('/');
    const mediaType = pathSegments[2] as 'movie' | 'tv';

    // Progress tracking refs avoid stale state during page lifecycle events.
    const watchStartTimeRef = useRef(Date.now());
    const lastSavedProgressRef = useRef(0);

    // Save progress when starting to watch
    useEffect(() => {
        if (!tmdbId || !mediaType || (mediaType !== 'movie' && mediaType !== 'tv')) {
            return;
        }

        const saveProgress = async () => {
            const numericTmdbId = parseInt(tmdbId, 10);
            if (Number.isNaN(numericTmdbId)) {
                return;
            }

            const seasonNum = season ? parseInt(season) : undefined;
            const episodeNum = episode ? parseInt(episode) : undefined;
            watchStartTimeRef.current = Date.now();
            lastSavedProgressRef.current = 5;

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

    // Flush progress on tab hide/page exit so playback history is not lost.
    useEffect(() => {
        if (!tmdbId || !mediaType || (mediaType !== 'movie' && mediaType !== 'tv')) {
            return;
        }

        const buildProgressPayload = () => {
            const numericTmdbId = parseInt(tmdbId, 10);
            if (Number.isNaN(numericTmdbId)) {
                return null;
            }

            const watchDuration = (Date.now() - watchStartTimeRef.current) / 1000 / 60;
            const seasonNum = season ? parseInt(season) : undefined;
            const episodeNum = episode ? parseInt(episode) : undefined;

            // Estimate progress: for TV shows ~45min, movies ~120min
            const estimatedDuration = mediaType === 'tv' ? 45 : 120;
            const progress = Math.min(Math.round((watchDuration / estimatedDuration) * 100), 95);

            // Only update if progress is significant (more than 5 minutes watched)
            if (watchDuration <= 5 || progress <= lastSavedProgressRef.current) {
                return null;
            }

            return { numericTmdbId, seasonNum, episodeNum, progress };
        };

        const updateProgress = async (useKeepalive: boolean) => {
            const payload = buildProgressPayload();
            if (!payload) return;

            const { numericTmdbId, seasonNum, episodeNum, progress } = payload;

            try {
                if (isAuthenticated) {
                    if (useKeepalive) {
                        const requestBody = JSON.stringify({
                            tmdbId: numericTmdbId,
                            mediaType,
                            progress,
                            season: seasonNum,
                            episode: episodeNum,
                        });

                        const endpoint = `${API_URL}/continue-watching`;
                        let sent = false;

                        // sendBeacon is most reliable during unload when API is same-origin.
                        if (endpoint.startsWith('/') && navigator.sendBeacon) {
                            sent = navigator.sendBeacon(
                                endpoint,
                                new Blob([requestBody], { type: 'application/json' })
                            );
                        }

                        if (!sent) {
                            void fetch(endpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                keepalive: true,
                                body: requestBody,
                            }).catch((err) => {
                                console.error('Failed to persist keepalive progress:', err);
                            });
                        }
                    } else {
                        await continueWatchingApi.upsert(
                            numericTmdbId,
                            mediaType,
                            progress,
                            seasonNum,
                            episodeNum
                        );
                    }
                } else {
                    saveContinueWatching(numericTmdbId, mediaType, progress, seasonNum, episodeNum);
                }

                lastSavedProgressRef.current = progress;
            } catch (err) {
                console.error('Failed to update progress:', err);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                void updateProgress(true);
            }
        };

        const handlePageHide = () => {
            void updateProgress(true);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
            void updateProgress(false);
        };
    }, [tmdbId, mediaType, season, episode, isAuthenticated]);

    // Handle mouse movement to show/hide controls
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

    // Fetch next episode data for TV shows (for the button)
    useEffect(() => {
        if (mediaType !== 'tv' || !tmdbId || !season || !episode) {
            return;
        }

        const fetchNextEpisode = async () => {
            try {
                const numericTmdbId = parseInt(tmdbId);
                const seasonNum = parseInt(season);
                const episodeNum = parseInt(episode);

                const nextEp = await getNextEpisode(numericTmdbId, seasonNum, episodeNum);

                if (nextEp) {
                    setNextEpisodeData({
                        season: nextEp.season,
                        episode: nextEp.episode,
                    });
                } else {
                    setNextEpisodeData(null);
                }
            } catch (err) {
                console.error('Error fetching next episode:', err);
                setNextEpisodeData(null);
            }
        };

        fetchNextEpisode();
    }, [tmdbId, season, episode, mediaType]);

    // Handle next episode navigation
    const handleNextEpisode = () => {
        if (nextEpisodeData) {
            navigate(`/watch/tv/${tmdbId}/${nextEpisodeData.season}/${nextEpisodeData.episode}`);
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

            {/* Next Episode Button - TV Shows Only */}
            {mediaType === 'tv' && nextEpisodeData && (
                <NextEpisodeButton
                    seasonNumber={nextEpisodeData.season}
                    episodeNumber={nextEpisodeData.episode}
                    onClick={handleNextEpisode}
                    visible={showControls}
                />
            )}
        </div>
    );
}
