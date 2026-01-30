import { FilterOptions, Genre, WatchProvider } from '../types/media';

/**
 * Get default filter options
 */
export function getDefaultFilters(): FilterOptions {
    return {
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
    };
}

/**
 * Parse filter options from URL search params
 */
export function parseFiltersFromURL(searchParams: URLSearchParams): FilterOptions {
    const filters: FilterOptions = getDefaultFilters();

    // Type
    const type = searchParams.get('type');
    if (type === 'movie' || type === 'tv' || type === 'all') {
        filters.type = type;
    }

    // Genres
    const genres = searchParams.get('genres');
    if (genres) {
        filters.genres = genres.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    }

    // Providers
    const providers = searchParams.get('providers');
    if (providers) {
        filters.providers = providers.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    }

    // Region
    const region = searchParams.get('region');
    if (region) {
        filters.region = region;
    }

    // Year range
    const yearFrom = searchParams.get('yearFrom');
    if (yearFrom) {
        const year = parseInt(yearFrom, 10);
        if (!isNaN(year)) filters.yearFrom = year;
    }

    const yearTo = searchParams.get('yearTo');
    if (yearTo) {
        const year = parseInt(yearTo, 10);
        if (!isNaN(year)) filters.yearTo = year;
    }

    // Rating range
    const ratingMin = searchParams.get('ratingMin');
    if (ratingMin) {
        const rating = parseFloat(ratingMin);
        if (!isNaN(rating)) filters.ratingMin = rating;
    }

    const ratingMax = searchParams.get('ratingMax');
    if (ratingMax) {
        const rating = parseFloat(ratingMax);
        if (!isNaN(rating)) filters.ratingMax = rating;
    }

    // Sort
    const sortBy = searchParams.get('sortBy');
    if (sortBy) {
        filters.sortBy = sortBy;
    }

    // Page
    const page = searchParams.get('page');
    if (page) {
        const pageNum = parseInt(page, 10);
        if (!isNaN(pageNum) && pageNum > 0) filters.page = pageNum;
    }

    return filters;
}

/**
 * Serialize filter options to URL search params
 */
export function serializeFiltersToURL(filters: FilterOptions): URLSearchParams {
    const params = new URLSearchParams();
    const defaults = getDefaultFilters();

    // Only add non-default values to keep URL clean
    if (filters.type && filters.type !== defaults.type) {
        params.set('type', filters.type);
    }

    if (filters.genres && filters.genres.length > 0) {
        params.set('genres', filters.genres.join(','));
    }

    if (filters.providers && filters.providers.length > 0) {
        params.set('providers', filters.providers.join(','));
    }

    if (filters.region && filters.region !== defaults.region) {
        params.set('region', filters.region);
    }

    if (filters.yearFrom !== undefined && filters.yearFrom !== defaults.yearFrom) {
        params.set('yearFrom', filters.yearFrom.toString());
    }

    if (filters.yearTo !== undefined && filters.yearTo !== defaults.yearTo) {
        params.set('yearTo', filters.yearTo.toString());
    }

    if (filters.ratingMin !== undefined && filters.ratingMin !== defaults.ratingMin) {
        params.set('ratingMin', filters.ratingMin.toString());
    }

    if (filters.ratingMax !== undefined && filters.ratingMax !== defaults.ratingMax) {
        params.set('ratingMax', filters.ratingMax.toString());
    }

    if (filters.sortBy && filters.sortBy !== defaults.sortBy) {
        params.set('sortBy', filters.sortBy);
    }

    if (filters.page && filters.page !== defaults.page) {
        params.set('page', filters.page.toString());
    }

    return params;
}

/**
 * Check if any non-default filters are active
 */
export function areFiltersActive(filters: FilterOptions): boolean {
    const defaults = getDefaultFilters();

    return (
        filters.type !== defaults.type ||
        (filters.genres && filters.genres.length > 0) ||
        (filters.providers && filters.providers.length > 0) ||
        filters.yearFrom !== defaults.yearFrom ||
        filters.yearTo !== defaults.yearTo ||
        filters.ratingMin !== defaults.ratingMin ||
        filters.ratingMax !== defaults.ratingMax ||
        filters.sortBy !== defaults.sortBy
    );
}

/**
 * Format filter summary for display as active filter chips
 */
export function formatFilterSummary(
    filters: FilterOptions,
    genres: Genre[],
    providers: WatchProvider[]
): string[] {
    const summary: string[] = [];

    // Type
    if (filters.type && filters.type !== 'all') {
        summary.push(filters.type === 'movie' ? 'Movies' : 'TV Shows');
    }

    // Genres
    if (filters.genres && filters.genres.length > 0) {
        const genreNames = filters.genres
            .map(id => genres.find(g => g.id === id)?.name)
            .filter(Boolean)
            .join(', ');
        if (genreNames) {
            summary.push(`${genreNames}`);
        }
    }

    // Providers
    if (filters.providers && filters.providers.length > 0) {
        const providerNames = filters.providers
            .map(id => providers.find(p => p.provider_id === id)?.provider_name)
            .filter(Boolean)
            .join(', ');
        if (providerNames) {
            summary.push(`On ${providerNames}`);
        }
    }

    // Year range
    if (filters.yearFrom || filters.yearTo) {
        if (filters.yearFrom && filters.yearTo) {
            summary.push(`${filters.yearFrom} - ${filters.yearTo}`);
        } else if (filters.yearFrom) {
            summary.push(`From ${filters.yearFrom}`);
        } else if (filters.yearTo) {
            summary.push(`Until ${filters.yearTo}`);
        }
    }

    // Rating
    if (filters.ratingMin !== undefined && filters.ratingMin > 0) {
        summary.push(`Rating ${filters.ratingMin}+`);
    }

    return summary;
}
