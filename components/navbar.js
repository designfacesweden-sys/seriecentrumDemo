// Navbar Module Loader
// This script loads the navbar HTML and adjusts paths based on current page location

(function() {
    function loadNavbar() {
        const navbarContainer = document.getElementById('navbar-container');
        if (!navbarContainer) return;

        // Determine if we're in pages/ directory or root
        const isInPages = window.location.pathname.includes('/pages/');
        const navbarPath = isInPages ? '../components/navbar.html' : 'components/navbar.html';

        fetch(navbarPath)
            .then(response => response.text())
            .then(html => {
                navbarContainer.innerHTML = html;
                
                // Adjust logo link based on location
                const logoLink = document.getElementById('navbar-logo-link');
                if (logoLink) {
                    logoLink.href = isInPages ? '../index.html' : 'index.html';
                }
                
                // Adjust all page links in navbar
                const allLinks = navbarContainer.querySelectorAll('a[href]');
                allLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    // Skip external links and anchors
                    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                        return;
                    }
                    // If link doesn't start with ../ or http, it's a relative link in pages/
                    // Links in navbar.html are already relative to pages/, so we need to adjust
                    if (!href.startsWith('../') && !href.startsWith('http')) {
                        if (isInPages) {
                            // Already in pages/, keep as is
                            // link.setAttribute('href', href);
                        } else {
                            // In root, add pages/ prefix
                            link.setAttribute('href', 'pages/' + href);
                        }
                    }
                });
                
                // Adjust image paths in navbar
                const images = navbarContainer.querySelectorAll('img');
                images.forEach(img => {
                    const src = img.getAttribute('src');
                    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                        if (isInPages && !src.startsWith('../')) {
                            img.setAttribute('src', '../' + src);
                        } else if (!isInPages && src.startsWith('../')) {
                            img.setAttribute('src', src.replace('../', ''));
                        }
                    }
                });
                
                // Initialize mobile menu after navbar is loaded
                // Use setTimeout to ensure DOM is fully ready
                setTimeout(() => {
                    initMobileMenu();
                    initDropdownMenus();
                    initCartDropdown();
                }, 50);
                
                // Update cart display after navbar loads
                if (typeof updateCartDisplay === 'function') {
                    setTimeout(() => {
                        updateCartDisplay();
                    }, 100);
                }
            })
            .catch(error => {
                console.error('Error loading navbar:', error);
            });
    }
    
    // Initialize mobile menu functionality
    function initMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (!mobileMenuToggle) {
            console.warn('Mobile menu toggle button not found');
            return;
        }
        
        if (!mainNav) {
            console.warn('Main nav not found');
            return;
        }
        
        // Check if already initialized
        if (mobileMenuToggle.hasAttribute('data-menu-initialized')) {
            console.log('Mobile menu already initialized');
            return;
        }
        
        console.log('Initializing mobile menu...');
        mobileMenuToggle.setAttribute('data-menu-initialized', 'true');
        
        const closeButton = document.querySelector('.mobile-menu-close');
        
        function toggleMenu(isActive) {
            if (isActive) {
                // Remove closing class if it exists
                mainNav.classList.remove('closing');
                mobileMenuToggle.classList.add('active');
                mainNav.classList.add('active');
                if (closeButton) closeButton.classList.add('active');
                document.body.classList.add('menu-open');
            } else {
                // Add closing class to trigger fade-out animation
                mainNav.classList.add('closing');
                
                // Wait for fade-out animation to complete before removing active class
                setTimeout(() => {
                    mobileMenuToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                    mainNav.classList.remove('closing');
                    if (closeButton) closeButton.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }, 300); // Match the CSS transition duration (0.3s = 300ms)
            }
        }
        
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const isActive = !mobileMenuToggle.classList.contains('active');
            toggleMenu(isActive);
        });
        
        // Close button functionality
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                toggleMenu(false);
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mainNav.classList.contains('active')) {
                if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target) && 
                    (!closeButton || !closeButton.contains(e.target))) {
                    toggleMenu(false);
                }
                
                // Close menu when clicking on a non-dropdown nav link
                if (e.target.classList.contains('nav-link') && !e.target.closest('.has-dropdown')) {
                    toggleMenu(false);
                }
            }
        });
    }
    
    // Initialize cart dropdown
    function initCartDropdown() {
        const cartToggle = document.getElementById('cart-toggle');
        const cartWrapper = document.querySelector('.cart-wrapper');
        const cartDropdown = document.getElementById('cart-dropdown');
        
        if (cartToggle && cartWrapper && cartDropdown) {
            cartToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const isActive = cartWrapper.classList.contains('active');
                const isMobile = window.innerWidth <= 768;
                
                cartWrapper.classList.toggle('active');
                
                // Mobile: full screen slide-in
                if (isMobile && cartWrapper.classList.contains('active')) {
                    cartDropdown.style.position = 'fixed';
                    cartDropdown.style.top = '0';
                    cartDropdown.style.left = '0';
                    cartDropdown.style.right = '0';
                    cartDropdown.style.bottom = '0';
                    cartDropdown.style.width = '100vw';
                    cartDropdown.style.maxWidth = '100vw';
                    cartDropdown.style.maxHeight = '100vh';
                    cartDropdown.style.height = '100vh';
                    cartDropdown.style.zIndex = '100002';
                    cartDropdown.style.transform = 'translateX(0)';
                    document.body.classList.add('cart-open');
                } else if (isMobile) {
                    // Reset mobile styles when closing
                    cartDropdown.style.position = '';
                    cartDropdown.style.top = '';
                    cartDropdown.style.bottom = '';
                    cartDropdown.style.left = '';
                    cartDropdown.style.right = '';
                    cartDropdown.style.width = '';
                    cartDropdown.style.maxWidth = '';
                    cartDropdown.style.maxHeight = '';
                    cartDropdown.style.height = '';
                    cartDropdown.style.zIndex = '';
                    cartDropdown.style.transform = '';
                    document.body.classList.remove('cart-open');
                }
            });
            
            // Close cart button
            const cartCloseBtn = document.getElementById('cart-close-btn');
            if (cartCloseBtn) {
                cartCloseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    cartWrapper.classList.remove('active');
                    if (window.innerWidth <= 768) {
                        document.body.classList.remove('cart-open');
                    }
                });
            }
            
            // Close cart when clicking outside (desktop only)
            document.addEventListener('click', (e) => {
                const isMobile = window.innerWidth <= 768;
                if (!isMobile && !cartWrapper.contains(e.target)) {
                    cartWrapper.classList.remove('active');
                }
            });
            
            // Update position on resize (mobile only)
            window.addEventListener('resize', () => {
                if (cartWrapper.classList.contains('active')) {
                    const isMobile = window.innerWidth <= 768;
                    if (isMobile) {
                        cartDropdown.style.position = 'fixed';
                        cartDropdown.style.top = '0';
                        cartDropdown.style.left = '0';
                        cartDropdown.style.right = '0';
                        cartDropdown.style.bottom = '0';
                        cartDropdown.style.width = '100vw';
                        cartDropdown.style.maxWidth = '100vw';
                        cartDropdown.style.maxHeight = '100vh';
                        cartDropdown.style.height = '100vh';
                        cartDropdown.style.zIndex = '100002';
                        cartDropdown.style.transform = 'translateX(0)';
                    } else {
                        // Desktop: reset to use CSS
                        cartDropdown.style.position = '';
                        cartDropdown.style.top = '';
                        cartDropdown.style.bottom = '';
                        cartDropdown.style.left = '';
                        cartDropdown.style.right = '';
                        cartDropdown.style.width = '';
                        cartDropdown.style.maxWidth = '';
                        cartDropdown.style.maxHeight = '';
                        cartDropdown.style.height = '';
                        cartDropdown.style.zIndex = '';
                        cartDropdown.style.transform = '';
                        document.body.classList.remove('cart-open');
                    }
                }
            });
        }
    }
    
    // Initialize dropdown menus
    function initDropdownMenus() {
        const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
        
        function isMobile() {
            return window.innerWidth <= 768;
        }
        
        dropdownItems.forEach(item => {
            const navLink = item.querySelector('.nav-link');
            
            if (navLink) {
                // Remove existing listeners
                const newLink = navLink.cloneNode(true);
                navLink.parentNode.replaceChild(newLink, navLink);
                
                const link = item.querySelector('.nav-link');
                
                // Mobile: click to toggle dropdown
                link.addEventListener('click', (e) => {
                    if (isMobile()) {
                        e.preventDefault();
                        e.stopPropagation();
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
            }
        });
        
        // Close dropdowns when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (isMobile() && !e.target.closest('.nav-item.has-dropdown')) {
                dropdownItems.forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
    }

    // Load navbar when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNavbar);
    } else {
        loadNavbar();
    }
})();
