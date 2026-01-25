import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { MediaItem } from '../types/media';
import { PosterCard } from './PosterCard';
import { useHorizontalScroll } from '../hooks/useHorizontalScroll';

interface RowCarouselProps {
    items: MediaItem[];
    onRemove?: (tmdbId: number) => void;
}

export function RowCarousel({ items, onRemove }: RowCarouselProps) {
    const { scrollRef, scrollLeft, scrollRight, canScrollLeft, canScrollRight, handleScroll } = useHorizontalScroll();

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (!currentRef) return;

        currentRef.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => {
            currentRef.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll, scrollRef]);

    if (items.length === 0) return null;

    return (
        <div className="relative group/carousel">
            {/* Left Arrow - Enhanced with higher z-index and better visibility */}
            {canScrollLeft && (
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-0 bottom-0 z-[60] w-16 bg-gradient-to-r from-black via-black/90 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 flex items-center justify-start pl-2"
                    aria-label="Scroll left"
                >
                    <div className="w-12 h-12 rounded-full bg-black/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-all duration-300 border-2 border-white/20 hover:border-accent hover:scale-110 shadow-2xl">
                        <ChevronLeft className="w-7 h-7 text-white" strokeWidth={3} />
                    </div>
                </button>
            )}

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item) => (
                    <PosterCard
                        key={item.id}
                        media={item}
                        onRemove={onRemove ? () => onRemove(item.tmdbId) : undefined}
                    />
                ))}
            </div>

            {/* Right Arrow - Enhanced to prevent overlap with cards */}
            {canScrollRight && (
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-0 bottom-0 z-[60] w-16 bg-gradient-to-l from-black via-black/90 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 flex items-center justify-end pr-2"
                    aria-label="Scroll right"
                >
                    <div className="w-12 h-12 rounded-full bg-black/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-all duration-300 border-2 border-white/20 hover:border-accent hover:scale-110 shadow-2xl">
                        <ChevronRight className="w-7 h-7 text-white" strokeWidth={3} />
                    </div>
                </button>
            )}
        </div>
    );
}
