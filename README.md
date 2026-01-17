# 🎬 Beast Movies

A modern, cinematic streaming platform UI built with React, TypeScript, and TailwindCSS. Features a Netflix-inspired design with dark aesthetics, smooth animations, and responsive layouts.

![Beast Movies](https://placehold.co/1200x630/000000/e50914?text=Beast+Movies)

## ✨ Features

- 🎥 **Cinematic Hero Section** - Full-width backdrop with gradient overlays and vignette effects
- 🎨 **Modern Dark UI** - Sleek Netflix-inspired design with custom color palette
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- 🔄 **Smooth Animations** - Hover effects, transitions, and micro-interactions
- 🎯 **Smart Routing** - React Router with support for movies and TV shows
- 📺 **Video Player Integration** - Vidking embed URL builder for streaming
- 🎭 **Continue Watching** - Track viewing progress across content
- 🚀 **Performance Optimized** - Built with Vite for lightning-fast development

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Code Quality:** ESLint + Prettier
- **CI/CD:** GitHub Actions

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd beast-movies
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Currently, the app uses mock data and doesn't require any API keys. If you want to integrate with real APIs later, add your keys to `.env`:

```env
# VITE_API_BASE_URL=https://api.example.com
# VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

## 🏗️ Project Structure

```
beast-movies/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI workflow
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── BadgePills.tsx
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   ├── PosterCard.tsx
│   │   ├── RowCarousel.tsx
│   │   └── SectionTitle.tsx
│   ├── data/
│   │   └── media.ts        # Mock data
│   ├── hooks/
│   │   └── useHorizontalScroll.ts
│   ├── pages/
│   │   ├── Details.tsx     # Media details page
│   │   ├── Home.tsx        # Home page
│   │   └── Watch.tsx       # Video player page
│   ├── types/
│   │   └── media.ts        # TypeScript interfaces
│   ├── utils/
│   │   └── vidking.ts      # Vidking URL builder
│   ├── App.tsx             # Main app component
│   ├── index.css           # Global styles
│   ├── main.tsx            # App entry point
│   └── vite-env.d.ts       # Vite type definitions
├── .env.example            # Environment variables template
├── .eslintrc.cjs           # ESLint configuration
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier configuration
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🎯 Features Deep Dive

### Hero Section
- Full-width 16:9 backdrop image
- Strong left-to-right gradient overlay
- Vignette effect for cinematic feel
- Metadata pills (rating, year, genre)
- Interactive "Play" and "See More" buttons

### Navigation
- Translucent navbar with backdrop blur
- Logo, navigation links, search icon, and profile avatar
- Changes background on scroll for better readability

### Content Rows
- Horizontal scrollable carousels
- Smooth scroll with arrow buttons
- Hover effects on poster cards
- Continue watching progress indicators

### Video Player
- Vidking iframe embed integration
- Support for both movies and TV shows
- Auto-play and episode selector options
- Full-screen capable

## 🌐 Deployment

This project is configured for static hosting and can be deployed to:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## ⚠️ Important Notes

### Vidking Embed Disclaimer

The Watch page uses the Vidking embed service. The `buildVidkingEmbedUrl()` utility in `src/utils/vidking.ts` generates embed URLs in the following format:

- **Movies:** `https://www.vidking.net/embed/movie/{tmdbId}`
- **TV Shows:** `https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}`

Please ensure you have the necessary rights and permissions to embed content from third-party services.

### Mock Data

The app currently uses placeholder images and mock data located in `src/data/media.ts`. To integrate real data:

1. Replace placeholder URLs with real TMDB image URLs
2. Integrate with TMDB API or your backend
3. Update the data fetching logic in components

## 🧪 Continuous Integration

GitHub Actions automatically runs the following checks on every push and pull request:

- ✅ TypeScript type checking
- ✅ ESLint linting
- ✅ Production build

See `.github/workflows/ci.yml` for the complete CI configuration.

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow semantic commit messages:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Design inspiration from Netflix and modern streaming platforms
- Icons by [Lucide](https://lucide.dev/)
- Fonts from [Google Fonts](https://fonts.google.com/)

---

**Built with ❤️ using React, TypeScript, and TailwindCSS**
