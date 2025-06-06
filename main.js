// Main Application JavaScript
class PGFinderApp {
    constructor() {
        this.currentPage = 'home';
        this.currentListings = [];
        this.filteredListings = [];
        this.currentFilters = {};
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentRenderer = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadHomePage();
        this.initializeAnimation();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('href').substring(1);
                this.navigateToPage(page);
            });
        });

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                this.closeModal(e.target.closest('.modal'));
            }
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Form submissions
        this.setupFormHandlers();

        // Window resize handler
        window.addEventListener('resize', utils.debounce(() => {
            if (this.currentRenderer) {
                this.currentRenderer.handleResize();
            }
        }, 250));

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.active');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    setupFormHandlers() {
        // Add PG form
        const addPGForm = document.getElementById('add-pg-form');
        if (addPGForm) {
            addPGForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddPGSubmission(e.target);
            });
        }

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmission(e.target);
            });
        }
    }

    navigateToPage(page) {
        // Update active navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${page}"]`).classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;

            // Load page-specific content
            switch (page) {
                case 'home':
                    this.loadHomePage();
                    break;
                case 'listings':
                    this.loadListingsPage();
                    break;
                case 'add-pg':
                    this.loadAddPGPage();
                    break;
                case 'contact':
                    this.loadContactPage();
                    break;
            }

            // Trigger animations
            this.animatePageEntry(targetPage);
        }
    }

    loadHomePage() {
        this.loadFeaturedPGs();
        this.setupHomeSearch();
    }

    async loadFeaturedPGs() {
        const container = document.getElementById('featured-pgs');
        if (!container) return;

        // Show loading
        container.innerHTML = Array(6).fill(0).map(() => components.createSkeletonCard()).join('');

        try {
            // Get featured PGs (those with 3D or high rating)
            const featuredPGs = window.pgData.listings
                .filter(pg => pg.has3d || pg.rating >= 4.5)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 6);

            // Simulate loading delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));

            container.innerHTML = featuredPGs.map(pg => components.createPGCard(pg)).join('');
            
            // Animate cards
            container.querySelectorAll('.pg-card').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('slide-in-up');
            });

        } catch (error) {
            utils.handleError(error, 'loadFeaturedPGs');
            container.innerHTML = '<p>Error loading featured PGs. Please refresh the page.</p>';
        }
    }

    setupHomeSearch() {
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }

        // Enter key search
        const searchInputs = document.querySelectorAll('.search-field select');
        searchInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        });
    }

    loadListingsPage() {
        this.currentListings = [...window.pgData.listings];
        this.filteredListings = [...this.currentListings];
        this.currentPage = 1;
        this.renderListings();
    }

    renderListings() {
        const container = document.getElementById('listings-grid');
        if (!container) return;

        // Apply filters and sorting
        this.applyFiltersAndSort();

        // Pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageListings = this.filteredListings.slice(startIndex, endIndex);

        // Render listings
        if (pageListings.length === 0) {
            container.innerHTML = components.createSearchResults([], 0);
        } else {
            container.innerHTML = pageListings.map(pg => components.createPGCard(pg)).join('');
        }

        // Update load more button
        this.updateLoadMoreButton();

        // Animate cards
        container.querySelectorAll('.pg-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
            card.classList.add('slide-in-up');
        });
    }

    applyFiltersAndSort() {
        let filtered = [...this.currentListings];

        // Apply filters
        const cityFilter = document.getElementById('filter-city')?.value;
        const typeFilter = document.getElementById('filter-type')?.value;
        const priceFilter = document.getElementById('filter-price')?.value;
        const has3dFilter = document.getElementById('filter-3d')?.checked;

        if (cityFilter) {
            filtered = filtered.filter(pg => pg.city === cityFilter);
        }

        if (typeFilter) {
            filtered = filtered.filter(pg => pg.type === typeFilter);
        }

        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(Number);
            filtered = filtered.filter(pg => {
                if (max) {
                    return pg.price >= min && pg.price <= max;
                } else {
                    return pg.price >= min;
                }
            });
        }

        if (has3dFilter) {
            filtered = filtered.filter(pg => pg.has3d);
        }

        // Apply sorting
        const sortBy = document.getElementById('sort-by')?.value || 'name';
        const sortOrder = document.getElementById('sort-order')?.value || 'asc';

        filtered.sort((a, b) => {
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

        this.filteredListings = filtered;
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (!loadMoreBtn) return;

        const totalPages = Math.ceil(this.filteredListings.length / this.itemsPerPage);
        const hasMore = this.currentPage < totalPages;

        loadMoreBtn.style.display = hasMore ? 'block' : 'none';
        loadMoreBtn.textContent = `Load More (${this.filteredListings.length - (this.currentPage * this.itemsPerPage)} remaining)`;
    }

    loadAddPGPage() {
        // Initialize form validation
        const form = document.getElementById('add-pg-form');
        if (form) {
            // Clear form
            form.reset();
            
            // Add real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        }
    }

    loadContactPage() {
        // Initialize contact form
        const form = document.getElementById('contact-form');
        if (form) {
            form.reset();
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        } else if (field.type === 'email' && value && !utils.validateEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        } else if (field.type === 'tel' && value && !utils.validatePhone(value)) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }

        // Update field appearance
        field.classList.toggle('error', !isValid);

        // Show/hide error message
        let errorElement = field.parentElement.querySelector('.field-error');
        if (!errorElement && !isValid) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentElement.appendChild(errorElement);
        }

        if (errorElement) {
            errorElement.textContent = isValid ? '' : message;
            errorElement.style.display = isValid ? 'none' : 'block';
        }

        return isValid;
    }

    handleAddPGSubmission(form) {
        // Validate form
        const errors = utils.validateForm(form);
        if (errors.length > 0) {
            utils.showToast(errors[0], 'error');
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const pgData = {
            name: formData.get('pg-name'),
            type: formData.get('pg-type'),
            city: formData.get('pg-city'),
            area: formData.get('pg-area'),
            price: parseInt(formData.get('pg-price')),
            totalRooms: parseInt(formData.get('pg-rooms')),
            address: formData.get('pg-address'),
            description: formData.get('pg-description'),
            contact: formData.get('pg-contact'),
            email: formData.get('pg-email'),
            amenities: Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
        };

        // Simulate API call
        utils.showToast('Submitting your PG listing...', 'info');
        
        setTimeout(() => {
            utils.showToast('PG listing submitted successfully! It will be reviewed and published soon.', 'success');
            form.reset();
        }, 1500);
    }

    handleContactSubmission(form) {
        // Validate form
        const errors = utils.validateForm(form);
        if (errors.length > 0) {
            utils.showToast(errors[0], 'error');
            return;
        }

        // Simulate API call
        utils.showToast('Sending your message...', 'info');
        
        setTimeout(() => {
            utils.showToast('Message sent successfully! We will get back to you soon.', 'success');
            form.reset();
        }, 1500);
    }

    initializeAnimation() {
        // Initialize scroll animations
        utils.animateOnScroll();
        
        // Initialize lazy loading
        utils.lazyLoadImages();

        // Stats counter animation
        this.animateStats();
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    animateCounter(element) {
        const target = parseInt(element.textContent) || 0;
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
        }, 16);
    }

    animatePageEntry(page) {
        page.classList.add('page-enter');
        setTimeout(() => {
            page.classList.remove('page-enter');
        }, 500);
    }

    showModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clean up 3D renderer if it exists
        if (this.currentRenderer) {
            this.currentRenderer.destroy();
            this.currentRenderer = null;
        }
    }

    // Global functions accessible from HTML
    initializeGlobalFunctions() {
        // Make functions available globally
        window.performSearch = () => this.performSearch();
        window.applyFilters = () => this.applyFilters();
        window.clearFilters = () => this.clearFilters();
        window.loadMoreListings = () => this.loadMoreListings();
        window.showPGDetails = (id) => this.showPGDetails(id);
        window.show3DViewer = (id) => this.show3DViewer(id);
        window.contactPG = (id) => this.contactPG(id);
        window.bookPG = (id) => this.bookPG(id);
        window.setView = (view) => this.setView(view);
        window.resetView = () => this.resetView();
    }

    performSearch() {
        const location = document.getElementById('location-select')?.value;
        const type = document.getElementById('type-select')?.value;
        const budget = document.getElementById('budget-select')?.value;

        // Navigate to listings page
        this.navigateToPage('listings');

        // Apply search filters
        if (location) document.getElementById('filter-city').value = location;
        if (type) document.getElementById('filter-type').value = type;
        if (budget) document.getElementById('filter-price').value = budget;

        // Render filtered results
        this.renderListings();

        utils.showToast(`Found ${this.filteredListings.length} PGs matching your criteria`, 'success');
    }

    applyFilters() {
        this.currentPage = 1;
        this.renderListings();
    }

    clearFilters() {
        // Reset all filter controls
        document.getElementById('filter-city').value = '';
        document.getElementById('filter-type').value = '';
        document.getElementById('filter-price').value = '';
        document.getElementById('filter-3d').checked = false;
        document.getElementById('sort-by').value = 'name';
        document.getElementById('sort-order').value = 'asc';

        this.applyFilters();
        utils.showToast('Filters cleared', 'info');
    }

    loadMoreListings() {
        this.currentPage++;
        
        const container = document.getElementById('listings-grid');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageListings = this.filteredListings.slice(startIndex, endIndex);

        // Append new listings
        container.innerHTML += pageListings.map(pg => components.createPGCard(pg)).join('');

        // Update load more button
        this.updateLoadMoreButton();

        // Animate new cards
        const newCards = container.querySelectorAll('.pg-card:nth-last-child(-n+' + pageListings.length + ')');
        newCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
            card.classList.add('slide-in-up');
        });
    }

    showPGDetails(id) {
        const pg = window.pgData.listings.find(p => p.id === parseInt(id));
        if (!pg) return;

        const modal = document.getElementById('pg-modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = components.createPGDetailsModal(pg);
        this.showModal(modal);
    }

    show3DViewer(id) {
        const pg = window.pgData.listings.find(p => p.id === parseInt(id));
        if (!pg || !pg.has3d) {
            utils.showToast('3D preview not available for this PG', 'error');
            return;
        }

        if (!utils.supportsWebGL()) {
            utils.showToast('Your browser does not support 3D previews', 'error');
            return;
        }

        const modal = document.getElementById('viewer-modal');
        const container = document.getElementById('three-container');
        
        // Clear previous content
        container.innerHTML = '';
        
        this.showModal(modal);

        // Initialize 3D renderer
        setTimeout(() => {
            try {
                this.currentRenderer = new Room3DRenderer();
                const config = Room3DRenderer.getDefaultRoomConfig(pg.type);
                this.currentRenderer.createRoom(container, config);
                utils.showToast('Use mouse to rotate and zoom the room', 'info');
            } catch (error) {
                utils.handleError(error, '3D Viewer');
                container.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Failed to load 3D preview. Please try again.</p>';
            }
        }, 300);
    }

    setView(view) {
        if (this.currentRenderer) {
            this.currentRenderer.setView(view);
        }
    }

    resetView() {
        if (this.currentRenderer) {
            this.currentRenderer.setView('reset');
        }
    }

    contactPG(id) {
        const pg = window.pgData.listings.find(p => p.id === parseInt(id));
        if (!pg) return;

        const phoneNumber = pg.contact.replace(/[^\d]/g, '');
        const message = `Hi! I'm interested in your PG "${pg.name}" in ${pg.area}, ${pg.city}. Can you please provide more details?`;
        
        if (utils.isMobile()) {
            window.open(`tel:${phoneNumber}`);
        } else {
            navigator.clipboard.writeText(phoneNumber).then(() => {
                utils.showToast(`Phone number ${pg.contact} copied to clipboard`, 'success');
            }).catch(() => {
                utils.showToast(`Contact: ${pg.contact}`, 'info');
            });
        }
    }

    bookPG(id) {
        const pg = window.pgData.listings.find(p => p.id === parseInt(id));
        if (!pg) return;

        utils.showToast('Booking feature will be available soon. Please contact the owner directly.', 'info');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PGFinderApp();
    app.initializeGlobalFunctions();
    
    // Track page load
    utils.trackEvent('page_load', {
        page: 'home',
        timestamp: new Date().toISOString()
    });
});

// DARK MODE TOGGLE
// Theme toggle logic
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Check saved preference
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDark = body.classList.contains("dark-mode");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});

// After cards are appended inside load more
const newCards = document.querySelectorAll('.pg-card:not(.mirror-effect)');
newCards.forEach(card => {
  card.classList.add('mirror-effect');
});
