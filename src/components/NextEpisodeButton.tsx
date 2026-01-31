import { ChevronRight } from 'lucide-react';

interface NextEpisodeButtonProps {
    seasonNumber: number;
    episodeNumber: number;
    onClick: () => void;
    visible: boolean;
}

export function NextEpisodeButton({ seasonNumber, episodeNumber, onClick, visible }: NextEpisodeButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-dark-700/90 backdrop-blur-md text-white px-6 py-3 rounded-lg hover:bg-accent hover:scale-105 transition-all duration-300 shadow-lg border border-white/10 ${
                visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label={`Go to next episode: Season ${seasonNumber}, Episode ${episodeNumber}`}
        >
            <span className="font-semibold">Next Episode</span>
            <span className="text-sm text-white/80">S{seasonNumber}E{episodeNumber}</span>
            <ChevronRight className="w-5 h-5" />
        </button>
    );
}
