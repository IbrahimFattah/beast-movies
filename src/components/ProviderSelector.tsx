import { StreamingProvider, PROVIDERS } from '../types/streaming';

interface ProviderSelectorProps {
    selectedProvider: StreamingProvider;
    onProviderChange: (provider: StreamingProvider) => void;
    visible: boolean;
}

export function ProviderSelector({ selectedProvider, onProviderChange, visible }: ProviderSelectorProps) {
    const providers: StreamingProvider[] = ['vidsrc', 'vidlink', 'vidking'];

    return (
        <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 bg-dark-700/90 backdrop-blur-md rounded-xl p-3 border border-white/10 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <span className="text-white/80 text-sm font-medium px-2">Source:</span>
            <div className="flex gap-2">
                {providers.map((provider) => (
                    <button
                        key={provider}
                        onClick={() => onProviderChange(provider)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${selectedProvider === provider
                                ? 'bg-gradient-to-br from-accent-dark to-accent text-black shadow-lg shadow-accent/30 scale-105'
                                : 'bg-dark-600/80 text-white/90 hover:bg-dark-500/80 hover:text-white border border-white/10'
                            }`}
                    >
                        {PROVIDERS[provider].displayName}
                    </button>
                ))}
            </div>
        </div>
    );
}
