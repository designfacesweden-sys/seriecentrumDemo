// Handle /admin route
if (window.location.pathname === '/admin' || window.location.pathname.endsWith('/admin.html')) {
    // Redirect to admin.html if accessing /admin
    if (window.location.pathname === '/admin') {
        window.location.href = '/admin.html';
    }
}

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

// Mobile Menu Toggle - Handled by navbar.js
// This function is removed to avoid conflicts

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

// Shopping Cart Functionality
let cart = [];

// Load cart from localStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem('seriecentrum_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (e) {
        cart = [];
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('seriecentrum_cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Failed to save cart:', e);
    }
}

// Initialize cart on load
loadCart();

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartItemsText = document.getElementById('cart-items-text');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cartCount) {
        cartCount.textContent = cart.length;
        if (cart.length === 0) {
            cartCount.style.display = 'none';
        } else {
            cartCount.style.display = 'flex';
        }
    }
    
    if (cartItemsText) {
        cartItemsText.textContent = `${cart.length} ${cart.length === 1 ? 'produkt' : 'produkter'}`;
    }
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="cart-empty">Din varukorg är tom</p>';
        } else {
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-details">Skick: ${item.condition}</div>
                        <div class="cart-item-price">${item.price}</div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})" aria-label="Ta bort">×</button>
                </div>
            `).join('');
        }
    }
    
    if (cartTotal) {
        const total = cart.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/\s/g, '').replace('kr', ''));
            return sum + (isNaN(price) ? 0 : price);
        }, 0);
        cartTotal.textContent = `${total} kr`;
    }
    
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

function addToCart(productName, condition, price) {
    cart.push({
        name: productName,
        condition: condition,
        price: price
    });
    saveCart();
    updateCartDisplay();
    
    // Show cart dropdown briefly
    const cartWrapper = document.querySelector('.cart-wrapper');
    if (cartWrapper) {
        cartWrapper.classList.add('active');
        setTimeout(() => {
            // Keep it open if user hovers, otherwise it will close on mouseleave
        }, 100);
    }
}

function removeFromCart(index) {
    if (typeof cart !== 'undefined' && Array.isArray(cart)) {
        cart.splice(index, 1);
        saveCart();
        updateCartDisplay();
    }
}

// Initialize cart display
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    
    // Cart toggle
    const cartToggle = document.getElementById('cart-toggle');
    const cartWrapper = document.querySelector('.cart-wrapper');
    
    if (cartToggle && cartWrapper) {
        cartToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            cartWrapper.classList.toggle('active');
        });
        
        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            if (!cartWrapper.contains(e.target)) {
                cartWrapper.classList.remove('active');
            }
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                // Determine correct path based on current location
                const currentPath = window.location.pathname;
                const checkoutPath = currentPath.includes('/pages/') ? 'checkout.html' : 'pages/checkout.html';
                window.location.href = checkoutPath;
            }
        });
    }
});
