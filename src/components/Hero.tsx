import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { MediaItem } from '../types/media';
import { BadgePills } from './BadgePills';

interface HeroProps {
    media: MediaItem;
}

export function Hero({ media }: HeroProps) {
    const navigate = useNavigate();

    const handlePlay = () => {
        if (media.type === 'movie') {
            navigate(`/watch/movie/${media.tmdbId}`);
        } else {
            // For TV, use continue watching info or default to S1E1
            const season = media.continueWatching?.season || 1;
            const episode = media.continueWatching?.episode || 1;
            navigate(`/watch/tv/${media.tmdbId}/${season}/${episode}`);
        }
    };

    const handleSeeMore = () => {
        navigate(`/details/${media.type}/${media.tmdbId}`);
    };

    return (
        <div className="relative w-full h-screen min-h-[600px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={media.backdropUrl}
                    alt={media.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_100%)] opacity-60" />

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl pt-20 md:pt-0">
                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 uppercase tracking-tight">
                        {media.title}
                    </h1>

                    {/* Metadata Pills */}
                    <div className="mb-6">
                        <BadgePills
                            rating={media.rating}
                            year={media.year}
                            genres={media.genres}
                        />
                    </div>

                    {/* Description */}
                    <p className="text-base md:text-lg text-gray-200 mb-8 line-clamp-2 max-w-xl">
                        {media.overview}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Play Button */}
                        <button
                            onClick={handlePlay}
                            className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            <Play className="w-5 h-5 md:w-6 md:h-6 fill-black" />
                            <span className="text-base md:text-lg">Play</span>
                        </button>

                        {/* See More Button */}
                        <button
                            onClick={handleSeeMore}
                            className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white/10 text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
                        >
                            <Info className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="text-base md:text-lg">See More</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </div>
    );
}
