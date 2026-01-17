export function Footer() {
    return (
        <footer className="bg-dark-900 border-t border-white/10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Legal Disclaimer */}
                    <p className="text-gray-400 text-sm text-center md:text-left">
                        This site does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
                    </p>

                    {/* Contact Email */}
                    <a
                        href="mailto:contact@beastmovies.to"
                        className="text-accent hover:text-accent-dark transition-colors text-sm font-medium"
                    >
                        contact@beastmovies.to
                    </a>
                </div>
            </div>
        </footer>
    );
}
