import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserAppContext } from '../../../../context/UserAppContext';

const BusImage = ({ images }) => {
  const { backendUrl } = useContext(UserAppContext);
  const [imageStatus, setImageStatus] = useState({});
  const [useFallback, setUseFallback] = useState({});
  const [useDriveThumbnail, setUseDriveThumbnail] = useState({});
  const [loadAttempts, setLoadAttempts] = useState({});
  const timeoutRefs = useRef({});

  // Mapping of keys to placeholder text labels
  const imageMapping = {
    front: 'Front Image',
    back: 'Back Image',
    left: 'Left Side Image',
    right: 'Right Side Image'
  };

  // Fixed order of image keys
  const keys = ['front', 'back', 'left', 'right'];

  // Extract Google Drive file ID from URL
  const extractFileId = (url) => {
    if (!url) return null;

    // Format: drive.google.com/file/d/ID/...
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/file\/d\/([^/]+)/);
      if (match && match[1]) return match[1];
    }

    // Format: drive.google.com/open?id=ID
    if (url.includes('drive.google.com/open?id=')) {
      const match = url.match(/id=([^&]+)/);
      if (match && match[1]) return match[1];
    }

    // Format: already contains "uc?export=view&id=" or "uc?export=download&id="
    if (url.includes('drive.google.com/uc?export=')) {
      const match = url.match(/id=([^&]+)/);
      if (match && match[1]) return match[1];
    }

    return null;
  };

  // Get Google Drive thumbnail URL as ultimate fallback
  const getDriveThumbnailUrl = (url) => {
    const fileId = extractFileId(url);
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    return '';
  };

  // Get original Google Drive URL (for first fallback)
  const getOriginalDriveUrl = (url) => {
    const fileId = extractFileId(url);
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
  };

  // Helper function to transform Google Drive URLs to use our proxy
  const transformGoogleDriveUrl = (url, key) => {
    if (!url) return '';

    // If not a Google Drive URL, return as is
    if (!url.includes('drive.google.com')) {
      return url;
    }

    // Use direct thumbnail if second fallback
    if (useDriveThumbnail[key]) {
      return getDriveThumbnailUrl(url);
    }

    // Use original URL if first fallback
    if (useFallback[key]) {
      return getOriginalDriveUrl(url);
    }

    // Use proxy as first attempt - add cache-busting parameter
    const fileId = extractFileId(url);
    // Make sure our cache-busting is effective by using a more specific timestamp
    return fileId ? `${backendUrl}/api/bus/image-proxy?id=${fileId}&t=${new Date().getTime()}_${Math.random().toString(36).substring(2, 8)}` : url;
  };

  // Pre-process all images when the component mounts or images change
  useEffect(() => {
    const newStatus = {};
    const newLoadAttempts = {};

    // Clear any existing timeouts
    Object.keys(timeoutRefs.current).forEach(key => {
      if (timeoutRefs.current[key]) {
        clearTimeout(timeoutRefs.current[key]);
      }
    });

    keys.forEach(key => {
      newStatus[key] = 'loading';
      newLoadAttempts[key] = 0;
    });

    setImageStatus(newStatus);
    setLoadAttempts(newLoadAttempts);
    setUseFallback({});
    setUseDriveThumbnail({});

    // Preload all images at once to improve loading speed
    if (images) {
      keys.forEach(key => {
        if (images[key]) {
          // Start loading the image
          const img = new Image();
          const url = transformGoogleDriveUrl(images[key], key);
          img.crossOrigin = "anonymous";
          img.referrerPolicy = "no-referrer";

          img.onload = () => handleImageLoad(key);
          img.onerror = () => handleImageError(key);

          // Set timeout for slow loading images
          timeoutRefs.current[key] = setTimeout(() => {
            if (imageStatus[key] === 'loading') {
              handleImageError(key);
            }
          }, 5000);

          // Start loading
          img.src = url;
        }
      });
    }

    // Cleanup timeouts on unmount
    return () => {
      Object.keys(timeoutRefs.current).forEach(key => {
        if (timeoutRefs.current[key]) {
          clearTimeout(timeoutRefs.current[key]);
        }
      });
    };
  }, [images]);

  // Handle successful image load
  const handleImageLoad = (key) => {
    // Clear timeout for this image
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      timeoutRefs.current[key] = null;
    }

    setImageStatus(prev => ({
      ...prev,
      [key]: 'loaded'
    }));
  };

  // Handle image load error with smart retry logic
  const handleImageError = (key) => {
    // Clear timeout for this image
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      timeoutRefs.current[key] = null;
    }

    // Track attempts to prevent infinite loops
    setLoadAttempts(prev => {
      const newAttempts = { ...prev, [key]: (prev[key] || 0) + 1 };

      // If we've tried too many times, mark as error
      if (newAttempts[key] > 3) {
        setImageStatus(prev => ({
          ...prev,
          [key]: 'error'
        }));
        return newAttempts;
      }

      // Otherwise try fallbacks in sequence
      if (!useFallback[key]) {
        setUseFallback(prev => ({
          ...prev,
          [key]: true
        }));

        // Immediately start loading with the new URL
        setTimeout(() => {
          const img = new Image();
          const url = transformGoogleDriveUrl(images[key], key);
          img.crossOrigin = "anonymous";
          img.referrerPolicy = "no-referrer";
          img.onload = () => handleImageLoad(key);
          img.onerror = () => handleImageError(key);
          img.src = url;
        }, 10);
      } else if (!useDriveThumbnail[key]) {
        setUseDriveThumbnail(prev => ({
          ...prev,
          [key]: true
        }));

        // Immediately start loading with the new URL
        setTimeout(() => {
          const img = new Image();
          const url = transformGoogleDriveUrl(images[key], key);
          img.crossOrigin = "anonymous";
          img.referrerPolicy = "no-referrer";
          img.onload = () => handleImageLoad(key);
          img.onerror = () => handleImageError(key);
          img.src = url;
        }, 10);
      } else {
        setImageStatus(prev => ({
          ...prev,
          [key]: 'error'
        }));
      }

      return newAttempts;
    });
  };

  // Helper to get loading message based on current state
  const getLoadingMessage = (key) => {
    const attempts = loadAttempts[key] || 0;

    if (useDriveThumbnail[key]) {
      return `Trying thumbnail... (attempt ${attempts}/3)`;
    }

    if (useFallback[key]) {
      return `Trying alternative source... (attempt ${attempts}/3)`;
    }

    return `Loading image... (attempt ${attempts}/3)`;
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-center border-t border-neutral-300 pt-7 pb-2">
      {keys.map((key, index) => {
        let url = images && images[key] ? images[key] : '';
        url = transformGoogleDriveUrl(url, key);
        const status = imageStatus[key];

        return (
          <div
            key={index}
            className="w-full rounded-xl overflow-hidden flex items-center justify-center bg-neutral-200/15 border border-neutral-300/50 aspect-video relative"
          >
            {url ? (
              <>
                <img
                  src={url}
                  alt={imageMapping[key]}
                  className={`w-full h-full object-cover object-center rounded-xl transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => handleImageLoad(key)}
                  onError={() => handleImageError(key)}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
                {status === 'loading' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 p-2">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-neutral-500 rounded-full animate-spin mb-2"></div>
                    <p className="text-neutral-500 text-center text-sm">{getLoadingMessage(key)}</p>
                  </div>
                )}
                {status === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100/80 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-neutral-500 text-center text-sm">Could not load image</p>
                    <button
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                      onClick={() => {
                        // Reset and try again from the beginning
                        setImageStatus(prev => ({ ...prev, [key]: 'loading' }));
                        setUseFallback(prev => ({ ...prev, [key]: false }));
                        setUseDriveThumbnail(prev => ({ ...prev, [key]: false }));
                        setLoadAttempts(prev => ({ ...prev, [key]: 0 }));
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-base text-neutral-500">{imageMapping[key]} Not Available</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BusImage;
