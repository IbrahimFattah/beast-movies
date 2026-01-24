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
            className={`fixed top-1/2 -translate-y-1/2 right-6 z-40 flex items-center justify-center w-12 h-12 bg-accent/90 backdrop-blur-sm text-white rounded-full hover:bg-accent hover:scale-110 active:scale-95 transition-all shadow-lg ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
                }`}
            aria-label={`Go to next episode: Season ${seasonNumber}, Episode ${episodeNumber}`}
        >
            <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
        </button>
    );
}
