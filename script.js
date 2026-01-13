// Hero Carousel Functionality
const slides = document.querySelectorAll('.hero-slide');
const indicators = document.querySelectorAll('.indicator');
let currentSlide = 0;
let carouselInterval;

// Initialize carousel
function initCarousel() {
    if (slides.length === 0) return;
    
    // Set slide 5 (index 4) as active to match design
    const initialSlide = 4;
    slides[initialSlide].classList.add('active');
    indicators[initialSlide].classList.add('active');
    currentSlide = initialSlide;
    
    // Start auto-play
    startCarousel();
}

// Start auto-play carousel
function startCarousel() {
    carouselInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Change slide every 5 seconds
}

// Stop auto-play
function stopCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
}

// Go to next slide
function nextSlide() {
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide + 1) % slides.length;
    
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
}

// Go to previous slide
function prevSlide() {
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
}

// Go to specific slide
function goToSlide(index) {
    if (index < 0 || index >= slides.length) return;
    
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
    
    // Restart carousel after manual navigation
    stopCarousel();
    startCarousel();
}

// Add click handlers to indicators
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        goToSlide(index);
    });
});

// Pause carousel on hover
const heroBanner = document.querySelector('.hero-banner');
if (heroBanner) {
    heroBanner.addEventListener('mouseenter', stopCarousel);
    heroBanner.addEventListener('mouseleave', startCarousel);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

if (heroBanner) {
    heroBanner.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    heroBanner.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        // Swipe left - next slide
        nextSlide();
        stopCarousel();
        startCarousel();
    }
    if (touchEndX > touchStartX + 50) {
        // Swipe right - previous slide
        prevSlide();
        stopCarousel();
        startCarousel();
    }
}

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
    });
}

// Dropdown Menu Functionality
document.addEventListener('DOMContentLoaded', () => {
    const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
    
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    dropdownItems.forEach(item => {
        const navLink = item.querySelector('.nav-link');
        
        // Mobile: click to toggle dropdown
        navLink.addEventListener('click', (e) => {
            if (isMobile()) {
                e.preventDefault();
                // Close other dropdowns
                dropdownItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                // Toggle current dropdown
                item.classList.toggle('active');
            }
        });
    });
    
    // Close dropdowns when clicking outside (mobile)
    document.addEventListener('click', (e) => {
        if (isMobile() && !e.target.closest('.nav-item.has-dropdown')) {
            dropdownItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Close all dropdowns on resize
            if (!isMobile()) {
                dropdownItems.forEach(item => {
                    item.classList.remove('active');
                });
            }
        }, 250);
    });
});
