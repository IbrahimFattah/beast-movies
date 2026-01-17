import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { buildVidSrcEmbedUrl } from '../utils/vidsrc';

export function Watch() {
    const { tmdbId, season, episode } = useParams<{
        tmdbId: string;
        season?: string;
        episode?: string;
    }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Extract type from pathname (e.g., /watch/movie/123 or /watch/tv/123/1/1)
    const pathSegments = location.pathname.split('/');
    const type = pathSegments[2]; // /watch/[movie|tv]/...

    if (!type || !tmdbId || (type !== 'movie' && type !== 'tv')) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Invalid URL</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Build embed URL
    let embedUrl: string;
    try {
        if (type === 'movie') {
            embedUrl = buildVidSrcEmbedUrl({
                type: 'movie',
                tmdbId: parseInt(tmdbId),
            });
        } else if (type === 'tv') {
            if (!season || !episode) {
                throw new Error('Season and episode required for TV shows');
            }
            embedUrl = buildVidSrcEmbedUrl({
                type: 'tv',
                tmdbId: parseInt(tmdbId),
                season: parseInt(season),
                episode: parseInt(episode),
            });
        } else {
            throw new Error('Invalid media type');
        }
    } catch (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Error Loading Player
                    </h1>
                    <p className="text-gray-400 mb-6">
                        {error instanceof Error ? error.message : 'Unknown error'}
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header with Back Button */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 text-white hover:text-accent transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                </div>
            </div>

            {/* Video Player */}
            <div className="pt-16 h-screen flex items-center justify-center">
                <div className="w-full max-w-7xl aspect-video bg-black">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title="Video Player"
                    />
                </div>
            </div>
        </div>
    );
}
