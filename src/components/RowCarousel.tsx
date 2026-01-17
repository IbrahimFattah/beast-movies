import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { MediaItem } from '../types/media';
import { PosterCard } from './PosterCard';
import { useHorizontalScroll } from '../hooks/useHorizontalScroll';

interface RowCarouselProps {
    items: MediaItem[];
}

export function RowCarousel({ items }: RowCarouselProps) {
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
            {/* Left Arrow */}
            {canScrollLeft && (
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-black via-black/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    aria-label="Scroll left"
                >
                    <div className="w-10 h-10 rounded-full bg-dark-700/80 backdrop-blur-sm flex items-center justify-center hover:bg-dark-600 transition-colors">
                        <ChevronLeft className="w-6 h-6 text-white" />
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
                    <PosterCard key={item.id} media={item} />
                ))}
            </div>

            {/* Right Arrow */}
            {canScrollRight && (
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-black via-black/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    aria-label="Scroll right"
                >
                    <div className="w-10 h-10 rounded-full bg-dark-700/80 backdrop-blur-sm flex items-center justify-center hover:bg-dark-600 transition-colors">
                        <ChevronRight className="w-6 h-6 text-white" />
                    </div>
                </button>
            )}
        </div>
    );
}
