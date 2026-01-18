import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Details } from './pages/Details';
import { Watch } from './pages/Watch';
import { Search } from './pages/Search';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="min-h-screen bg-black font-sans antialiased flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/details/:type/:tmdbId" element={<Details />} />
                            <Route path="/watch/movie/:tmdbId" element={<Watch />} />
                            <Route path="/watch/tv/:tmdbId/:season/:episode" element={<Watch />} />
                            <Route
                                path="*"
                                element={
                                    <div className="min-h-screen flex items-center justify-center">
                                        <div className="text-center">
                                            <h1 className="text-4xl font-bold text-white mb-4">
                                                404 - Page Not Found
                                            </h1>
                                            <a
                                                href="/"
                                                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors inline-block"
                                            >
                                                Go Home
                                            </a>
                                        </div>
                                    </div>
                                }
                            />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

