import { useState, useEffect } from 'react';
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
    const [showControls, setShowControls] = useState(true);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            // When exiting fullscreen, show controls
            if (!document.fullscreenElement) {
                setShowControls(true);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
        document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
        document.addEventListener('MSFullscreenChange', handleFullscreenChange); // IE/Edge

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);


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
        <div
            className="fixed inset-0 bg-black"
            onMouseEnter={() => setShowControls(true)}
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onTouchStart={() => setShowControls(!showControls)}
        >
            {/* Back Arrow Overlay - Appears on hover/touch */}
            <div
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showControls
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-full pointer-events-none'
                    }`}
            >
                <div className="p-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center w-12 h-12 text-white hover:text-white/80 transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-8 h-8" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Fullscreen Video Player */}
            <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Video Player"
            />
        </div>
    );
}
