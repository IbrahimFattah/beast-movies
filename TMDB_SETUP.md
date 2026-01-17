# Setting Up Your TMDB API Key

## 1. Get Your API Key

1. Go to https://www.themoviedb.org/
2. Create a free account (or login if you already have one)
3. Go to Settings → API
4. Request an API key (choose "Developer" option)
5. Fill out the form (you can use "Personal" for the API use case)
6. Copy your API key

## 2. Add to Your Project

Open the `.env` file in the root of the project and replace `your_tmdb_api_key_here` with your actual API key:

```env
VITE_TMDB_API_KEY=your_actual_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

## 3. Restart the Dev Server

After adding your API key, restart the development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## 4. Test the Integration

- Browse to http://localhost:3000
- You should see real movies and TV shows from TMDB
- Click on any content to see details
- Click "Watch Now" to test VidKing integration with real TMDB IDs

---

**Note:** The `.env` file is gitignored, so your API key will not be committed to version control.
