// Smooth scroll for navigation links
let smoothScrollInitialized = false;

function initSmoothScroll() {
    if (smoothScrollInitialized) return;
    
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (anchors.length === 0) {
        setTimeout(initSmoothScroll, 100);
        return;
    }
    
    smoothScrollInitialized = true;
    
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Gallery image hover effect enhancement
function initGalleryHover() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease';
        });
    });
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Get base path based on current page location
function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/brows-lamination/')) {
        return '../';
    }
    return './';
}

// Load header and footer components
async function loadComponents() {
    try {
        const basePath = getBasePath();
        
        // Load header
        const headerResponse = await fetch(basePath + 'components/header.html');
        if (headerResponse.ok) {
            const headerHtml = await headerResponse.text();
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = headerHtml;
                // Wait longer for DOM to fully update
                setTimeout(() => {
                    initHeaderScripts();
                }, 200);
            }
        }
        
        // Load footer
        const footerResponse = await fetch(basePath + 'components/footer.html');
        if (footerResponse.ok) {
            const footerHtml = await footerResponse.text();
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = footerHtml;
            }
        }
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Initialize header scripts after header is loaded
let headerInitialized = false;

function initHeaderScripts() {
    if (headerInitialized) return;
    
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');
    
    if (!menuToggle || !nav) {
        console.warn('Header elements not found, retrying...');
        setTimeout(initHeaderScripts, 100);
        return;
    }
    
    // Double check that elements exist and are in DOM
    if (menuToggle === null || nav === null) {
        console.error('Elements are null after check');
        return;
    }
    
    headerInitialized = true;
    
    // Add click handler with explicit null check
    if (menuToggle && typeof menuToggle.addEventListener === 'function') {
        menuToggle.addEventListener('click', () => {
            if (nav) nav.classList.toggle('active');
            if (menuToggle) menuToggle.classList.toggle('active');
        });
    } else {
        console.error('menuToggle is not a valid element or addEventListener is not available');
        return;
    }
    
    // Adapt navigation links based on current page
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach(link => {
        if (!link) return;
        
        const section = link.getAttribute('data-section');
        if (!section) return;
        
        const sectionElement = document.getElementById(section);
        
        // If section doesn't exist on current page, link to main page
        if (!sectionElement && !currentPage.includes('index.html') && currentPage !== '/' && !currentPage.endsWith('/')) {
            link.href = `/#${section}`;
        } else {
            link.href = `#${section}`;
        }
        
        // Close mobile menu when clicking on a link
        if (typeof link.addEventListener === 'function') {
            link.addEventListener('click', () => {
                if (nav) nav.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            });
        }
    });
    
    // Header scroll effect (only add once)
    const header = document.querySelector('.header');
    if (header) {
        let scrollHandlerAdded = false;
        window.addEventListener('scroll', () => {
            if (!scrollHandlerAdded) {
                scrollHandlerAdded = true;
            }
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        });
    }
}

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Load header and footer first
    loadComponents().then(() => {
        // Initialize smooth scroll after components are loaded
        setTimeout(() => {
            initSmoothScroll();
        }, 100);
        
        // Initialize gallery hover effects
        setTimeout(() => {
            initGalleryHover();
        }, 150);
        
        const animateElements = document.querySelectorAll('.service-card, .gallery-item, .about-text');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Load reviews
        loadReviews();
    });
});

// Load and display reviews from JSON file
async function loadReviews() {
    try {
        const basePath = getBasePath();
        const response = await fetch(basePath + 'reviews.json');
        if (!response.ok) {
            throw new Error('Failed to load reviews');
        }
        const reviews = await response.json();
        displayReviews(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
        const reviewsGrid = document.getElementById('reviewsGrid');
        if (reviewsGrid) {
            reviewsGrid.innerHTML = '<p style="text-align: center; color: #888;">Отзывы временно недоступны</p>';
        }
    }
}

// Display reviews in the grid
function displayReviews(reviews) {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    reviewsGrid.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <h4 class="review-name">${escapeHtml(review.name)}</h4>
                <span class="review-date">${escapeHtml(review.date)}</span>
            </div>
            <div class="review-service">${escapeHtml(review.service)}</div>
            <div class="review-rating">
                ${generateStars(review.rating)}
            </div>
            <p class="review-comment">${escapeHtml(review.comment)}</p>
        </div>
    `).join('');

    // Add animation to review cards
    const reviewCards = reviewsGrid.querySelectorAll('.review-card');
    reviewCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        setTimeout(() => {
            observer.observe(card);
        }, index * 100);
    });
}

// Generate star rating HTML
function generateStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars += '<span class="star">★</span>';
        } else {
            stars += '<span class="star" style="color: #ddd;">★</span>';
        }
    }
    return stars;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


