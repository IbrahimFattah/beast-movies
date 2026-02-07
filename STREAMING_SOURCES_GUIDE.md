# 🎬 Streaming Sources Guide - Where to Get Video Links

## Overview

For a custom HTML5 video player, you need **direct video URLs** (HLS streams or MP4 files). Here's where to get them:

---

## ✅ **Option 1: Consumet API (Best for Your Project)**

### What You Already Have

You have a Consumet API instance that I integrated earlier. Here's how to use it:

### Step 1: Install Dependencies

```bash
npm install hls.js
```

### Step 2: Fetch Streaming Links

```typescript
// src/services/streaming.ts
import { 
    findFlixHQByTMDB, 
    getFlixHQInfo, 
    getFlixHQStreamingSources,
    getEpisodeIdFromInfo 
} from './consumet';
import { getMediaDetails } from './tmdb';

export async function getStreamingUrl(
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    season?: number,
    episode?: number
): Promise<{ url: string; quality: string; subtitles: any[] } | null> {
    try {
        // 1. Get TMDB details (title, year)
        const tmdbData = await getMediaDetails(mediaType, tmdbId);
        
        // 2. Find on FlixHQ
        const flixhqMatch = await findFlixHQByTMDB(
            tmdbData.title, 
            tmdbData.year, 
            mediaType
        );
        
        if (!flixhqMatch) {
            throw new Error('Content not found on FlixHQ');
        }
        
        // 3. Get FlixHQ info (with episodes for TV shows)
        const flixhqInfo = await getFlixHQInfo(flixhqMatch.id);
        
        if (!flixhqInfo) {
            throw new Error('Failed to get content info');
        }
        
        // 4. Get episode ID (for TV shows)
        let episodeId: string;
        
        if (mediaType === 'tv' && season && episode) {
            const epId = getEpisodeIdFromInfo(flixhqInfo, season, episode);
            if (!epId) {
                throw new Error(`Episode S${season}E${episode} not found`);
            }
            episodeId = epId;
        } else {
            // For movies, use the movie ID
            episodeId = flixhqMatch.id;
        }
        
        // 5. Get streaming sources (THIS RETURNS THE VIDEO URL!)
        const watchData = await getFlixHQStreamingSources(episodeId, flixhqMatch.id);
        
        if (!watchData || watchData.sources.length === 0) {
            throw new Error('No streaming sources available');
        }
        
        // Return the best quality source
        return {
            url: watchData.sources[0].url,  // Direct HLS URL!
            quality: watchData.sources[0].quality,
            subtitles: watchData.subtitles,
        };
        
    } catch (error) {
        console.error('[Streaming] Failed to get URL:', error);
        return null;
    }
}
```

### Step 3: Create Custom HTML5 Player

```tsx
// src/components/CustomVideoPlayer.tsx
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface CustomVideoPlayerProps {
    streamUrl: string;
    subtitles: { url: string; lang: string }[];
    onTimeUpdate?: (time: number) => void;
}

export function CustomVideoPlayer({ 
    streamUrl, 
    subtitles,
    onTimeUpdate 
}: CustomVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        // Check if HLS is needed
        if (streamUrl.includes('.m3u8')) {
            if (Hls.isSupported()) {
                // Use hls.js for browsers that don't support HLS natively
                const hls = new Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setIsLoading(false);
                    video.play();
                });
                
                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS Error:', data);
                    if (data.fatal) {
                        setIsLoading(false);
                    }
                });
                
                hlsRef.current = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', () => {
                    setIsLoading(false);
                    video.play();
                });
            }
        } else {
            // Direct MP4 or other format
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                setIsLoading(false);
                video.play();
            });
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [streamUrl]);

    // Track playback time
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            onTimeUpdate?.(video.currentTime);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [onTimeUpdate]);

    return (
        <div className="relative w-full h-full bg-black">
            <video
                ref={videoRef}
                className="w-full h-full"
                controls
                playsInline
                crossOrigin="anonymous"
            >
                {/* Add subtitle tracks */}
                {subtitles.map((sub, index) => (
                    <track
                        key={index}
                        kind="subtitles"
                        src={sub.url}
                        srcLang={sub.lang.toLowerCase().substring(0, 2)}
                        label={sub.lang}
                        default={index === 0}
                    />
                ))}
            </video>
            
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-lg">Loading...</div>
                </div>
            )}
        </div>
    );
}
```

### Step 4: Use in Watch Page

```tsx
// src/pages/Watch.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CustomVideoPlayer } from '../components/CustomVideoPlayer';
import { getStreamingUrl } from '../services/streaming';

export function Watch() {
    const { tmdbId, season, episode } = useParams();
    const [streamData, setStreamData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStream = async () => {
            const data = await getStreamingUrl(
                parseInt(tmdbId),
                season ? 'tv' : 'movie',
                season ? parseInt(season) : undefined,
                episode ? parseInt(episode) : undefined
            );
            
            setStreamData(data);
            setLoading(false);
        };

        fetchStream();
    }, [tmdbId, season, episode]);

    if (loading) return <div>Loading player...</div>;
    if (!streamData) return <div>Stream not available</div>;

    return (
        <div className="fixed inset-0">
            <CustomVideoPlayer
                streamUrl={streamData.url}
                subtitles={streamData.subtitles}
                onTimeUpdate={(time) => {
                    // Track progress for continue watching
                    console.log('Current time:', time);
                }}
            />
        </div>
    );
}
```

---

## 🔧 **Option 2: Other Streaming APIs**

### **2movies.to API** (Similar to Consumet)
- Provides streaming links
- Multiple quality options
- HLS streams

```bash
curl "https://api.2movies.to/search?query=Breaking+Bad"
```

### **SuperStream API**
- Android/iOS streaming sources
- Good quality links
- Requires API key

### **VidSrc API** (What you're using now)
- But they don't expose direct links
- That's why you need iframes

---

## 🏗️ **Option 3: Host Your Own Content**

If you want full control:

### AWS S3 + CloudFront
```typescript
// Upload videos to S3
const videoUrl = "https://your-cdn.cloudfront.net/movies/inception.mp4";

<video src={videoUrl} controls />
```

### Cost:
- S3 Storage: ~$0.023 per GB/month
- CloudFront: ~$0.085 per GB transfer
- Expensive for many movies!

---

## 🎯 **Option 4: Embed with Player Control**

Some providers allow URL parameters:

### VidSrc with Time Parameter
```typescript
const embedUrl = `https://vidsrc.to/embed/movie/${tmdbId}?t=${skipTime}`;
// Some players respect the ?t= parameter
```

### VidLink with Timestamp
```typescript
const embedUrl = `https://vidlink.pro/embed/movie/${tmdbId}#t=${skipTime}`;
```

**Note:** This is limited and doesn't work reliably.

---

## 📊 **Comparison Table**

| Source | Pros | Cons | Cost |
|--------|------|------|------|
| **Consumet API** | ✅ Direct HLS links<br>✅ Multiple qualities<br>✅ Subtitles<br>✅ Free | ⚠️ Depends on scrapers<br>⚠️ Links may expire | Free |
| **Own Hosting** | ✅ Full control<br>✅ 100% reliable<br>✅ No DMCA issues | ❌ Very expensive<br>❌ Legal complexity | $$$$ |
| **Iframe Embeds** | ✅ Works now<br>✅ Easy to implement | ❌ No player control<br>❌ Can't skip intro | Free |
| **Other APIs** | ✅ Similar to Consumet<br>✅ Multiple sources | ⚠️ May require API keys<br>⚠️ Rate limits | Free/$ |

---

## ✅ **Recommended Approach for Your Project**

### Use Consumet API (Already Integrated!)

1. **I already built this integration** (it was undone earlier)
2. **You have a Consumet instance** ready to use
3. **Provides direct HLS URLs** for HTML5 video
4. **Free and open-source**

### What You Get:
```typescript
// From Consumet API:
{
  sources: [
    { 
      url: "https://example.com/hls/master.m3u8",  // ← Use this!
      quality: "1080p",
      isM3U8: true 
    }
  ],
  subtitles: [...]
}

// Use in HTML5 video:
<video src="https://example.com/hls/master.m3u8" controls />
```

---

## 🚀 **Quick Implementation Steps**

### 1. Re-enable Consumet Integration

I can restore the Consumet integration I built earlier. It includes:
- Service layer to fetch streaming links
- Custom VideoPlayer component with hls.js
- Quality selector
- Subtitle support

### 2. Update Watch Page

Replace iframe with CustomVideoPlayer:

```tsx
// Instead of:
<iframe src={embedUrl} />

// Use:
<CustomVideoPlayer 
    streamUrl={sources[0].url}
    subtitles={subtitles}
/>
```

### 3. Benefits You Get

✅ **Skip Intro works perfectly** (direct time control)  
✅ **Quality selection** (auto, 1080p, 720p, 480p)  
✅ **Subtitle support** (multiple languages)  
✅ **Progress tracking** (accurate time tracking)  
✅ **Better UX** (native controls, faster loading)  

---

## 🔐 **Legal & Ethical Considerations**

### Important Notes:

1. **Consumet scrapes from third-party sites** (FlixHQ, etc.)
2. **You don't host content** - just link to it
3. **Similar to what VidSrc/VidLink do** - but you control it
4. **Check local laws** about streaming

### Alternatives if concerned:
- Use official APIs (Netflix, Disney+, etc.) - requires licenses
- Host licensed content only
- Use public domain movies
- Educational content only

---

## 💡 **Why Consumet is Perfect for You**

1. ✅ You already have it set up
2. ✅ I already built the integration
3. ✅ Works with your existing TMDB metadata
4. ✅ Provides direct URLs for HTML5 video
5. ✅ Enables Skip Intro feature fully
6. ✅ Better user experience than iframes

---

## 🤔 **Should I Restore the Consumet Integration?**

I can bring back the full implementation I built earlier, which includes:

- ✅ CustomVideoPlayer component (HTML5 video with hls.js)
- ✅ Streaming URL fetching service
- ✅ Quality selector UI
- ✅ Subtitle support
- ✅ Automatic fallback to iframe if Consumet fails
- ✅ Full integration with your Watch page

**This would give you:**
- Direct video control (for Skip Intro)
- Better performance
- Quality options
- Subtitle selection
- Progress tracking

Would you like me to restore it?

---

**TL;DR: Use Consumet API → Get direct HLS URLs → Use with HTML5 `<video>` tag + hls.js → Skip Intro works perfectly!** 🎬
