import { useState } from 'react';
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { FilterOptions, Genre, WatchProvider } from '../types/media';
import { buildImageUrl } from '../services/tmdb';

interface FilterPanelProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    genres: Genre[];
    providers: WatchProvider[];
    onClose?: () => void; // For mobile drawer
    isMobile?: boolean;
}



export function FilterPanel({
    filters,
    onFilterChange,
    genres,
    providers,
    onClose,
    isMobile = false,
}: FilterPanelProps) {
    const [showAllProviders, setShowAllProviders] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        type: true,
        providers: true,
        genres: true,
        year: true,
    });

    const currentYear = new Date().getFullYear();
    const topProviders = providers.slice(0, 8);
    const visibleProviders = showAllProviders ? providers : topProviders;

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updateFilters = (updates: Partial<FilterOptions>) => {
        onFilterChange({ ...filters, ...updates, page: 1 }); // Reset to page 1 on filter change
    };

    const toggleGenre = (genreId: number) => {
        const currentGenres = filters.genres || [];
        const newGenres = currentGenres.includes(genreId)
            ? currentGenres.filter(id => id !== genreId)
            : [...currentGenres, genreId];
        updateFilters({ genres: newGenres });
    };

    const toggleProvider = (providerId: number) => {
        const currentProviders = filters.providers || [];
        const newProviders = currentProviders.includes(providerId)
            ? currentProviders.filter(id => id !== providerId)
            : [...currentProviders, providerId];
        updateFilters({ providers: newProviders });
    };

    const clearAllFilters = () => {
        onFilterChange({
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
        });
    };

    const SectionHeader = ({ title, section }: { title: string; section: keyof typeof expandedSections }) => (
        <button
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between py-2 text-white font-semibold hover:text-accent transition-colors"
        >
            <span>{title}</span>
            {expandedSections[section] ? (
                <ChevronUp className="w-4 h-4" />
            ) : (
                <ChevronDown className="w-4 h-4" />
            )}
        </button>
    );

    return (
        <div className={`bg-dark-800 ${isMobile ? 'h-full' : 'rounded-lg max-h-[calc(100vh-150px)]'} overflow-y-auto hover:overflow-y-scroll p-6 border border-dark-600 filter-panel-scroll`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-bold text-white">Filters</h2>
                </div>
                {isMobile && onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                )}
            </div>

            {/* Media Type */}
            <div className="mb-6">
                <SectionHeader title="Type" section="type" />
                {expandedSections.type && (
                    <div className="flex gap-2 mt-3">
                        {['all', 'movie', 'tv'].map(type => (
                            <button
                                key={type}
                                onClick={() => updateFilters({ type: type as 'all' | 'movie' | 'tv' })}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${filters.type === type
                                    ? 'bg-accent text-black'
                                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                                    }`}
                            >
                                {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Streaming Providers */}
            <div className="mb-6">
                <SectionHeader title="Streaming Providers" section="providers" />
                {expandedSections.providers && (
                    <div className="mt-3">
                        <div className="grid grid-cols-2 gap-2">
                            {visibleProviders.map(provider => {
                                const isSelected = filters.providers?.includes(provider.provider_id);
                                return (
                                    <button
                                        key={provider.provider_id}
                                        onClick={() => toggleProvider(provider.provider_id)}
                                        className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${isSelected
                                            ? 'border-accent bg-accent/10'
                                            : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                                            }`}
                                    >
                                        <img
                                            src={buildImageUrl(provider.logo_path, 'w45')}
                                            alt={provider.provider_name}
                                            className="w-8 h-8 rounded"
                                        />
                                        <span className="text-xs text-white truncate flex-1">
                                            {provider.provider_name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {providers.length > 8 && (
                            <button
                                onClick={() => setShowAllProviders(!showAllProviders)}
                                className="w-full mt-2 py-2 text-sm text-accent hover:text-accent-light transition-colors"
                            >
                                {showAllProviders ? 'Show Less' : `Show ${providers.length - 8} More`}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Genres */}
            <div className="mb-6">
                <SectionHeader title="Genres" section="genres" />
                {expandedSections.genres && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {genres.map(genre => {
                            const isSelected = filters.genres?.includes(genre.id);
                            return (
                                <button
                                    key={genre.id}
                                    onClick={() => toggleGenre(genre.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isSelected
                                        ? 'bg-accent text-black'
                                        : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                                        }`}
                                >
                                    {genre.name}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Year Range */}
            <div className="mb-6">
                <SectionHeader title="Year Range" section="year" />
                {expandedSections.year && (
                    <div className="flex gap-3 mt-3">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">From</label>
                            <input
                                type="number"
                                min="1900"
                                max={currentYear}
                                value={filters.yearFrom || ''}
                                onChange={(e) => updateFilters({
                                    yearFrom: e.target.value ? parseInt(e.target.value) : undefined
                                })}
                                placeholder="1900"
                                className="w-full px-3 py-2 bg-dark-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border border-dark-600"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">To</label>
                            <input
                                type="number"
                                min="1900"
                                max={currentYear}
                                value={filters.yearTo || ''}
                                onChange={(e) => updateFilters({
                                    yearTo: e.target.value ? parseInt(e.target.value) : undefined
                                })}
                                placeholder={currentYear.toString()}
                                className="w-full px-3 py-2 bg-dark-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border border-dark-600"
                            />
                        </div>
                    </div>
                )}
            </div>





            {/* Clear Filters Button */}
            <button
                onClick={clearAllFilters}
                className="w-full py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors font-semibold"
            >
                Clear All Filters
            </button>
        </div>
    );
}
