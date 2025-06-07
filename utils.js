

// Utility Functions
const utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    // Format rating stars
    formatRating: (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show toast notification
    showToast: (message, type = 'info', duration = 3000) => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
 toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);
        toast.classList.add('fade-in');

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    },

    // Validate email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate phone
    validatePhone: (phone) => {
        const re = /^[+]?[\d\s\-\(\)]{10,}$/;
        return re.test(phone);
    },

    // Local storage helpers
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('Failed to save to localStorage:', e);
            }
        },

        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn('Failed to read from localStorage:', e);
                return defaultValue;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('Failed to remove from localStorage:', e);
            }
        }
    },

    // URL helpers
    getUrlParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    setUrlParam: (param, value) => {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },

    // Animation helpers
    animateOnScroll: () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    },

    // Image lazy loading
    lazyLoadImages: () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    },

    // Form validation
    validateForm: (formElement) => {
        const errors = [];
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
 errors.push(`${input.labels[0]?.textContent || input.name} is required`);
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }

            // Email validation
            if (input.type === 'email' && input.value && !utils.validateEmail(input.value)) {
                errors.push('Please enter a valid email address');
                input.classList.add('error');
            }

            // Phone validation
            if (input.type === 'tel' && input.value && !utils.validatePhone(input.value)) {
                errors.push('Please enter a valid phone number');
                input.classList.add('error');
            }
        });

        return errors;
    },

    // Search and filter helpers
    searchListings: (listings, query) => {
        if (!query) return listings;
        
        const searchTerm = query.toLowerCase();
        return listings.filter(pg => 
            pg.name.toLowerCase().includes(searchTerm) ||
            pg.area.toLowerCase().includes(searchTerm) ||
            pg.city.toLowerCase().includes(searchTerm) ||
            pg.description.toLowerCase().includes(searchTerm)
        );
    },

    filterListings: (listings, filters) => {
        return listings.filter(pg => {
            if (filters.city && pg.city !== filters.city) return false;
            if (filters.type && pg.type !== filters.type) return false;
            if (filters.has3d !== undefined && pg.has3d !== filters.has3d) return false;
            
            if (filters.priceRange) {
                const [min, max] = filters.priceRange.split('-').map(Number);
                if (max) {
                    if (pg.price < min || pg.price > max) return false;
                } else {
                    if (pg.price < min) return false;
                }
            }
            
            return true;
        });
    },

    sortListings: (listings, sortBy, sortOrder = 'asc') => {
        return [...listings].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (sortOrder === 'desc') {
                return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
        });
    },

    // Generate slug from text
    generateSlug: (text) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Distance calculation (approximate)
    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    // Random number generator
    random: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Capitalize first letter
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Truncate text
    truncate: (text, length) => {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    // Deep clone object
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Smooth scroll to element
    scrollTo: (element, offset = 0) => {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    },

    // Device detection
    isMobile: () => {
        return window.innerWidth <= 768;
    },

    isTablet: () => {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },

    isDesktop: () => {
        return window.innerWidth > 1024;
    },

    // Performance helpers
    preloadImage: (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    },

    // Analytics helpers (for future integration)
    trackEvent: (eventName, properties = {}) => {
        console.log('Track Event:', eventName, properties);
        // Integration with analytics service would go here
    },

    // Error handling
    handleError: (error, context = '') => {
 console.error(`Error in ${context}:`, error);
        utils.showToast('An error occurred. Please try again.', 'error');
    },

    // Feature detection
    supportsWebGL: () => {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    },

    // Browser detection
    getBrowser: () => {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }
};

// Export utils globally

window.utils = utils;