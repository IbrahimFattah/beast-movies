import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search as SearchIcon, Film } from 'lucide-react';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we're on the home page
    const isHomePage = location.pathname === '/';

    // Add scroll listener
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-dark-900/95 backdrop-blur-md' : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20 gap-8">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Film className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <span className="text-xl md:text-2xl font-bold text-white">
                                Beast Movies
                            </span>
                        </Link>
                    </div>

                    {/* Search Bar - Center (Home page only) */}
                    {isHomePage && (
                        <div className="flex-1 max-w-2xl hidden md:block">
                            <form onSubmit={handleSearchSubmit} className="w-full">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search movies & TV shows..."
                                        className="w-full px-4 py-3 pr-12 bg-dark-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border-2 border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
                                    >
                                        <SearchIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Right Side - Profile */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Profile */}
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-semibold text-sm">
                            IB
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
