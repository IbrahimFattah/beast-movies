export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
                <p className="text-gray-400 mb-6">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
