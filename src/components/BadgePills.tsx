interface BadgePillsProps {
    rating?: number;
    year?: number;
    genres?: string[];
}

export function BadgePills({ rating, year, genres }: BadgePillsProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {rating && (
                <span className="px-3 py-1 text-sm font-medium text-white border border-white/30 rounded-full backdrop-blur-sm">
                    ⭐ {rating.toFixed(1)}/10
                </span>
            )}
            {year && (
                <span className="px-3 py-1 text-sm font-medium text-white border border-white/30 rounded-full backdrop-blur-sm">
                    {year}
                </span>
            )}
            {genres && genres.length > 0 && (
                <span className="px-3 py-1 text-sm font-medium text-white border border-white/30 rounded-full backdrop-blur-sm">
                    {genres[0]}
                </span>
            )}
        </div>
    );
}
