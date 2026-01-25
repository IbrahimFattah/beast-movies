export type StreamingProvider = 'vidsrc' | 'vidlink' | 'vidking';

export interface ProviderMetadata {
    id: StreamingProvider;
    name: string;
    displayName: string;
}

export const PROVIDERS: Record<StreamingProvider, ProviderMetadata> = {
    vidsrc: {
        id: 'vidsrc',
        name: 'vidsrc',
        displayName: 'VidSrc',
    },
    vidlink: {
        id: 'vidlink',
        name: 'vidlink',
        displayName: 'VidLink',
    },
    vidking: {
        id: 'vidking',
        name: 'vidking',
        displayName: 'VidKing',
    },
};

export const DEFAULT_PROVIDER: StreamingProvider = 'vidlink';
