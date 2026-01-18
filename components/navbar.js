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
        const secondaryNav = document.querySelector('.secondary-nav');
        
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
        
        let secondaryNavContent = null;
        let separator = null;
        
        const closeButton = document.querySelector('.mobile-menu-close');
        
        function toggleMenu(isActive) {
            if (isActive) {
                mobileMenuToggle.classList.add('active');
                mainNav.classList.add('active');
                if (closeButton) closeButton.classList.add('active');
                document.body.classList.add('menu-open');
            } else {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                if (closeButton) closeButton.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }
        
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            console.log('Mobile menu toggle clicked');
            const isActive = !mobileMenuToggle.classList.contains('active');
            toggleMenu(isActive);
            console.log('Menu active:', isActive);
            
            if (isActive) {
                // Open menu - move secondary nav content into main nav
                if (secondaryNav && !secondaryNavContent) {
                    const secondaryNavList = secondaryNav.querySelector('.secondary-nav-list');
                    if (secondaryNavList) {
                        secondaryNavContent = secondaryNavList.cloneNode(true);
                        const navList = mainNav.querySelector('.nav-list');
                        if (navList) {
                            // Create separator
                            separator = document.createElement('li');
                            separator.className = 'mobile-menu-separator';
                            separator.style.width = '100%';
                            separator.style.height = '2px';
                            separator.style.background = 'rgba(255, 255, 255, 0.2)';
                            separator.style.margin = '1rem 0';
                            separator.style.listStyle = 'none';
                            navList.appendChild(separator);
                            
                            // Append secondary nav items
                            const secondaryItems = secondaryNavContent.querySelectorAll('.nav-item');
                            secondaryItems.forEach(item => {
                                navList.appendChild(item.cloneNode(true));
                            });
                            
                            // Re-initialize dropdowns for new items
                            setTimeout(() => {
                                initDropdownMenus();
                            }, 50);
                        }
                    }
                        }
                    } else {
                        // Close menu - restore secondary nav content
                        if (separator && mainNav.contains(separator)) {
                            const navList = mainNav.querySelector('.nav-list');
                            if (navList) {
                                // Remove separator and all items after it
                                let current = separator.nextSibling;
                                while (current) {
                                    const next = current.nextSibling;
                                    if (current.classList && current.classList.contains('nav-item')) {
                                        navList.removeChild(current);
                                    }
                                    current = next;
                                }
                                navList.removeChild(separator);
                            }
                            separator = null;
                            secondaryNavContent = null;
                        }
                    }
        });
        
        // Close button functionality
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                toggleMenu(false);
                
                // Clean up secondary nav content
                if (separator && mainNav.contains(separator)) {
                    const navList = mainNav.querySelector('.nav-list');
                    if (navList) {
                        let current = separator.nextSibling;
                        while (current) {
                            const next = current.nextSibling;
                            if (current.classList && current.classList.contains('nav-item')) {
                                navList.removeChild(current);
                            }
                            current = next;
                        }
                        navList.removeChild(separator);
                    }
                    separator = null;
                    secondaryNavContent = null;
                }
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mainNav.classList.contains('active')) {
                if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target) && 
                    (!closeButton || !closeButton.contains(e.target))) {
                    toggleMenu(false);
                    
                    // Clean up secondary nav content
                    if (separator && mainNav.contains(separator)) {
                        const navList = mainNav.querySelector('.nav-list');
                        if (navList) {
                            let current = separator.nextSibling;
                            while (current) {
                                const next = current.nextSibling;
                                if (current.classList && current.classList.contains('nav-item')) {
                                    navList.removeChild(current);
                                }
                                current = next;
                            }
                            navList.removeChild(separator);
                        }
                        separator = null;
                        secondaryNavContent = null;
                    }
                }
                
                // Close menu when clicking on a non-dropdown nav link
                if (e.target.classList.contains('nav-link') && !e.target.closest('.has-dropdown')) {
                    setTimeout(() => {
                        toggleMenu(false);
                        
                        if (separator && mainNav.contains(separator)) {
                            const navList = mainNav.querySelector('.nav-list');
                            if (navList) {
                                let current = separator.nextSibling;
                                while (current) {
                                    const next = current.nextSibling;
                                    if (current.classList && current.classList.contains('nav-item')) {
                                        navList.removeChild(current);
                                    }
                                    current = next;
                                }
                                navList.removeChild(separator);
                            }
                            separator = null;
                            secondaryNavContent = null;
                        }
                    }, 100);
                }
            }
        });
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
