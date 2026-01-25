import { Link } from 'react-router-dom';
import { Play, Star, X } from 'lucide-react';
import { MediaItem } from '../types/media';

interface PosterCardProps {
    media: MediaItem;
    onRemove?: () => void;
}

export function PosterCard({ media, onRemove }: PosterCardProps) {
    // If item has continue watching data, link directly to watch page to resume
    // Otherwise, link to details page
    let linkUrl: string;

    if (media.continueWatching) {
        if (media.type === 'tv' && media.continueWatching.season && media.continueWatching.episode) {
            // Resume TV show at saved episode
            linkUrl = `/watch/tv/${media.tmdbId}/${media.continueWatching.season}/${media.continueWatching.episode}`;
        } else {
            // Resume movie
            linkUrl = `/watch/movie/${media.tmdbId}`;
        }
    } else {
        // No continue watching data, go to details
        linkUrl = `/details/${media.type}/${media.tmdbId}`;
    }

    const mediaTypeLabel = media.type === 'movie' ? 'Movie' : 'TV Show';

    return (
        <Link
            to={linkUrl}
            className="group relative flex-shrink-0 w-40 md:w-48 transition-all duration-500 hover:scale-110 hover:z-50"
        >
            {/* Poster Image Container */}
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-700 shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:glow-orange-sm">
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[2px] bg-gradient-to-br from-accent via-accent-light to-accent">
                    <div className="w-full h-full rounded-xl bg-dark-700" />
                </div>

                <img
                    src={media.posterUrl}
                    alt={media.title}
                    className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Enhanced Hover Overlay with glassmorphism */}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    {/* Play Button - Centered with glow */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:glow-orange">
                            <Play className="w-8 h-8 md:w-10 md:h-10 text-black fill-black ml-1" />
                        </div>
                    </div>

                    {/* Bottom Info with glass effect */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 glass rounded-b-xl">
                        {/* Title */}
                        <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
                            {media.title}
                        </h3>

                        {/* Media Type and Rating */}
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-300 font-medium">
                                {mediaTypeLabel}
                            </span>
                            <div className="flex items-center gap-1 px-2 py-1 bg-black/40 rounded-full">
                                <Star className="w-3 h-3 text-accent fill-accent" />
                                <span className="text-white font-bold">
                                    {media.rating.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Remove Button - Only for Continue Watching items with onRemove handler */}
                    {media.continueWatching && onRemove && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="absolute top-5 right-3 z-30 w-8 h-8 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:scale-110 border border-white/20 hover:border-accent shadow-lg hover:glow-orange-sm"
                            aria-label="Remove from Continue Watching"
                        >
                            <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                {/* Continue Watching Progress Bar with orange glow */}
                {media.continueWatching && (
                    <div className="absolute bottom-0 left-0 right-0 z-30 h-1.5 bg-dark-600">
                        <div
                            className="h-full bg-gradient-to-r from-accent-dark to-accent transition-all duration-500 shadow-lg glow-orange-sm"
                            style={{ width: `${media.continueWatching.progress}%` }}
                        />
                    </div>
                )}
            </div>
        </Link>
    );
}
