import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { discoverMulti, getAllGenres, getWatchProviders } from '../services/tmdb';
import { FilterPanel } from '../components/FilterPanel';
import { PosterCard } from '../components/PosterCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { FilterOptions, Genre, WatchProvider, MediaItem } from '../types/media';
import { parseFiltersFromURL, serializeFiltersToURL, formatFilterSummary, areFiltersActive } from '../utils/filterUtils';

export function Browse() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Filter state
    const [filters, setFilters] = useState<FilterOptions>(() => parseFiltersFromURL(searchParams));
    const [genres, setGenres] = useState<Genre[]>([]);
    const [providers, setProviders] = useState<WatchProvider[]>([]);

    // Results state
    const [results, setResults] = useState<MediaItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);

    // UI state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Load genres and providers on mount
    useEffect(() => {
        const loadFilterData = async () => {
            try {
                const [genreData, providerData] = await Promise.all([
                    getAllGenres(),
                    getWatchProviders('US'),
                ]);
                setGenres(genreData);
                setProviders(providerData);
            } catch (err) {
                console.error('Failed to load filter data:', err);
            }
        };

        loadFilterData();
    }, []);

    // Fetch results when filters change (debounced)
    useEffect(() => {
        // Skip initial load if we've already loaded
        if (isInitialLoad && results.length > 0) {
            setIsInitialLoad(false);
            return;
        }

        const timer = setTimeout(() => {
            fetchResults();
        }, 300); // Debounce by 300ms

        return () => clearTimeout(timer);
    }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync filters to URL
    useEffect(() => {
        const newParams = serializeFiltersToURL(filters);
        setSearchParams(newParams, { replace: true });
    }, [filters, setSearchParams]);

    // Parse URL on mount or when URL changes externally
    useEffect(() => {
        const urlFilters = parseFiltersFromURL(searchParams);
        setFilters(urlFilters);
    }, [searchParams]);

    const fetchResults = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await discoverMulti(filters);
            setResults(data.results);
            setPage(data.page);
            setTotalPages(data.totalPages);
            setTotalResults(data.totalResults);
            setIsInitialLoad(false);
        } catch (err) {
            console.error('Error fetching results:', err);
            setError(err instanceof Error ? err.message : 'Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    const activeFilterChips = formatFilterSummary(filters, genres, providers);
    const hasActiveFilters = areFiltersActive(filters);

    return (
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-white hover:text-accent transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back to Home</span>
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Browse Catalog</h1>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-accent text-black rounded-lg hover:bg-accent-dark transition-colors"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        <span>Filters</span>
                    </button>
                </div>

                {/* Active Filter Chips */}
                {hasActiveFilters && activeFilterChips.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        <span className="text-gray-400 text-sm py-1.5">Active filters:</span>
                        {activeFilterChips.map((chip, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 border border-accent/50 text-accent rounded-full text-sm"
                            >
                                <span>{chip}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Layout */}
                <div className="flex gap-6">
                    {/* Desktop Filter Sidebar */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <FilterPanel
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                genres={genres}
                                providers={providers}
                            />
                        </div>
                    </aside>

                    {/* Mobile Filter Drawer */}
                    {showMobileFilters && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                                onClick={() => setShowMobileFilters(false)}
                            />
                            <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-dark-900 shadow-2xl overflow-y-auto">
                                <FilterPanel
                                    filters={filters}
                                    onFilterChange={(newFilters) => {
                                        handleFilterChange(newFilters);
                                        setShowMobileFilters(false);
                                    }}
                                    genres={genres}
                                    providers={providers}
                                    onClose={() => setShowMobileFilters(false)}
                                    isMobile={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* Results Section */}
                    <main className="flex-1 min-w-0">
                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center py-16">
                                <LoadingSpinner size="lg" />
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <ErrorMessage message={error} onRetry={fetchResults} />
                        )}

                        {/* Results */}
                        {!loading && !error && (
                            <>
                                {/* Results Count */}
                                <div className="mb-4">
                                    <p className="text-gray-400">
                                        {totalResults > 0
                                            ? `Showing ${results.length} of ${totalResults.toLocaleString()} results`
                                            : 'No results found'}
                                    </p>
                                </div>

                                {/* Results Grid */}
                                {results.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                                            {results.map((item) => (
                                                <PosterCard key={`${item.type}-${item.tmdbId}`} media={item} />
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="mt-8 flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handlePageChange(page - 1)}
                                                    disabled={page === 1}
                                                    className="px-4 py-2 bg-dark-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors"
                                                >
                                                    Previous
                                                </button>

                                                <div className="flex gap-1">
                                                    {/* Show first page */}
                                                    {page > 3 && (
                                                        <>
                                                            <button
                                                                onClick={() => handlePageChange(1)}
                                                                className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                                                            >
                                                                1
                                                            </button>
                                                            {page > 4 && <span className="px-2 py-2 text-gray-400">...</span>}
                                                        </>
                                                    )}

                                                    {/* Show pages around current */}
                                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                        const pageNum = Math.max(1, page - 2) + i;
                                                        if (pageNum > totalPages) return null;
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => handlePageChange(pageNum)}
                                                                className={`px-4 py-2 rounded-lg transition-colors ${pageNum === page
                                                                    ? 'bg-accent text-black font-bold'
                                                                    : 'bg-dark-700 text-white hover:bg-dark-600'
                                                                    }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}

                                                    {/* Show last page */}
                                                    {page < totalPages - 2 && (
                                                        <>
                                                            {page < totalPages - 3 && <span className="px-2 py-2 text-gray-400">...</span>}
                                                            <button
                                                                onClick={() => handlePageChange(totalPages)}
                                                                className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                                                            >
                                                                {totalPages}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => handlePageChange(page + 1)}
                                                    disabled={page === totalPages}
                                                    className="px-4 py-2 bg-dark-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Empty State */
                                    <div className="text-center py-16">
                                        <div className="text-6xl mb-4">🎬</div>
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            No results found
                                        </h3>
                                        <p className="text-gray-400 mb-4">
                                            Try adjusting your filters to see more results
                                        </p>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={() => handleFilterChange({
                                                    type: 'all',
                                                    genres: [],
                                                    providers: [],
                                                    region: 'US',
                                                    yearFrom: undefined,
                                                    yearTo: undefined,
                                                    ratingMin: 0,
                                                    ratingMax: 10,
                                                    sortBy: 'popularity.desc',
                                                    page: 1,
                                                })}
                                                className="px-6 py-3 bg-accent text-black rounded-lg hover:bg-accent-dark transition-colors font-semibold"
                                            >
                                                Clear All Filters
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
