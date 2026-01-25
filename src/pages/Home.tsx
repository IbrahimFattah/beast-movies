import { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { SectionTitle } from '../components/SectionTitle';
import { RowCarousel } from '../components/RowCarousel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { getTrending, getPopularMovies, getPopularTVShows, getTopRatedMovies, getMediaDetails } from '../services/tmdb';
import { getContinueWatching, removeContinueWatching } from '../services/storage';
import { continueWatchingApi } from '../services/continueWatching';
import { favoritesApi } from '../services/favorites';
import { watchlistApi } from '../services/watchlist';
import { useAuth } from '../contexts/AuthContext';
import { MediaItem, ContinueWatchingItem } from '../types/media';

export function Home() {
    const { isAuthenticated } = useAuth();
    const [trending, setTrending] = useState<MediaItem[]>([]);
    const [movies, setMovies] = useState<MediaItem[]>([]);
    const [tvShows, setTVShows] = useState<MediaItem[]>([]);
    const [topRated, setTopRated] = useState<MediaItem[]>([]);
    const [continueWatchingItems, setContinueWatchingItems] = useState<MediaItem[]>([]);
    const [favoritesItems, setFavoritesItems] = useState<MediaItem[]>([]);
    const [watchlistItems, setWatchlistItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContinueWatching = async (
        allItems: MediaItem[],
        continueWatchingData: ContinueWatchingItem[]
    ): Promise<MediaItem[]> => {
        // Find matching items from fetched content
        const watchingItems: MediaItem[] = [];

        for (const cwItem of continueWatchingData) {
            // First try to find in our already-fetched items
            const existingItem = allItems.find(item => item.tmdbId === cwItem.tmdbId);

            if (existingItem) {
                watchingItems.push({
                    ...existingItem,
                    continueWatching: {
                        progress: cwItem.progress,
                        season: cwItem.season,
                        episode: cwItem.episode,
                    },
                });
            } else {
                // Fetch details for items not in our current list
                try {
                    const details = await getMediaDetails(cwItem.type, cwItem.tmdbId);
                    watchingItems.push({
                        ...details,
                        continueWatching: {
                            progress: cwItem.progress,
                            season: cwItem.season,
                            episode: cwItem.episode,
                        },
                    });
                } catch (err) {
                    console.error(`Failed to fetch details for ${cwItem.type} ${cwItem.tmdbId}:`, err);
                }
            }
        }

        return watchingItems;
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all data in parallel
            const [trendingData, moviesData, tvShowsData, topRatedData] = await Promise.all([
                getTrending('week'),
                getPopularMovies(),
                getPopularTVShows(),
                getTopRatedMovies(),
            ]);

            setTrending(trendingData);
            setMovies(moviesData);
            setTVShows(tvShowsData);
            setTopRated(topRatedData);

            // Get continue watching data - from server if logged in, otherwise from localStorage
            let continueWatchingData: ContinueWatchingItem[] = [];

            if (isAuthenticated) {
                try {
                    continueWatchingData = await continueWatchingApi.getAll();
                } catch (err) {
                    console.error('Failed to fetch continue watching from server:', err);
                    // Fall back to localStorage
                    continueWatchingData = getContinueWatching();
                }
            } else {
                continueWatchingData = getContinueWatching();
            }

            if (continueWatchingData.length > 0) {
                const allItems = [...trendingData, ...moviesData, ...tvShowsData];
                const watching = await fetchContinueWatching(allItems, continueWatchingData);
                setContinueWatchingItems(watching);
            } else {
                setContinueWatchingItems([]);
            }

            // Fetch favorites and watchlist for logged in users
            if (isAuthenticated) {
                try {
                    const [favorites, watchlist] = await Promise.all([
                        favoritesApi.getAll(),
                        watchlistApi.getAll()
                    ]);

                    // Fetch details for favorites
                    if (favorites.length > 0) {
                        const favoriteItems = await Promise.all(
                            favorites.map(async (fav) => {
                                try {
                                    return await getMediaDetails(fav.media_type, fav.tmdb_id);
                                } catch (err) {
                                    console.error(`Failed to fetch favorite ${fav.tmdb_id}:`, err);
                                    return null;
                                }
                            })
                        );
                        setFavoritesItems(favoriteItems.filter((item): item is MediaItem => item !== null));
                    } else {
                        setFavoritesItems([]);
                    }

                    // Fetch details for watchlist
                    if (watchlist.length > 0) {
                        const watchlistMediaItems = await Promise.all(
                            watchlist.map(async (wl) => {
                                try {
                                    return await getMediaDetails(wl.media_type, wl.tmdb_id);
                                } catch (err) {
                                    console.error(`Failed to fetch watchlist ${wl.tmdb_id}:`, err);
                                    return null;
                                }
                            })
                        );
                        setWatchlistItems(watchlistMediaItems.filter((item): item is MediaItem => item !== null));
                    } else {
                        setWatchlistItems([]);
                    }
                } catch (err) {
                    console.error('Error fetching favorites/watchlist:', err);
                    setFavoritesItems([]);
                    setWatchlistItems([]);
                }
            } else {
                setFavoritesItems([]);
                setWatchlistItems([]);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveContinueWatching = async (tmdbId: number) => {
        try {
            // Remove from backend or localStorage
            if (isAuthenticated) {
                await continueWatchingApi.remove(tmdbId);
            } else {
                removeContinueWatching(tmdbId);
            }

            // Update local state immediately for smooth UX
            setContinueWatchingItems(prev => prev.filter(item => item.tmdbId !== tmdbId));
        } catch (error) {
            console.error('Failed to remove from continue watching:', error);
            // Optionally show error toast to user
        }
    };

    useEffect(() => {
        fetchData();
    }, [isAuthenticated]);

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

    const featured = trending[0] || movies[0] || tvShows[0];

    return (
        <div className="min-h-screen bg-black">
            {/* Hero Section */}
            {featured && <Hero media={featured} />}

            {/* Content Rows */}
            <div className="relative -mt-32 z-10 space-y-12 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Continue Watching */}
                    {continueWatchingItems.length > 0 && (
                        <section className="mb-12">
                            <SectionTitle title="Continue Watching" />
                            <RowCarousel
                                items={continueWatchingItems}
                                onRemove={handleRemoveContinueWatching}
                            />
                        </section>
                    )}

                    {/* My Favorites */}
                    {favoritesItems.length > 0 && (
                        <section className="mb-12">
                            <SectionTitle title="My Favorites" />
                            <RowCarousel items={favoritesItems} />
                        </section>
                    )}

                    {/* My Watchlist */}
                    {watchlistItems.length > 0 && (
                        <section className="mb-12">
                            <SectionTitle title="My Watchlist" />
                            <RowCarousel items={watchlistItems} />
                        </section>
                    )}

                    {/* Trending Now */}
                    {trending.length > 0 && (
                        <section className="mb-12">
                            <SectionTitle title="Trending Now" />
                            <RowCarousel items={trending.slice(0, 10)} />
                        </section>
                    )}

                    {/* Popular Movies */}
                    {movies.length > 0 && (
                        <section className="mb-12">
                            <SectionTitle title="Popular Movies" />
                            <RowCarousel items={movies.slice(0, 10)} />
                        </section>
                    )}

                    {/* Trending TV Shows */}
                    {tvShows.length > 0 && (
                        <section className="mb-12">
                            <SectionTitle title="Trending TV Shows" />
                            <RowCarousel items={tvShows.slice(0, 10)} />
                        </section>
                    )}

                    {/* Top Rated */}
                    {topRated.length > 0 && (
                        <section className="mb-12">
                            <SectionTitle title="Top Rated Movies" />
                            <RowCarousel items={topRated.slice(0, 10)} />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
