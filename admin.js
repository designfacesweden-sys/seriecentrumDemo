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
    
    // Handle toggle password visibility in settings
    const togglePasswordButtons = document.querySelectorAll('.toggle-password[data-target]');
    togglePasswordButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (targetInput) {
                const type = targetInput.getAttribute('type') === 'password' ? 'text' : 'password';
                targetInput.setAttribute('type', type);
                btn.textContent = type === 'password' ? '👁️' : '🙈';
            }
        });
    });

    // Handle settings form submission
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('admin-email').value;
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const websiteLock = document.getElementById('website-lock').checked;
            const lockMessage = document.getElementById('lock-message').value;
            
            // Validate password change if any password field is filled
            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    alert('Fyll i alla lösenordsfält för att ändra lösenord');
                    return;
                }
                
                if (currentPassword !== ADMIN_PASSWORD) {
                    alert('Nuvarande lösenord är felaktigt');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    alert('Nya lösenordet matchar inte bekräftelsen');
                    return;
                }
                
                if (newPassword.length < 8) {
                    alert('Nytt lösenord måste vara minst 8 tecken långt');
                    return;
                }
                
                // Update password (in a real app, this would be sent to a server)
                ADMIN_PASSWORD = newPassword;
                alert('Lösenordet har ändrats!');
                
                // Clear password fields
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            }
            
            // Save email and lock status (in a real app, this would be sent to a server)
            localStorage.setItem('adminEmail', email);
            localStorage.setItem('websiteLocked', websiteLock);
            localStorage.setItem('lockMessage', lockMessage);
            
            alert('Inställningar sparade!');
        });
    }
    
    // Load saved settings
    if (settingsForm) {
        const savedEmail = localStorage.getItem('adminEmail');
        const savedLock = localStorage.getItem('websiteLocked') === 'true';
        const savedMessage = localStorage.getItem('lockMessage');
        
        if (savedEmail) {
            document.getElementById('admin-email').value = savedEmail;
        }
        if (savedLock) {
            document.getElementById('website-lock').checked = true;
        }
        if (savedMessage) {
            document.getElementById('lock-message').value = savedMessage;
        }
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
        'about': 'Om oss',
        'fnm': 'FNM & Turneringar',
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
