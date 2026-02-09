import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search as SearchIcon, User, LogOut, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();

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

    // Clear search query when navigating to home page
    useEffect(() => {
        if (isHomePage) {
            setSearchQuery('');
        }
    }, [isHomePage]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = async () => {
        await logout();
        setShowUserMenu(false);
    };


    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? 'glass shadow-2xl'
                    : 'bg-gradient-to-b from-black/80 to-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20 gap-8">
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <Link to="/" className="flex items-center gap-3 group">
                                <img
                                    src="/beast-logo.png"
                                    alt="Beast Movies Logo"
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg group-hover:scale-105 transition-transform object-contain"
                                />
                                <span className="text-xl md:text-2xl font-bold" style={{ color: '#f4a029' }}>
                                    Beast Movies
                                </span>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                            <Link
                                to="/"
                                className={`text-white hover:text-accent transition-colors font-medium ${location.pathname === '/' ? 'text-accent' : ''
                                    }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/browse"
                                className={`text-white hover:text-accent transition-colors font-medium ${location.pathname === '/browse' ? 'text-accent' : ''
                                    }`}
                            >
                                Browse
                            </Link>
                            <Link
                                to="/search"
                                className={`text-white hover:text-accent transition-colors font-medium ${location.pathname === '/search' ? 'text-accent' : ''
                                    }`}
                            >
                                Search
                            </Link>
                        </div>

                        {/* Search Bar - Center (Home page only) */}
                        {isHomePage && (
                            <div className="flex-1 max-w-2xl hidden lg:block">
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

                        {/* Right Side - User Auth */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="hidden md:inline">{user?.username}</span>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-dark-800 rounded-lg shadow-lg py-2 border border-gray-700">
                                            <Link
                                                to="/watched"
                                                onClick={() => setShowUserMenu(false)}
                                                className="w-full px-4 py-2 hover:bg-dark-700 transition-colors flex items-center gap-2 text-white"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Watched Checklist
                                            </Link>
                                            <Link
                                                to="/watchlist-history"
                                                onClick={() => setShowUserMenu(false)}
                                                className="w-full px-4 py-2 hover:bg-dark-700 transition-colors flex items-center gap-2 text-white"
                                            >
                                                <Clock className="w-4 h-4" />
                                                Watchlist History
                                            </Link>
                                            <div className="border-t border-gray-700 my-1" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left hover:bg-dark-700 transition-colors flex items-center gap-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark rounded-lg transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="hidden md:inline">Login</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
