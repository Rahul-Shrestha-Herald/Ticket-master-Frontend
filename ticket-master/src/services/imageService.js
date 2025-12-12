import axios from 'axios';

/**
 * Service for handling image loading with fallbacks
 */
class ImageService {
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
        this.cache = {};
    }

    /**
     * Extract Google Drive file ID from a URL
     * @param {string} url - The Google Drive URL
     * @returns {string|null} - The file ID or null if not found
     */
    extractFileId(url) {
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
    }

    /**
     * Get Google Drive thumbnail URL (for fallback)
     * @param {string} url - The original Google Drive URL
     * @returns {string} - The thumbnail URL
     */
    getDriveThumbnailUrl(url) {
        const fileId = this.extractFileId(url);
        if (fileId) {
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }
        return '';
    }

    /**
     * Get original Google Drive URL (for fallback)
     * @param {string} url - The Google Drive URL
     * @returns {string} - The direct Google Drive URL
     */
    getOriginalDriveUrl(url) {
        const fileId = this.extractFileId(url);
        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
        return url;
    }

    /**
     * Get proxy URL for Google Drive images
     * @param {string} url - The Google Drive URL
     * @returns {string} - The proxy URL
     */
    getProxyUrl(url) {
        const fileId = this.extractFileId(url);
        if (fileId) {
            return `${this.backendUrl}/api/bus/image-proxy?id=${fileId}`;
        }
        return url;
    }

    /**
     * Check if a URL is a Google Drive URL
     * @param {string} url - The URL to check
     * @returns {boolean} - True if it's a Google Drive URL
     */
    isGoogleDriveUrl(url) {
        return url && url.includes('drive.google.com');
    }

    /**
     * Load an image with fallbacks
     * @param {string} url - The image URL
     * @param {Function} onSuccess - Called when image loads successfully
     * @param {Function} onError - Called when all fallbacks fail
     * @param {Function} onProgress - Called with progress updates
     * @returns {Object} - Methods to control the loading process
     */
    loadImage(url, onSuccess, onError, onProgress) {
        if (!url) {
            onError(new Error('No URL provided'));
            return { cancel: () => { } };
        }

        // For non-Google Drive URLs, return as is
        if (!this.isGoogleDriveUrl(url)) {
            onSuccess(url);
            return { cancel: () => { } };
        }

        let canceled = false;
        const controller = new AbortController();

        // Define fallback chain
        const fallbacks = [
            { type: 'proxy', getUrl: () => this.getProxyUrl(url) },
            { type: 'direct', getUrl: () => this.getOriginalDriveUrl(url) },
            { type: 'thumbnail', getUrl: () => this.getDriveThumbnailUrl(url) }
        ];

        // Try each fallback in sequence
        const tryFallback = async (index = 0) => {
            if (canceled) return;
            if (index >= fallbacks.length) {
                onError(new Error('All fallbacks failed'));
                return;
            }

            const { type, getUrl } = fallbacks[index];
            const fallbackUrl = getUrl();

            onProgress({
                status: 'trying',
                message: `Trying ${type} method...`,
                url: fallbackUrl
            });

            try {
                // For the proxy fallback, we need to check if the proxy endpoint is working
                if (type === 'proxy') {
                    // Try a HEAD request first to see if proxy is working
                    try {
                        await axios.head(fallbackUrl, { signal: controller.signal });
                    } catch (error) {
                        // If proxy fails, move to next fallback
                        return tryFallback(index + 1);
                    }
                }

                // Test image loading
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    if (canceled) return;
                    onSuccess(fallbackUrl);
                    onProgress({
                        status: 'success',
                        message: `Loaded with ${type} method`,
                        url: fallbackUrl
                    });
                };

                img.onerror = () => {
                    if (canceled) return;
                    // Try next fallback
                    tryFallback(index + 1);
                };

                img.src = fallbackUrl;
            } catch (error) {
                if (canceled) return;
                // Try next fallback
                tryFallback(index + 1);
            }
        };

        // Start trying fallbacks
        tryFallback();

        // Return cancel function
        return {
            cancel: () => {
                canceled = true;
                controller.abort();
            }
        };
    }
}

export default ImageService; 