import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, ChevronDown } from 'lucide-react';
import { searchMulti, getSimilarMedia } from '../services/tmdb';
import { MediaItem } from '../types/media';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { PosterCard } from '../components/PosterCard';
import { SectionTitle } from '../components/SectionTitle';
import { RowCarousel } from '../components/RowCarousel';

type MediaFilter = 'all' | 'movie' | 'tv';

export function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(query);
    const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
    const [allResults, setAllResults] = useState<MediaItem[]>([]);
    const [filteredResults, setFilteredResults] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Similar titles state
    const [similarItems, setSimilarItems] = useState<MediaItem[]>([]);
    const [similarLoading, setSimilarLoading] = useState(false);
    const [similarError, setSimilarError] = useState<string | null>(null);
    const lastSimilarKeyRef = useRef<string>('');

    const performSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            console.log('[Search] Empty search term, clearing results');
            setAllResults([]);
            setFilteredResults([]);
            setHasSearched(false);
            return;
        }

        console.log('[Search] Starting search for:', searchTerm);
        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            console.log('[Search] Calling TMDB searchMulti...');
            const data = await searchMulti(searchTerm);
            console.log('[Search] TMDB returned:', data.length, 'results');
            console.log('[Search] First 3 results:', data.slice(0, 3).map(r => ({ title: r.title, type: r.type, tmdbId: r.tmdbId })));

            setAllResults(data);
            setFilteredResults(data);
            console.log('[Search] Results set successfully');
        } catch (err) {
            console.error('[Search] Search error:', err);
            console.error('[Search] Error details:', {
                message: err instanceof Error ? err.message : 'Unknown error',
                stack: err instanceof Error ? err.stack : undefined
            });
            setError(err instanceof Error ? err.message : 'Failed to search');
        } finally {
            setLoading(false);
            console.log('[Search] Search complete, loading:', false);
        }
    };

    // Apply filter when filter selection changes
    useEffect(() => {
        if (mediaFilter === 'all') {
            setFilteredResults(allResults);
        } else {
            setFilteredResults(allResults.filter(item => item.type === mediaFilter));
        }
    }, [mediaFilter, allResults]);

    // Fetch similar titles based on top filtered results
    const fetchSimilarForSearch = async () => {
        if (filteredResults.length === 0) {
            setSimilarItems([]);
            return;
        }

        // Pick the top 3 results to derive similar titles from
        const topResults = filteredResults.slice(0, 3);
        const similarKey = topResults.map(r => `${r.type}-${r.tmdbId}`).join(',');

        // Skip if same key as last fetch (avoids refetch on back navigation)
        if (similarKey === lastSimilarKeyRef.current) return;
        lastSimilarKeyRef.current = similarKey;

        setSimilarLoading(true);
        setSimilarError(null);

        try {
            const promises = topResults.map(item =>
                getSimilarMedia(item.type, item.tmdbId).catch(() => [] as MediaItem[])
            );
            const results = await Promise.all(promises);
            const allSimilar = results.flat();

            // Deduplicate and remove items already in search results
            const resultIds = new Set(filteredResults.map(r => r.tmdbId));
            const seen = new Set<number>();
            const unique: MediaItem[] = [];

            for (const item of allSimilar) {
                if (!resultIds.has(item.tmdbId) && !seen.has(item.tmdbId)) {
                    seen.add(item.tmdbId);
                    // If filter is active, only include matching type
                    if (mediaFilter !== 'all' && item.type !== mediaFilter) continue;
                    unique.push(item);
                }
            }

            setSimilarItems(unique.slice(0, 20));
        } catch (err) {
            console.error('[Search] Error fetching similar titles:', err);
            setSimilarError('Couldn\'t load similar titles.');
        } finally {
            setSimilarLoading(false);
        }
    };

    useEffect(() => {
        if (hasSearched && !loading && filteredResults.length > 0) {
            fetchSimilarForSearch();
        } else if (filteredResults.length === 0) {
            setSimilarItems([]);
            lastSimilarKeyRef.current = '';
        }
    }, [filteredResults, hasSearched, loading]);

    // Search when query param changes
    useEffect(() => {
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [query]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchParams({ q: searchQuery.trim() });
        }
    };

    const getFilterLabel = () => {
        switch (mediaFilter) {
            case 'all':
                return 'Movies & TV Shows';
            case 'movie':
                return 'Movies';
            case 'tv':
                return 'TV Shows';
        }
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-16 animate-slideInFromRight">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white hover:text-accent transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>

                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
                        🎬 Discover Your Next Favorite 🎬
                    </h1>
                    <p className="text-gray-400 text-center mb-6">
                        Search through thousands of movies, TV shows, and anime series
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="flex gap-4 max-w-3xl mx-auto">
                        {/* Dropdown Filter */}
                        <div className="relative">
                            <select
                                value={mediaFilter}
                                onChange={(e) => setMediaFilter(e.target.value as MediaFilter)}
                                className="appearance-none h-full px-4 pr-10 bg-dark-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border-2 border-transparent cursor-pointer"
                            >
                                <option value="all">Movies & TV Shows</option>
                                <option value="movie">Movies</option>
                                <option value="tv">TV Shows</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Search Input */}
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type here to search..."
                            className="flex-1 px-6 py-4 bg-dark-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-lg border-2 border-accent"
                        />

                        {/* Search Button */}
                        <button
                            type="submit"
                            className="px-8 py-4 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors font-semibold flex items-center gap-2"
                        >
                            <SearchIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Search</span>
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {error && !loading && (
                    <ErrorMessage message={error} onRetry={() => performSearch(query)} />
                )}

                {!loading && !error && hasSearched && (
                    <>
                        {/* Results Count */}
                        <div className="mb-6">
                            <p className="text-gray-400 text-lg">
                                {filteredResults.length > 0
                                    ? `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} found for "${query}"${mediaFilter !== 'all' ? ` (${getFilterLabel()})` : ''}`
                                    : `No results found for "${query}"${mediaFilter !== 'all' ? ` in ${getFilterLabel()}` : ''}`}
                            </p>
                        </div>

                        {/* Results Grid */}
                        {filteredResults.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                                {filteredResults.map((item) => (
                                    <PosterCard key={item.tmdbId} media={item} />
                                ))}
                            </div>
                        )}

                        {/* Similar Titles Section */}
                        {filteredResults.length > 0 && (
                            <div className="mt-12">
                                <SectionTitle title="Similar Titles" />
                                {similarLoading && (
                                    <div className="flex gap-3 overflow-hidden">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex-shrink-0 w-[160px] md:w-[185px] aspect-[2/3] bg-dark-700 rounded-lg animate-pulse"
                                            />
                                        ))}
                                    </div>
                                )}
                                {similarError && !similarLoading && (
                                    <div className="flex items-center gap-3 py-4">
                                        <p className="text-gray-400">{similarError}</p>
                                        <button
                                            onClick={fetchSimilarForSearch}
                                            className="text-accent hover:text-accent-dark transition-colors font-medium"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}
                                {!similarLoading && !similarError && similarItems.length === 0 && (
                                    <p className="text-gray-500 py-4">No similar titles found.</p>
                                )}
                                {!similarLoading && !similarError && similarItems.length > 0 && (
                                    <RowCarousel items={similarItems} />
                                )}
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredResults.length === 0 && (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    No results found
                                </h3>
                                <p className="text-gray-400">
                                    Try searching with different keywords or change the filter
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Initial State */}
                {!hasSearched && !loading && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🎬</div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Start searching
                        </h3>
                        <p className="text-gray-400">
                            Enter a movie or TV show name to find what you're looking for
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
