// Admin Dashboard JavaScript

// Simple authentication (for demo purposes - in production, use proper authentication)
const ADMIN_PASSWORD = 'ODINALFAF213123';

// Check if user is logged in
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (isAuthenticated) {
        showDashboard();
    } else {
        showLogin();
    }
}

// Show login screen
function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

// Show dashboard
function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
}

// Handle login form submission
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            
            if (password === ADMIN_PASSWORD) {
                sessionStorage.setItem('adminAuthenticated', 'true');
                loginError.classList.remove('show');
                showDashboard();
            } else {
                loginError.textContent = 'Fel lösenord';
                loginError.classList.add('show');
            }
        });
    }
    
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminAuthenticated');
            showLogin();
            // Clear form
            if (loginForm) {
                loginForm.reset();
            }
        });
    }
    
    // Handle navigation
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Check authentication on load
    checkAuth();
    
    // Toggle password visibility
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
    
    // Handle password copy button (login page)
    const copyPasswordBtnLogin = document.getElementById('copy-password-btn-login');
    const adminPasswordFieldLogin = document.getElementById('admin-password-display');
    const passwordHint = document.querySelector('.password-hint');
    
    if (copyPasswordBtnLogin && adminPasswordFieldLogin) {
        copyPasswordBtnLogin.addEventListener('click', () => {
            adminPasswordFieldLogin.select();
            adminPasswordFieldLogin.setSelectionRange(0, 99999); // For mobile devices
            
            try {
                navigator.clipboard.writeText(adminPasswordFieldLogin.value);
                copyPasswordBtnLogin.innerHTML = '<span class="copy-icon">✓</span><span class="copy-text">Kopierad!</span>';
                copyPasswordBtnLogin.classList.add('copied');
                
                if (passwordHint) {
                    passwordHint.classList.add('show');
                }
                
                setTimeout(() => {
                    copyPasswordBtnLogin.innerHTML = '<span class="copy-icon">📋</span><span class="copy-text">Kopiera</span>';
                    copyPasswordBtnLogin.classList.remove('copied');
                    if (passwordHint) {
                        passwordHint.classList.remove('show');
                    }
                }, 3000);
            } catch (err) {
                // Fallback for older browsers
                document.execCommand('copy');
                copyPasswordBtnLogin.innerHTML = '<span class="copy-icon">✓</span><span class="copy-text">Kopierad!</span>';
                copyPasswordBtnLogin.classList.add('copied');
                
                if (passwordHint) {
                    passwordHint.classList.add('show');
                }
                
                setTimeout(() => {
                    copyPasswordBtnLogin.innerHTML = '<span class="copy-icon">📋</span><span class="copy-text">Kopiera</span>';
                    copyPasswordBtnLogin.classList.remove('copied');
                    if (passwordHint) {
                        passwordHint.classList.remove('show');
                    }
                }, 3000);
            }
        });
    }
    
    // Handle password copy button (settings page)
    const copyPasswordBtn = document.getElementById('copy-password-btn');
    const adminPasswordField = document.getElementById('admin-password');
    
    if (copyPasswordBtn && adminPasswordField) {
        copyPasswordBtn.addEventListener('click', () => {
            adminPasswordField.select();
            adminPasswordField.setSelectionRange(0, 99999); // For mobile devices
            
            try {
                navigator.clipboard.writeText(adminPasswordField.value);
                copyPasswordBtn.textContent = 'Kopierad!';
                copyPasswordBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyPasswordBtn.textContent = 'Kopiera';
                    copyPasswordBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                // Fallback for older browsers
                document.execCommand('copy');
                copyPasswordBtn.textContent = 'Kopierad!';
                copyPasswordBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyPasswordBtn.textContent = 'Kopiera';
                    copyPasswordBtn.classList.remove('copied');
                }, 2000);
            }
        });
    }
});

// Switch between dashboard sections
function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    const titles = {
        'overview': 'Översikt',
        'products': 'Produkter',
        'orders': 'Beställningar',
        'reviews': 'Recensioner',
        'settings': 'Inställningar'
    };
    
    if (pageTitle && titles[sectionName]) {
        pageTitle.textContent = titles[sectionName];
    }
}

// Handle URL routing for /admin
if (window.location.pathname === '/admin' || window.location.pathname === '/admin.html') {
    // Already on admin page, checkAuth will handle it
} else if (window.location.hash === '#/admin') {
    // Handle hash-based routing
    window.location.href = '/admin.html';
}
