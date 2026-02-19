// ============================================
// APP.JS - Main Application Logic (Part 1)
// Auth, Navigation, State Management
// ============================================

// ---- STATE ----
let currentUser = null;
let currentPage = 'dashboard';
let assessmentTimer = null;
let assessmentTimeLeft = 0;
let tabViolationCount = 0;

// ---- INITIALIZATION ----
function initApp() {
    // Seed default accounts if first run
    if (!localStorage.getItem('app_initialized')) {
        const users = [DEFAULT_ADMIN, DEFAULT_TEACHER];
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('materials', JSON.stringify([]));
        localStorage.setItem('chatHistories', JSON.stringify({}));
        localStorage.setItem('studentProgress', JSON.stringify({}));
        localStorage.setItem('assessmentResults', JSON.stringify({}));
        localStorage.setItem('assessmentApprovals', JSON.stringify({}));
        localStorage.setItem('assessmentSettings', JSON.stringify({ duration: 90 }));
        localStorage.setItem('app_initialized', 'true');
    }

    // Check session
    const session = localStorage.getItem('currentSession');
    if (session) {
        const userData = JSON.parse(session);
        const users = getUsers();
        const user = users.find(u => u.username === userData.username);
        if (user) {
            currentUser = user;
            if (user.mustChangePassword) {
                showPage('page-change-password');
            } else {
                showAppShell();
            }
            return;
        }
    }
    showPage('page-login');
}

// ---- DATA HELPERS ----
function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }
function getMaterials() { return JSON.parse(localStorage.getItem('materials') || '[]'); }
function saveMaterials(m) { localStorage.setItem('materials', JSON.stringify(m)); }
function getChatHistories() { return JSON.parse(localStorage.getItem('chatHistories') || '{}'); }
function saveChatHistories(h) { localStorage.setItem('chatHistories', JSON.stringify(h)); }
function getStudentProgress() { return JSON.parse(localStorage.getItem('studentProgress') || '{}'); }
function saveStudentProgress(p) { localStorage.setItem('studentProgress', JSON.stringify(p)); }
function getAssessmentResults() { return JSON.parse(localStorage.getItem('assessmentResults') || '{}'); }
function saveAssessmentResults(r) { localStorage.setItem('assessmentResults', JSON.stringify(r)); }
function getApprovals() { return JSON.parse(localStorage.getItem('assessmentApprovals') || '{}'); }
function saveApprovals(a) { localStorage.setItem('assessmentApprovals', JSON.stringify(a)); }
function getAssessmentSettings() { return JSON.parse(localStorage.getItem('assessmentSettings') || '{"duration":90}'); }
function saveAssessmentSettings(s) { localStorage.setItem('assessmentSettings', JSON.stringify(s)); }

function getProgress(username) {
    const all = getStudentProgress();
    if (!all[username]) {
        all[username] = { tahap: 1, tahap1Complete: false, tahap2Complete: false, tahap2Score: 0, tahap3Complete: false };
        saveStudentProgress(all);
    }
    return all[username];
}

function updateProgress(username, data) {
    const all = getStudentProgress();
    all[username] = { ...getProgress(username), ...data };
    saveStudentProgress(all);
}

// ---- PAGE MANAGEMENT ----
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showAppShell() {
    showPage('app-shell');
    updateSidebar();
    updateTopbar();
    navigateTo('dashboard');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ---- AUTH ----
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        showError('login-error', 'Username atau password salah!');
        return false;
    }

    currentUser = user;
    localStorage.setItem('currentSession', JSON.stringify({ username: user.username }));

    if (user.mustChangePassword) {
        showPage('page-change-password');
    } else {
        showAppShell();
    }
    document.getElementById('login-form').reset();
    return false;
}

function handleChangePassword(e) {
    e.preventDefault();
    const newPwd = document.getElementById('new-password').value;
    const confirmPwd = document.getElementById('confirm-password').value;

    if (newPwd !== confirmPwd) {
        showError('change-pwd-error', 'Password tidak cocok!');
        return false;
    }
    if (newPwd.length < 6) {
        showError('change-pwd-error', 'Password minimal 6 karakter!');
        return false;
    }

    const users = getUsers();
    const idx = users.findIndex(u => u.username === currentUser.username);
    users[idx].password = newPwd;
    users[idx].mustChangePassword = false;
    saveUsers(users);
    currentUser = users[idx];
    localStorage.setItem('currentSession', JSON.stringify({ username: currentUser.username }));
    document.getElementById('change-password-form').reset();
    showAppShell();
    return false;
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentSession');
    if (assessmentTimer) { clearInterval(assessmentTimer); assessmentTimer = null; }
    showPage('page-login');
}

function showError(elemId, msg) {
    const el = document.getElementById(elemId);
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
}

// ---- SIDEBAR & TOPBAR ----
function updateSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const role = currentUser.role;
    document.getElementById('sidebar-username').textContent = currentUser.name;
    document.getElementById('sidebar-role').textContent = role === 'admin' ? 'Administrator' : role === 'guru' ? 'Guru' : 'Siswa';

    updateAvatar('sidebar-avatar', currentUser);
    let items = '';

    if (role === 'siswa') {
        items = `
            <div class="nav-section">Menu Utama</div>
            <button class="nav-item active" onclick="navigateTo('dashboard')"><i class="fas fa-home"></i> Dashboard</button>
            <button class="nav-item" onclick="navigateTo('profile')"><i class="fas fa-user"></i> Profil</button>`;
    } else if (role === 'guru') {
        items = `
            <div class="nav-section">Menu Utama</div>
            <button class="nav-item active" onclick="navigateTo('dashboard')"><i class="fas fa-chart-line"></i> Dashboard</button>
            <button class="nav-item" onclick="navigateTo('student-results')"><i class="fas fa-poll"></i> Hasil Penilaian</button>
            <div class="nav-section">Manajemen</div>
            <button class="nav-item" onclick="navigateTo('materials')"><i class="fas fa-book"></i> Materi</button>
            <button class="nav-item" onclick="navigateTo('assessment-mgmt')"><i class="fas fa-clipboard-check"></i> Asesmen</button>
            <button class="nav-item" onclick="navigateTo('student-accounts')"><i class="fas fa-users"></i> Akun Siswa</button>
            <div class="nav-section">Profil</div>
            <button class="nav-item" onclick="navigateTo('profile')"><i class="fas fa-user-cog"></i> Profil</button>`;
    } else {
        items = `
            <div class="nav-section">Menu Utama</div>
            <button class="nav-item active" onclick="navigateTo('dashboard')"><i class="fas fa-chart-line"></i> Dashboard</button>
            <button class="nav-item" onclick="navigateTo('student-results')"><i class="fas fa-poll"></i> Hasil Penilaian</button>
            <div class="nav-section">Manajemen</div>
            <button class="nav-item" onclick="navigateTo('materials')"><i class="fas fa-book"></i> Materi</button>
            <button class="nav-item" onclick="navigateTo('assessment-mgmt')"><i class="fas fa-clipboard-check"></i> Asesmen</button>
            <button class="nav-item" onclick="navigateTo('student-accounts')"><i class="fas fa-users"></i> Akun Siswa</button>
            <button class="nav-item" onclick="navigateTo('chat-history')"><i class="fas fa-comments"></i> Riwayat Chat</button>
            <div class="nav-section">Profil</div>
            <button class="nav-item" onclick="navigateTo('profile')"><i class="fas fa-user-cog"></i> Profil</button>`;
    }
    nav.innerHTML = items;
}

function updateTopbar() {
    updateAvatar('topbar-avatar', currentUser);
}

function updateAvatar(elemId, user) {
    const el = document.getElementById(elemId);
    if (user.photo) {
        el.innerHTML = `<img src="${user.photo}" alt="Foto">`;
    } else {
        el.innerHTML = '<i class="fas fa-user"></i>';
    }
}

// ---- NAVIGATION ----
function navigateTo(page) {
    currentPage = page;
    const titles = {
        'dashboard': 'Dashboard',
        'profile': 'Profil Saya',
        'tahap1': 'Tahap 1 - Pembelajaran dengan Chatbot AI',
        'tahap2': 'Tahap 2 - Latihan Soal',
        'tahap3': 'Tahap 3 - Asesmen Utama',
        'student-results': 'Hasil Penilaian Siswa',
        'materials': 'Manajemen Materi',
        'assessment-mgmt': 'Manajemen Asesmen',
        'student-accounts': 'Manajemen Akun Siswa',
        'chat-history': 'Riwayat Chat Siswa'
    };
    document.getElementById('topbar-title').textContent = titles[page] || 'Dashboard';

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.onclick && item.onclick.toString().includes(`'${page}'`)) {
            item.classList.add('active');
        }
    });

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');

    renderPage(page);
}

function renderPage(page) {
    const main = document.getElementById('main-content');
    const role = currentUser.role;

    switch (page) {
        case 'dashboard':
            role === 'siswa' ? renderStudentDashboard(main) : renderTeacherDashboard(main);
            break;
        case 'profile':
            renderProfile(main);
            break;
        case 'tahap1':
            renderTahap1(main);
            break;
        case 'tahap2':
            renderTahap2(main);
            break;
        case 'tahap3':
            renderTahap3(main);
            break;
        case 'student-results':
            renderStudentResults(main);
            break;
        case 'materials':
            renderMaterials(main);
            break;
        case 'assessment-mgmt':
            renderAssessmentMgmt(main);
            break;
        case 'student-accounts':
            renderStudentAccounts(main);
            break;
        case 'chat-history':
            renderChatHistory(main);
            break;
        default:
            main.innerHTML = '<p>Halaman tidak ditemukan.</p>';
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', initApp);
