import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronDown } from 'lucide-react';
import { getTVSeasonDetails, buildImageUrl, IMAGE_SIZES } from '../services/tmdb';
import { TMDBEpisode } from '../types/media';
import { LoadingSpinner } from './LoadingSpinner';

interface EpisodeSelectorProps {
    tmdbId: number;
    totalSeasons: number;
    defaultSeason?: number;
}

export function EpisodeSelector({ tmdbId, totalSeasons, defaultSeason = 1 }: EpisodeSelectorProps) {
    const navigate = useNavigate();
    const [selectedSeason, setSelectedSeason] = useState(defaultSeason);
    const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSeasonEpisodes = async () => {
        setLoading(true);
        setError(null);

        try {
            const seasonData = await getTVSeasonDetails(tmdbId, selectedSeason);
            setEpisodes(seasonData.episodes);
        } catch (err) {
            console.error('Error fetching season episodes:', err);
            setError('Failed to load episodes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeasonEpisodes();
    }, [selectedSeason, tmdbId]);

    const handlePlayEpisode = (episodeNumber: number) => {
        navigate(`/watch/tv/${tmdbId}/${selectedSeason}/${episodeNumber}`);
    };

    return (
        <div className="space-y-6">
            {/* Season Selector */}
            <div className="relative inline-block">
                <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                    className="appearance-none bg-dark-700 text-white px-6 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border-2 border-transparent cursor-pointer font-semibold"
                >
                    {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((season) => (
                        <option key={season} value={season}>
                            Season {season}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="md" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-8">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchSeasonEpisodes}
                        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Episode List */}
            {!loading && !error && (
                <div className="space-y-4">
                    {episodes.map((episode) => (
                        <div
                            key={episode.id}
                            className="group relative bg-dark-700 rounded-lg overflow-hidden hover:bg-dark-600 transition-all duration-300 cursor-pointer"
                            onClick={() => handlePlayEpisode(episode.episode_number)}
                        >
                            <div className="flex gap-4">
                                {/* Episode Thumbnail */}
                                <div className="relative w-64 flex-shrink-0 aspect-video bg-dark-600">
                                    <img
                                        src={buildImageUrl(episode.still_path, IMAGE_SIZES.backdropSmall)}
                                        alt={episode.name}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Episode Number Badge */}
                                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-md">
                                        <span className="text-white font-bold text-sm">
                                            {episode.episode_number}
                                        </span>
                                    </div>

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                            <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Episode Info */}
                                <div className="flex-1 py-4 pr-4">
                                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">
                                        {episode.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                                        {episode.overview || 'No description available.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
