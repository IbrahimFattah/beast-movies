# Search Feature - Quick Guide

## How to Use

### 1. Click the Search Icon
In the top-right corner of the navbar, click the 🔍 search icon

### 2. Enter Your Search
- An input field will expand
- Type the name of a movie or TV show
- Press Enter or click the search button

### 3. View Results
- You'll be taken to `/search?q=your_query`
- Results display in a grid layout
- Click any card to view details

## Features

✅ **Expandable Search Input** - Clean UI that expands when needed  
✅ **Real-time TMDB Search** - Uses `searchMulti()` API  
✅ **Grid Results** - Same poster cards as home page  
✅ **Loading States** - Spinner while searching  
✅ **Error Handling** - User-friendly error messages  
✅ **Empty States** - Helpful messages when no results found  
✅ **Result Count** - Shows how many results were found  
✅ **Close Button** - X button to collapse search input  

## Technical Details

**Components:**
- [Navbar.tsx](file:///Users/ibrahimabdfelfattah/Documents/beast-movies/src/components/Navbar.tsx) - Expandable search input
- [Search.tsx](file:///Users/ibrahimabdfelfattah/Documents/beast-movies/src/pages/Search.tsx) - Search results page

**Route:** `/search?q={query}`

**API:** Uses `searchMulti()` from TMDB service

**Filters:** Automatically filters out people from results (movies & TV shows only)

## Try It!

1. Go to http://localhost:3000
2. Click the search icon (🔍)
3. Search for "Inception" or "Breaking Bad"
4. See real results from TMDB!
