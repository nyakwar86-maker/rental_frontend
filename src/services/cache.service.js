class CacheService {
    constructor() {
        this.prefix = 'rental-app_';
        this.defaultTTL = {
            apartments: 2 * 60 * 1000, // 2 minutes for apartment lists
            apartment: 10 * 60 * 1000, // 10 minutes for single apartment
            filters: 30 * 60 * 1000, // 30 minutes for filters
            images: 5 * 60 * 1000, // 5 minutes for images
        };
    }

    // Generate cache key
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    // Set item with TTL
    set(key, value, ttl) {
        const item = {
            value,
            expiry: Date.now() + (ttl || this.defaultTTL.apartments),
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(this.getKey(key), JSON.stringify(item));
            return true;
        } catch (error) {
            console.warn('Failed to set cache:', error);
            this.clearOldestItems();
            return false;
        }
    }

    // Get item
    get(key) {
        try {
            const itemStr = localStorage.getItem(this.getKey(key));
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);

            // Check if expired
            if (Date.now() > item.expiry) {
                this.remove(key);
                return null;
            }

            return item.value;
        } catch (error) {
            console.warn('Failed to get cache:', error);
            this.remove(key);
            return null;
        }
    }

    // Get cache info (age, expiry)
    getInfo(key) {
        try {
            const itemStr = localStorage.getItem(this.getKey(key));
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);
            return {
                age: Date.now() - item.timestamp,
                expiresIn: item.expiry - Date.now(),
                expired: Date.now() > item.expiry
            };
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // Remove item
    remove(key) {
        localStorage.removeItem(this.getKey(key));
    }

    // Clear all app cache
    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    // Clear expired items
    clearExpired() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                const itemStr = localStorage.getItem(key);
                if (itemStr) {
                    try {
                        const item = JSON.parse(itemStr);
                        if (Date.now() > item.expiry) {
                            localStorage.removeItem(key);
                        }
                    } catch (error) {
                        console.log(error);
                        localStorage.removeItem(key);
                    }
                }
            }
        });
    }

    // Clear oldest items if storage is full
    clearOldestItems() {
        const items = [];

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                const itemStr = localStorage.getItem(key);
                if (itemStr) {
                    try {
                        const item = JSON.parse(itemStr);
                        items.push({ key, timestamp: item.timestamp });
                    } catch (error) {
                        // Remove corrupted items
                        console.log(error);
                        localStorage.removeItem(key);
                    }
                }
            }
        });

        // Sort by oldest first
        items.sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest 20%
        const toRemove = Math.ceil(items.length * 0.2);
        for (let i = 0; i < toRemove && i < items.length; i++) {
            localStorage.removeItem(items[i].key);
        }
    }

    // Get all cache keys
    getAllKeys() {
        return Object.keys(localStorage).filter(key =>
            key.startsWith(this.prefix)
        );
    }

    // Get cache stats
    getStats() {
        const keys = this.getAllKeys();
        const stats = {
            total: keys.length,
            size: 0
        };

        keys.forEach(key => {
            try {
                const item = localStorage.getItem(key);
                if (item) {
                    stats.size += item.length * 2; // Approximate size in bytes
                }
            } catch (error) {
                // Ignore errors
                console.log(error);

            }
        });

        stats.sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        return stats;
    }
}

export default new CacheService();