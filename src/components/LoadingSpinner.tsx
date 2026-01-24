export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizeClasses[size]} relative animate-glowPulse`}>
                <div
                    className="absolute inset-0 rounded-full border-4 border-t-accent border-r-accent-light border-b-transparent border-l-transparent animate-spin"
                    style={{ animationDuration: '1s' }}
                />
                <div
                    className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-transparent border-b-accent border-l-accent-dark animate-spin"
                    style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
                />
            </div>
        </div>
    );
}
