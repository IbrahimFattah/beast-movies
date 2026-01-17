import { useRef, useState, useCallback } from 'react';

interface UseHorizontalScrollReturn {
    scrollRef: React.RefObject<HTMLDivElement>;
    scrollLeft: () => void;
    scrollRight: () => void;
    canScrollLeft: boolean;
    canScrollRight: boolean;
    handleScroll: () => void;
}

export function useHorizontalScroll(): UseHorizontalScrollReturn {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    const scrollLeft = useCallback(() => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth * 0.8;
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }, []);

    const scrollRight = useCallback(() => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth * 0.8;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }, []);

    return {
        scrollRef,
        scrollLeft,
        scrollRight,
        canScrollLeft,
        canScrollRight,
        handleScroll,
    };
}
