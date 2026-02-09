-- Migration: Add watchlist history tracking and watched items checklist

-- Watchlist history: logs every add/remove action for the last 30 days view
CREATE TABLE IF NOT EXISTS watchlist_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type VARCHAR(10) NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('added', 'removed')),
    action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watched items: user's checklist of movies/TV shows they have watched
CREATE TABLE IF NOT EXISTS watched_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type VARCHAR(10) NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tmdb_id, media_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_watchlist_history_user_id ON watchlist_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_history_action_at ON watchlist_history(action_at);
CREATE INDEX IF NOT EXISTS idx_watched_items_user_id ON watched_items(user_id);
