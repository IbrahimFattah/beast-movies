import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Clapperboard, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface NavTab {
    label: string;
    icon: typeof Home;
    path: string;
    matchPaths?: string[];
}

const tabs: NavTab[] = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Search', icon: Search, path: '/search' },
    { label: 'Browse', icon: Clapperboard, path: '/browse' },
    { label: 'Profile', icon: User, path: '/watchlist-history', matchPaths: ['/watchlist-history', '/watched'] },
];

export function BottomNavBar() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    const isActive = (tab: NavTab) => {
        if (tab.matchPaths) {
            return tab.matchPaths.some((p) => location.pathname.startsWith(p));
        }
        if (tab.path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(tab.path);
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        if (!isAuthenticated) {
            e.preventDefault();
            setShowAuthModal(true);
        }
    };

    return (
        <>
            <nav className="bottom-nav md:hidden" id="bottom-nav-bar">
                <div className="bottom-nav-inner">
                    {tabs.map((tab) => {
                        const active = isActive(tab);
                        const Icon = tab.icon;
                        const isProfile = tab.label === 'Profile';

                        return (
                            <Link
                                key={tab.label}
                                to={tab.path}
                                onClick={isProfile ? handleProfileClick : undefined}
                                className={`bottom-nav-tab ${active ? 'bottom-nav-tab--active' : ''}`}
                                id={`bottom-nav-${tab.label.toLowerCase()}`}
                            >
                                <div className={`bottom-nav-icon-wrapper ${active ? 'bottom-nav-icon-wrapper--active' : ''}`}>
                                    <Icon
                                        className="bottom-nav-icon"
                                        strokeWidth={active ? 2.5 : 1.5}
                                        fill={active ? 'currentColor' : 'none'}
                                    />
                                </div>
                                <span className={`bottom-nav-label ${active ? 'bottom-nav-label--active' : ''}`}>
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
