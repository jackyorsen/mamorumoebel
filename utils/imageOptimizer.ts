
/**
 * HIGH-END IMAGE OPTIMIZATION SYSTEM
 * Handles WebP Conversion, LQIP, Thumbnails, and LocalStorage Caching.
 */

// Helper: safe local storage wrapper to handle quotas
const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // If quota exceeded, clear our specific cache items and try again
    console.warn("LocalStorage quota exceeded. Clearing image cache...");
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith("img_")) localStorage.removeItem(k);
    });
    try {
      localStorage.setItem(key, value);
    } catch (e2) {
      console.error("Failed to cache image even after cleanup", e2);
    }
  }
};

// 1. Convert Image URL to WebP Data URL (High Quality)
async function convertToWebP(imgUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (!imgUrl) return resolve("");

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(imgUrl);
        
        ctx.drawImage(img, 0, 0);
        // Quality 0.8 is a good balance for full images
        resolve(canvas.toDataURL("image/webp", 0.8));
      } catch (err) {
        // Fallback to original if CORS or Canvas fails
        resolve(imgUrl);
      }
    };

    img.onerror = () => resolve(imgUrl);
  });
}

// 2. Generate Thumbnail (Resized WebP)
async function generateThumbnail(imgUrl: string, maxWidth: number = 300): Promise<string> {
  return new Promise((resolve) => {
    if (!imgUrl) return resolve("");

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;

    img.onload = () => {
      try {
        const scale = maxWidth / img.width;
        // Don't upscale
        const finalScale = scale > 1 ? 1 : scale;
        
        const width = img.width * finalScale;
        const height = img.height * finalScale;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(imgUrl);

        // Better scaling quality hack (stepping down) not strictly needed for 300px but good practice
        ctx.drawImage(img, 0, 0, width, height);

        // Quality 0.7 for thumbnails is sufficient
        resolve(canvas.toDataURL("image/webp", 0.7));
      } catch (e) {
        resolve(imgUrl);
      }
    };

    img.onerror = () => resolve(imgUrl);
  });
}

// 3. LQIP (Low Quality Image Preview) - Tiny blurry version
async function generateLQIP(imgUrl: string): Promise<string> {
  // 20px width is enough for a blur placeholder
  return generateThumbnail(imgUrl, 20); 
}

// 4. Main Accessor: Get Optimized Image (Cached or Generated)
// variant: 'full' | 'small' | 'lqip'
export async function getOptimizedImage(url: string, variant: 'full' | 'small' | 'lqip'): Promise<string> {
  if (!url || url.startsWith('data:')) return url || "";

  // Unique Cache Key
  const key = `img_${variant}_${url}`;
  
  // Check Cache
  const cached = localStorage.getItem(key);
  if (cached) return cached;

  // Generate
  let result = "";
  if (variant === 'lqip') {
    result = await generateLQIP(url);
  } else if (variant === 'small') {
    result = await generateThumbnail(url, 300);
  } else {
    // For 'full', we prefer browser cache usually, but prompt requests WebP conversion.
    // NOTE: Caching full-size base64 strings in LocalStorage is dangerous for performance/quota.
    // We will generate the WebP for display, but be cautious about caching massive strings.
    result = await convertToWebP(url);
  }

  // Cache result (if it's not the original URL which signifies failure)
  if (result && result !== url) {
    // Only cache LQIP and Small variants aggressively. 
    // Full images might be too large for LS.
    if (variant !== 'full' || result.length < 500000) { // 500KB limit for single LS item
       safeSetItem(key, result);
    }
  }

  return result;
}
