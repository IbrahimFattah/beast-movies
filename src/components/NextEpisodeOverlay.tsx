import { Play, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NextEpisodeOverlayProps {
    episodeThumbnail: string;
    episodeTitle: string;
    seasonNumber: number;
    episodeNumber: number;
    totalSeconds: number;
    onHide: () => void;
    onCountdownComplete: () => void;
    onPlayNow: () => void;
}

export function NextEpisodeOverlay({
    episodeThumbnail,
    episodeTitle,
    seasonNumber,
    episodeNumber,
    totalSeconds,
    onHide,
    onCountdownComplete,
    onPlayNow,
}: NextEpisodeOverlayProps) {
    const [countdown, setCountdown] = useState(totalSeconds);

    useEffect(() => {
        // Start countdown
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onCountdownComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onCountdownComplete]);

    const progressPercentage = ((totalSeconds - countdown) / totalSeconds) * 100;

    return (
        <div className="fixed top-6 right-6 z-50 w-80 bg-black/90 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden shadow-2xl animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-white font-semibold text-sm">Next Up</span>
                <button
                    onClick={onHide}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Hide next episode"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Thumbnail with Play Button - Clickable */}
                <button
                    onClick={onPlayNow}
                    className="relative w-full aspect-video rounded-md overflow-hidden mb-3 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    aria-label="Play next episode now"
                >
                    <img
                        src={episodeThumbnail}
                        alt={episodeTitle}
                        className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform">
                            <Play className="w-8 h-8 text-black fill-black ml-1" />
                        </div>
                    </div>

                    {/* Countdown Badge */}
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-md pointer-events-none">
                        <span className="text-white font-bold text-sm">{countdown}s</span>
                    </div>
                </button>

                {/* Episode Info */}
                <div className="space-y-1">
                    <p className="text-gray-400 text-xs font-medium">
                        Season {seasonNumber}, Episode {episodeNumber}
                    </p>
                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug">
                        {episodeTitle}
                    </h3>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/10">
                <div
                    className="h-full bg-accent transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
    );
}
