import { useState } from 'react';
import { X, User as UserIcon, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (tab === 'login') {
                await login(username, password);
            } else {
                await signup(username, email, password);
            }
            onClose();
            // Reset form
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="relative w-full max-w-md bg-dark-800 rounded-lg p-8">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Tabs */}
                <div className="flex gap-8 mb-8 border-b border-gray-700">
                    <button
                        onClick={() => {
                            setTab('login');
                            setError('');
                        }}
                        className={`pb-3 text-lg font-medium transition-colors relative ${tab === 'login' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Login
                        {tab === 'login' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setTab('signup');
                            setError('');
                        }}
                        className={`pb-3 text-lg font-medium transition-colors relative ${tab === 'signup' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Sign up
                        {tab === 'signup' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                        )}
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username */}
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                            className="w-full px-12 py-4 bg-dark-700 text-white rounded-lg border-2 border-transparent focus:border-gray-600 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Email (signup only) */}
                    {tab === 'signup' && (
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                                className="w-full px-12 py-4 bg-dark-700 text-white rounded-lg border-2 border-transparent focus:border-gray-600 focus:outline-none transition-colors"
                            />
                        </div>
                    )}

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            minLength={6}
                            className="w-full px-12 py-4 bg-dark-700 text-white rounded-lg border-2 border-transparent focus:border-gray-600 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    {/* Forgot Password (login only) */}
                    {tab === 'login' && (
                        <div className="text-center">
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : tab === 'login' ? 'Login' : 'Sign up'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white font-medium rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
