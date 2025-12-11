
import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImage } from '../utils/imageOptimizer';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  variant?: 'small' | 'full'; // small for grids (300px), full for details
  className?: string; // Applied to the wrapper div
  imgClassName?: string; // Applied directly to the img tag
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  variant = 'small', 
  className = '', 
  imgClassName = '',
  alt,
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(""); // Starts empty or LQIP
  const [isLoaded, setIsLoaded] = useState(false);
  const [lqipSrc, setLqipSrc] = useState<string>("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const processImage = async () => {
      // 1. Reset state on src change
      setIsLoaded(false);

      // 2. Try to get LQIP from cache immediately
      // We assume LQIP generation is fast enough or cached
      const lqip = await getOptimizedImage(src, 'lqip');
      if (mountedRef.current) {
        setLqipSrc(lqip);
        setCurrentSrc(lqip); // Show LQIP initially
      }

      // 3. Load the actual target image (WebP/Optimized)
      const highRes = await getOptimizedImage(src, variant as 'small' | 'full');
      
      if (mountedRef.current) {
        // Preload image object to ensure browser has it ready before switching src
        const imgObj = new Image();
        imgObj.src = highRes;
        imgObj.onload = () => {
          if (mountedRef.current) {
            setCurrentSrc(highRes);
            setIsLoaded(true);
          }
        };
      }
    };

    processImage();

    return () => {
      mountedRef.current = false;
    };
  }, [src, variant]);

  return (
    <div className={`optimized-img-wrapper ${className}`}>
        {/* Background LQIP (always blurred) to prevent white flash if main image takes time to decode */}
        <div 
            style={{ 
                backgroundImage: `url(${lqipSrc})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                filter: 'blur(20px)',
                position: 'absolute',
                inset: 0,
                zIndex: 0
            }} 
        />
        
        {/* Main Image */}
        <img
            src={currentSrc}
            alt={alt}
            className={`optimized-img relative z-10 ${isLoaded ? 'loaded' : ''} ${imgClassName}`}
            loading="lazy"
            {...props}
        />
    </div>
  );
};
