-- Initial schema for Beast Movies authentication system

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type VARCHAR(10) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tmdb_id, media_type)
);

-- Watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type VARCHAR(10) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tmdb_id, media_type)
);

-- Continue watching table
CREATE TABLE IF NOT EXISTS continue_watching (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type VARCHAR(10) NOT NULL,
    progress FLOAT DEFAULT 0,
    season INTEGER,
    episode INTEGER,
    last_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tmdb_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_continue_watching_user_id ON continue_watching(user_id);
