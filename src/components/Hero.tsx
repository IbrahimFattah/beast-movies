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
            {/* Background Image with Ken Burns Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <img
                    src={media.backdropUrl}
                    alt={media.title}
                    className="w-full h-full object-cover animate-kenBurns"
                />
            </div>

            {/* Enhanced Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            {/* Enhanced Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

            {/* Content with Staggered Animations */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl pt-20 md:pt-0">
                    {/* Title with fade-in animation */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight animate-slideUp opacity-0">
                        {media.title}
                    </h1>

                    {/* Metadata Pills with delay */}
                    <div className="mb-6 animate-slideUp opacity-0 delay-100">
                        <BadgePills
                            rating={media.rating}
                            year={media.year}
                            genres={media.genres}
                        />
                    </div>

                    {/* Description with delay */}
                    <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3 max-w-xl leading-relaxed animate-slideUp opacity-0 delay-200">
                        {media.overview}
                    </p>

                    {/* Buttons with delay */}
                    <div className="flex flex-wrap items-center gap-4 animate-slideUp opacity-0 delay-300">
                        {/* Play Button with enhanced styling */}
                        <button
                            onClick={handlePlay}
                            className="group flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-accent text-black font-bold text-lg rounded-lg hover:bg-accent-light transition-all duration-300 hover:scale-105 hover:glow-orange shadow-2xl"
                        >
                            <Play className="w-6 h-6 md:w-7 md:h-7 fill-black transition-transform group-hover:scale-110" />
                            <span>Play Now</span>
                        </button>

                        {/* See More Button with glassmorphism */}
                        <button
                            onClick={handleSeeMore}
                            className="group flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 glass text-white font-bold text-lg rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
                        >
                            <Info className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:scale-110" />
                            <span>More Info</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
        </div>
    );
}
