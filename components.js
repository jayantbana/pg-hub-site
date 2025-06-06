// Component Functions for PG Listing Website

// PG Card Component
function createPGCard(pg) {
    const hasDiscount = pg.price > 15000;
    const discountPercentage = hasDiscount ? utils.random(10, 25) : 0;
    const finalPrice = hasDiscount ? Math.floor(pg.price * (1 - discountPercentage / 100)) : pg.price;

    return `
        <div class="pg-card" data-id="${pg.id}" onclick="showPGDetails(${pg.id})">
            <div class="pg-card-image">
                ${pg.has3d ? `<div class="pg-badge">3D Available</div>` : ''}
                ${pg.verified ? `<div class="pg-badge featured">Verified</div>` : ''}
                ${pg.has3d ? `
                    <button class="view-3d-btn" onclick="event.stopPropagation(); show3DViewer(${pg.id})">
                        <i class="fas fa-cube"></i>
                        View 3D
                    </button>
                ` : ''}
            </div>
            <div class="pg-card-content">
                <div class="pg-card-header">
                    <h3 class="pg-card-title">${pg.name}</h3>
                    <div class="pg-card-price">
                        ${hasDiscount ? `
                            <div style="text-decoration: line-through; color: #999; font-size: 0.9rem;">
                                ${utils.formatCurrency(pg.price)}
                            </div>
                            <div>${utils.formatCurrency(finalPrice)}</div>
                            <div style="color: #059669; font-size: 0.8rem;">${discountPercentage}% off</div>
                        ` : `
                            <div>${utils.formatCurrency(pg.price)}</div>
                        `}
                        <div style="font-size: 0.8rem; color: #666;">per month</div>
                    </div>
                </div>
                
                <div class="pg-card-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${pg.area}, ${pg.city}</span>
                </div>
                
                <span class="pg-card-type">${utils.capitalize(pg.type)} Room</span>
                
                <div class="pg-card-amenities">
                    ${pg.amenities.slice(0, 3).map(amenity => `
                        <span class="amenity-tag">
                            <i class="${window.pgData.amenitiesConfig[amenity]?.icon || 'fas fa-check'}"></i>
                            ${window.pgData.amenitiesConfig[amenity]?.label || amenity}
                        </span>
                    `).join('')}
                    ${pg.amenities.length > 3 ? `<span class="amenity-tag">+${pg.amenities.length - 3} more</span>` : ''}
                </div>
                
                <div class="pg-card-rating">
                    <div class="rating-stars">
                        ${utils.formatRating(pg.rating)}
                    </div>
                    <span class="rating-text">${pg.rating}/5 (${utils.random(10, 50)} reviews)</span>
                </div>
                
                <div class="pg-card-actions">
                    <button class="btn-primary" onclick="event.stopPropagation(); contactPG(${pg.id})">
                        <i class="fas fa-phone"></i>
                        Contact
                    </button>
                    <button class="btn-secondary" onclick="event.stopPropagation(); showPGDetails(${pg.id})">
                        <i class="fas fa-info-circle"></i>
                        Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

// PG Details Modal
function createPGDetailsModal(pg) {
    return `
        <div class="pg-details">
            <div class="pg-details-header">
                <div class="pg-details-image">
                    ${pg.has3d ? `
                        <button class="view-3d-btn" onclick="show3DViewer(${pg.id})" style="position: absolute; bottom: 15px; left: 15px;">
                            <i class="fas fa-cube"></i>
                            View in 3D
                        </button>
                    ` : ''}
                </div>
                <div class="pg-details-info">
                    <h1 class="pg-details-title">${pg.name}</h1>
                    <div class="pg-details-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${pg.address}</span>
                    </div>
                    <div class="pg-details-price">
                        ${utils.formatCurrency(pg.price)}/month
                    </div>
                    <div class="pg-details-rating">
                        <div class="rating-stars">
                            ${utils.formatRating(pg.rating)}
                        </div>
                        <span>${pg.rating}/5 rating • ${utils.random(15, 75)} reviews</span>
                    </div>
                    <div class="pg-details-actions">
                        <button class="btn-primary" onclick="contactPG(${pg.id})">
                            <i class="fas fa-phone"></i>
                            Contact Owner
                        </button>
                        <button class="btn-secondary" onclick="bookPG(${pg.id})">
                            <i class="fas fa-calendar-check"></i>
                            Book Visit
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="pg-details-content">
                <div class="pg-details-main">
                    <h3>About this PG</h3>
                    <p class="pg-details-description">${pg.description}</p>
                    
                    <h3>Amenities</h3>
                    <div class="pg-details-amenities">
                        ${pg.amenities.map(amenity => `
                            <div class="amenity-item">
                                <i class="${window.pgData.amenitiesConfig[amenity]?.icon || 'fas fa-check'}"></i>
                                <span>${window.pgData.amenitiesConfig[amenity]?.label || amenity}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <h3>Room Details</h3>
                    <div class="room-details">
                        <div class="detail-item">
                            <strong>Room Type:</strong> ${utils.capitalize(pg.type)} Room
                        </div>
                        <div class="detail-item">
                            <strong>Total Rooms:</strong> ${pg.totalRooms}
                        </div>
                        <div class="detail-item">
                            <strong>Available Rooms:</strong> ${pg.availableRooms}
                        </div>
                        <div class="detail-item">
                            <strong>Monthly Rent:</strong> ${utils.formatCurrency(pg.price)}
                        </div>
                    </div>
                </div>
                
                <div class="pg-details-sidebar">
                    <div class="contact-info">
                        <h4>Contact Information</h4>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <span>${pg.contact}</span>
                        </div>
                        ${pg.email ? `
                            <div class="contact-item">
                                <i class="fas fa-envelope"></i>
                                <span>${pg.email}</span>
                            </div>
                        ` : ''}
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${pg.area}, ${pg.city}</span>
                        </div>
                    </div>
                    
                    <div class="quick-facts">
                        <h4>Quick Facts</h4>
                        <div class="fact-item">
                            <i class="fas fa-shield-alt"></i>
                            <span>${pg.verified ? 'Verified Property' : 'Pending Verification'}</span>
                        </div>
                        <div class="fact-item">
                            <i class="fas fa-cube"></i>
                            <span>${pg.has3d ? '3D Tour Available' : 'Photos Only'}</span>
                        </div>
                        <div class="fact-item">
                            <i class="fas fa-clock"></i>
                            <span>Available Now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Skeleton Loading Component
function createSkeletonCard() {
    return `
        <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
    `;
}

// Filter Component
function createFilterComponent() {
    return `
        <div class="filters-container">
            <div class="filter-group">
                <label>City:</label>
                <select id="filter-city" onchange="applyFilters()">
                    <option value="">All Cities</option>
                    ${window.pgData.cities.map(city => `
                        <option value="${city}">${city}</option>
                    `).join('')}
                </select>
            </div>
            
            <div class="filter-group">
                <label>Type:</label>
                <select id="filter-type" onchange="applyFilters()">
                    <option value="">All Types</option>
                    <option value="single">Single Room</option>
                    <option value="double">Double Sharing</option>
                    <option value="triple">Triple Sharing</option>
                    <option value="dormitory">Dormitory</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label>Price Range:</label>
                <select id="filter-price" onchange="applyFilters()">
                    <option value="">All Prices</option>
                    ${window.pgData.priceRanges.map(range => `
                        <option value="${range.min}-${range.max}">${range.label}</option>
                    `).join('')}
                </select>
            </div>
            
            <div class="filter-group">
                <label>Sort By:</label>
                <select id="sort-by" onchange="applyFilters()">
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="city">City</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label>Order:</label>
                <select id="sort-order" onchange="applyFilters()">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="filter-3d" onchange="applyFilters()"> 
                    3D Preview Available
                </label>
            </div>
            
            <button class="filter-btn" onclick="clearFilters()">
                <i class="fas fa-times"></i>
                Clear Filters
            </button>
        </div>
    `;
}

// Search Results Component
function createSearchResults(listings, total, query) {
    if (listings.length === 0) {
        return `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No PGs found</h3>
                <p>Try adjusting your search criteria or filters</p>
                ${query ? `<p>No results for "<strong>${query}</strong>"</p>` : ''}
            </div>
        `;
    }

    return `
        <div class="search-results-header">
            <h3>${total} PG${total !== 1 ? 's' : ''} found${query ? ` for "${query}"` : ''}</h3>
        </div>
        <div class="listings-grid">
            ${listings.map(pg => createPGCard(pg)).join('')}
        </div>
    `;
}

// Pagination Component
function createPagination(currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) return '';

    let pages = [];
    
    // Always show first page
    if (currentPage > 3) {
        pages.push(1);
        if (currentPage > 4) pages.push('...');
    }
    
    // Show pages around current page
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        pages.push(i);
    }
    
    // Always show last page
    if (currentPage < totalPages - 2) {
        if (currentPage < totalPages - 3) pages.push('...');
        pages.push(totalPages);
    }

    return `
        <div class="pagination">
            <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="${onPageChange}(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
            
            ${pages.map(page => {
                if (page === '...') {
                    return '<span class="page-dots">...</span>';
                }
                return `
                    <button class="page-btn ${page === currentPage ? 'active' : ''}" 
                            onclick="${onPageChange}(${page})">
                        ${page}
                    </button>
                `;
            }).join('')}
            
            <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="${onPageChange}(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
}

// Stats Component
function createStatsComponent() {
    const totalListings = window.pgData.listings.length;
    const listings3D = window.pgData.listings.filter(pg => pg.has3d).length;
    const avgRating = (window.pgData.listings.reduce((sum, pg) => sum + pg.rating, 0) / totalListings).toFixed(1);
    const cities = new Set(window.pgData.listings.map(pg => pg.city)).size;

    return `
        <div class="stats-section">
            <div class="container">
                <div class="stats-grid">
                    <div class="stat-item">
                        <h3 class="stat-number">${totalListings}+</h3>
                        <p class="stat-label">Total Listings</p>
                    </div>
                    <div class="stat-item">
                        <h3 class="stat-number">${listings3D}+</h3>
                        <p class="stat-label">3D Previews</p>
                    </div>
                    <div class="stat-item">
                        <h3 class="stat-number">${avgRating}</h3>
                        <p class="stat-label">Average Rating</p>
                    </div>
                    <div class="stat-item">
                        <h3 class="stat-number">${cities}</h3>
                        <p class="stat-label">Cities</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Testimonial Component
function createTestimonialComponent() {
    const testimonials = [
        {
            name: "Priya Sharma",
            role: "Software Engineer",
            company: "TCS",
            content: "Found my perfect PG through this platform. The 3D preview feature helped me make the right choice without visiting multiple places.",
            rating: 5,
            avatar: "👩‍💻",
            location: "Mumbai"
        },
        {
            name: "Rahul Kumar",
            role: "Student",
            company: "IIT Delhi",
            content: "Amazing platform with verified listings. The search filters made it easy to find accommodation within my budget.",
            rating: 5,
            avatar: "👨‍🎓",
            location: "Delhi"
        },
        {
            name: "Sneha Patel",
            role: "Marketing Manager",
            company: "Infosys",
            content: "Great experience! The detailed information and photos helped me choose a safe and comfortable PG for working women.",
            rating: 4,
            avatar: "👩‍💼",
            location: "Bangalore"
        }
    ];

    return `
        <div class="testimonials-section">
            <div class="container">
                <h2 class="section-title">What Our Users Say</h2>
                <div class="testimonials-grid">
                    ${testimonials.map(testimonial => `
                        <div class="testimonial-card">
                            <div class="testimonial-header">
                                <div class="testimonial-avatar">${testimonial.avatar}</div>
                                <div class="testimonial-info">
                                    <h4>${testimonial.name}</h4>
                                    <p>${testimonial.role} at ${testimonial.company}</p>
                                    <small>${testimonial.location}</small>
                                </div>
                                <div class="testimonial-rating">
                                    ${utils.formatRating(testimonial.rating)}
                                </div>
                            </div>
                            <p class="testimonial-content">"${testimonial.content}"</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Export components
window.components = {
    createPGCard,
    createPGDetailsModal,
    createSkeletonCard,
    createFilterComponent,
    createSearchResults,
    createPagination,
    createStatsComponent,
    createTestimonialComponent
};

// After cards are appended inside load more
