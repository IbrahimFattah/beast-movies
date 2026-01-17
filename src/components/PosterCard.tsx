import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { MediaItem } from '../types/media';

interface PosterCardProps {
    media: MediaItem;
}

export function PosterCard({ media }: PosterCardProps) {
    const detailsUrl = `/details/${media.type}/${media.tmdbId}`;
    const mediaTypeLabel = media.type === 'movie' ? 'Movie' : 'TV Show';

    return (
        <Link
            to={detailsUrl}
            className="group relative flex-shrink-0 w-40 md:w-48 transition-transform duration-300 hover:scale-105 hover:z-50"
        >
            {/* Poster Image */}
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-dark-700">
                <img
                    src={media.posterUrl}
                    alt={media.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Play Button - Centered */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform transition-transform group-hover:scale-110">
                            <Play className="w-8 h-8 text-black fill-black ml-1" />
                        </div>
                    </div>

                    {/* Bottom Info - Gradient Background */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-3 px-3">
                        {/* Title */}
                        <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                            {media.title}
                        </h3>

                        {/* Media Type and Rating */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-xs">
                                {mediaTypeLabel}
                            </span>
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-accent fill-accent" />
                                <span className="text-white text-xs font-semibold">
                                    {media.rating.toFixed(1)}/10
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Continue Watching Progress Bar */}
                {media.continueWatching && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-600">
                        <div
                            className="h-full bg-accent transition-all"
                            style={{ width: `${media.continueWatching.progress}%` }}
                        />
                    </div>
                )}
            </div>
        </Link>
    );
}
