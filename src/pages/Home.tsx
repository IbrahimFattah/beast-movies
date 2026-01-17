import { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { SectionTitle } from '../components/SectionTitle';
import { RowCarousel } from '../components/RowCarousel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { getTrending, getPopularMovies, getPopularTVShows, getTopRatedMovies } from '../services/tmdb';
import { getContinueWatching, mergeContinueWatching } from '../services/storage';
import { MediaItem } from '../types/media';

export function Home() {
    const [trending, setTrending] = useState<MediaItem[]>([]);
    const [movies, setMovies] = useState<MediaItem[]>([]);
    const [tvShows, setTVShows] = useState<MediaItem[]>([]);
    const [topRated, setTopRated] = useState<MediaItem[]>([]);
    const [continueWatchingItems, setContinueWatchingItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

            // Load continue watching from localStorage
            const continueWatchingData = getContinueWatching();
            if (continueWatchingData.length > 0) {
                // Fetch details for continue watching items
                // For now, we'll merge with existing data
                const allItems = [...trendingData, ...moviesData, ...tvShowsData];
                const merged = mergeContinueWatching(allItems);
                const watching = merged.filter(item => item.continueWatching);
                setContinueWatchingItems(watching);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
                            <RowCarousel items={continueWatchingItems} />
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
