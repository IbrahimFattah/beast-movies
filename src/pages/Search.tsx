import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, ChevronDown } from 'lucide-react';
import { searchMulti } from '../services/tmdb';
import { MediaItem } from '../types/media';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { PosterCard } from '../components/PosterCard';

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

    const performSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setAllResults([]);
            setFilteredResults([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const data = await searchMulti(searchTerm);
            setAllResults(data);
            setFilteredResults(data);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'Failed to search');
        } finally {
            setLoading(false);
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
