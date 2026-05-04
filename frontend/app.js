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

// Stage Timer Config (in seconds) — Tahap 1 dikecualikan (tidak ada timer/anti-cheat)
const STAGE_DURATION = {
    'tahap2': 20 * 60,
    'tahap3': 30 * 60,
    'tahap4': 20 * 60
};

async function syncUsers() {
    try {
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
            const users = await usersRes.json();
            localStorage.setItem('users', JSON.stringify(users));
        }
    } catch (err) {
        console.error('Gagal sinkronisasi data user:', err);
    }
}

async function syncData() {
    try {
        const isStudent = currentUser && currentUser.role === 'siswa';
        const usernameParam = isStudent ? `?username=${currentUser.username}` : '';

        // Prioritas 1: Progress & Materials (Essential for Dashboard)
        const [syncRes, materialsRes] = await Promise.all([
            fetch(`/api/sync${usernameParam}`, { cache: 'no-store' }),
            fetch('/api/materials', { cache: 'no-store' })
        ]);

        if (syncRes.ok) {
            const data = await syncRes.json();
            if (isStudent) {
                const existingProgress = getStudentProgress();
                const mergedProgress = { ...existingProgress, ...data.studentProgress };
                localStorage.setItem('studentProgress', JSON.stringify(mergedProgress));

                const existingResults = getAssessmentResults();
                const mergedResults = { ...existingResults, ...data.assessmentResults };
                localStorage.setItem('assessmentResults', JSON.stringify(mergedResults));

                const existingApprovals = getApprovals();
                const mergedApprovals = { ...existingApprovals, ...data.assessmentApprovals };
                localStorage.setItem('assessmentApprovals', JSON.stringify(mergedApprovals));
            } else {
                localStorage.setItem('studentProgress', JSON.stringify(data.studentProgress || {}));
                localStorage.setItem('assessmentResults', JSON.stringify(data.assessmentResults || {}));
                localStorage.setItem('assessmentApprovals', JSON.stringify(data.assessmentApprovals || {}));
            }
            localStorage.setItem('assessmentSettings', JSON.stringify(data.assessmentSettings || { duration: 90 }));
        }

        if (materialsRes.ok) {
            const data = await materialsRes.json();
            localStorage.setItem('materials', JSON.stringify(data.materials || []));
        }

        // Prioritas 2: Users (Background sync as it can be large)
        fetch('/api/users', { cache: 'no-store' })
            .then(res => res.ok ? res.json() : [])
            .then(users => {
                localStorage.setItem('users', JSON.stringify(users));
                if (['student-accounts', 'monitoring', 'tahap1'].includes(currentPage)) {
                    renderPage(currentPage);
                }
            })
            .catch(err => console.error('Users sync failed:', err));

        if (currentPage === 'dashboard' || currentPage === 'tahap1') {
            renderPage(currentPage);
        }
    } catch (err) {
        console.error('Gagal sinkronisasi data dari server:', err);
    }
}

// ---- INITIALIZATION ----
async function initApp() {
    // Seed default offline state if first run
    if (!localStorage.getItem('app_initialized')) {
        localStorage.setItem('materials', JSON.stringify([]));
        localStorage.setItem('chatHistories', JSON.stringify({}));
        localStorage.setItem('studentProgress', JSON.stringify({}));
        localStorage.setItem('assessmentResults', JSON.stringify({}));
        localStorage.setItem('assessmentApprovals', JSON.stringify({}));
        localStorage.setItem('assessmentSettings', JSON.stringify({ duration: 90 }));
        localStorage.setItem('app_initialized', 'true');
    }

    // Check session
    const session = sessionStorage.getItem('currentSession');
    if (session) {
        try {
            const userData = JSON.parse(session);
            currentUser = userData; // Gunakan data dari sesi langsung agar cepat

            // Sinkronkan data pendukung di background agar data terbaru
            syncData().then(() => {
                if (currentUser) {
                    const latestUsers = getUsers();
                    const updatedUser = latestUsers.find(u => u.username === currentUser.username);
                    if (updatedUser) {
                        // Tetap pertahankan sessionId agar tidak dianggap login di perangkat lain
                        const currentSessionId = currentUser.sessionId;
                        currentUser = { ...updatedUser, sessionId: currentSessionId };
                    }
                }
            });

            if (currentUser.mustChangePassword) {
                showPage('page-change-password');
            } else {
                const lastPage = localStorage.getItem('lastVisitedPage') || 'dashboard';
                showAppShell();
                navigateTo(lastPage);
            }
            return;
        } catch (e) {
            console.error('Session restore failed', e);
            sessionStorage.removeItem('currentSession');
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
function saveAssessmentResults(r) {
    localStorage.setItem('assessmentResults', JSON.stringify(r));
    if (currentUser && r[currentUser.username]) {
        fetch('/api/progress/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, resultData: r[currentUser.username] })
        }).catch(err => console.error(err));
    }
}
function getApprovals() { return JSON.parse(localStorage.getItem('assessmentApprovals') || '{}'); }
function saveApprovals(a) {
    localStorage.setItem('assessmentApprovals', JSON.stringify(a));
}
async function saveApprovalForUser(username, approvalData) {
    const a = getApprovals();
    if (approvalData) {
        a[username] = approvalData;
    } else {
        delete a[username];
    }
    localStorage.setItem('assessmentApprovals', JSON.stringify(a));
    try {
        await fetch('/api/progress/approval', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, approvalData })
        });
    } catch (err) {
        console.error('Failed to sync approval', err);
    }
}
function getAssessmentSettings() { return JSON.parse(localStorage.getItem('assessmentSettings') || '{"duration":90, "questionAmount":50}'); }
function saveAssessmentSettings(s) {
    localStorage.setItem('assessmentSettings', JSON.stringify(s));
    fetch('/api/progress/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingsData: s })
    }).catch(err => console.error(err));
}

function getProgress(username) {
    const all = getStudentProgress();
    if (!all[username]) {
        // Return default progress without saving to localStorage automatically
        // to avoid performance hits during large loop renders (e.g. Teacher Dashboard)
        return {
            tahap: 1,
            tahap1Complete: false,
            tahap2Complete: false,
            tahap2Score: 0,
            tahap3Complete: false,
            tahap4Complete: false,
            tahap4Score: 0,
            tahap4Analysis: null,
            tahap4Details: [],
            reflectionAnswers: [],
            aiReadiness: '',
            isReady: false,
            generatedAssessment: []
        };
    }
    return all[username];
}

function updateProgress(username, data) {
    const all = getStudentProgress();
    const progress = getProgress(username);
    all[username] = { ...progress, ...data };
    saveStudentProgress(all);

    // Sync to backend
    fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, progressData: all[username] })
    }).catch(err => console.error('Failed to sync progress:', err));
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
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Heartbeat to track online users (every 30 seconds)
setInterval(async () => {
    if (currentUser) {
        try {
            const res = await fetch('/api/auth/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: currentUser.username,
                    sessionId: currentUser.sessionId
                })
            });

            if (res.status === 401) {
                const data = await res.json();
                if (data.error === 'SESSION_EXPIRED') {
                    alert(data.message);
                    handleLogout();
                }
            }
        } catch (err) {
            console.error('Heartbeat failed:', err);
        }
    }
}, 30000);

// ---- ANTI-CHEAT & TIMER GLOBAL ----
function startStageTimer(page) {
    if (assessmentTimer) {
        clearInterval(assessmentTimer);
        assessmentTimer = null;
    }

    if (!STAGE_DURATION[page] || currentUser.role !== 'siswa') {
        hideTimerDisplay();
        return;
    }

    // Check if stage is already completed
    const progress = getProgress(currentUser.username);
    const completeKey = `${page}Complete`;
    if (progress[completeKey]) {
        hideTimerDisplay();
        return;
    }

    assessmentTimeLeft = STAGE_DURATION[page];
    showTimerDisplay();
    updateTimerDisplay();

    assessmentTimer = setInterval(() => {
        assessmentTimeLeft--;
        updateTimerDisplay();

        if (assessmentTimeLeft <= 0) {
            clearInterval(assessmentTimer);
            assessmentTimer = null;
            handleStageTimeout(page);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElem = document.getElementById('global-timer');
    if (!timerElem) return;

    const mins = Math.floor(assessmentTimeLeft / 60);
    const secs = assessmentTimeLeft % 60;
    timerElem.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (assessmentTimeLeft < 60) {
        timerElem.style.color = 'var(--danger)';
        timerElem.classList.add('pulse');
    } else {
        timerElem.style.color = 'white';
        timerElem.classList.remove('pulse');
    }
}

function showTimerDisplay() {
    let container = document.getElementById('timer-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'timer-container';
        container.style.cssText = 'background:var(--gradient-danger); color:white; padding:0.4rem 1rem; border-radius:20px; display:flex; align-items:center; gap:0.5rem; font-weight:700; font-family:monospace; font-size:1.1rem; box-shadow:var(--shadow-sm);';
        container.innerHTML = '<i class="fas fa-clock"></i> <span id="global-timer">00:00</span>';
        document.querySelector('.topbar-actions').prepend(container);
    }
    container.style.display = 'flex';
}

function hideTimerDisplay() {
    const container = document.getElementById('timer-container');
    if (container) container.style.display = 'none';
}

function handleStageTimeout(page) {
    alert('Waktu pengerjaan Tahap ini telah habis!');
    if (page === 'tahap3') {
        if (typeof submitAssessment === 'function') submitAssessment();
    } else {
        navigateTo('dashboard');
    }
}

// Global visibility change listener (tidak ada anti-cheat di sini)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        if (currentUser && currentUser.role === 'siswa') {
            console.log('User left the tab...');
        }
    }
});

// ---- AUTH ----
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Disable button to prevent spam
    const btn = document.querySelector('#login-form button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) {
            showError('login-error', data.error || 'Login gagal!');
            btn.innerHTML = originalText;
            btn.disabled = false;
            return false;
        }

        const user = data.user;
        currentUser = user;
        sessionStorage.setItem('currentSession', JSON.stringify(user));

        // Sync data in background (non-blocking for faster transition)
        syncData();

        if (user.mustChangePassword) {
            showPage('page-change-password');
        } else if (user.role === 'siswa') {
            showStudentOnboarding();
        } else {
            showAppShell();
            // Use requestAnimationFrame to ensure the UI transition happens before heavy rendering
            requestAnimationFrame(() => {
                navigateTo('dashboard');
            });
        }
        document.getElementById('login-form').reset();
    } catch (err) {
        showError('login-error', 'Gagal terhubung ke server!');
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
    return false;
}

async function handleChangePassword(e) {
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

    try {
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, newPassword: newPwd })
        });

        if (!res.ok) {
            showError('change-pwd-error', 'Gagal mengubah password di server!');
            return false;
        }

        const data = await res.json();
        currentUser = data.user;

        await syncData(); // update lokal

        document.getElementById('change-password-form').reset();
        showAppShell();
    } catch (err) {
        showError('change-pwd-error', 'Server error!');
    }
    return false;
}

function handleLogout() {
    currentUser = null;
    sessionStorage.removeItem('currentSession');
    if (assessmentTimer) { clearInterval(assessmentTimer); assessmentTimer = null; }
    showPage('page-login');
}

function showStudentOnboarding() {
    const existing = document.getElementById('student-onboarding-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'student-onboarding-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:10000; backdrop-filter:blur(8px); padding:20px;';

    overlay.innerHTML = `
    <div style="background:var(--bg-card); width:100%; max-width:600px; max-height:90vh; border-radius:24px; box-shadow:var(--shadow-lg); border:1px solid var(--border-color); display:flex; flex-direction:column; overflow:hidden; animation:slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="background:var(--gradient-primary); padding:2rem; text-align:center; color:white;">
            <i class="fas fa-graduation-cap" style="font-size:3rem; margin-bottom:1rem; display:block;"></i>
            <h2 style="font-size:1.5rem; font-weight:800;">Panduan Belajar NARA-AI</h2>
            <p style="opacity:0.9; font-size:0.9rem;">Pahami alur pembelajaranmu bersama NARA-AI</p>
        </div>
        
        <div style="flex:1; overflow-y:auto; padding:2rem; display:flex; flex-direction:column; gap:1.5rem;">
            <div style="display:flex; gap:1rem; align-items:flex-start;">
                <div style="width:40px; height:40px; border-radius:12px; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:800;">1</div>
                <div>
                    <h4 style="font-size:1.05rem; margin-bottom:0.3rem;">Tahap 1: Eksplorasi & Diskusi</h4>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">Pelajari materi dan diskusikan dengan <strong>NARA-AI</strong>. Kamu bisa mengklik "Sudah Paham" dan menjawab pertanyaan uji pemahaman untuk lanjut Ke tahap 2.</p>
                </div>
            </div>
            
            <div style="display:flex; gap:1rem; align-items:flex-start;">
                <div style="width:40px; height:40px; border-radius:12px; background:var(--accent-light); color:var(--accent); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:800;">2</div>
                <div>
                    <h4 style="font-size:1.05rem; margin-bottom:0.3rem;">Tahap 2: Refleksi Mandiri</h4>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">Jawab 5 pertanyaan refleksi berdasarkan hasil diskusimu. <strong>Anti-cheat aktif:</strong> Dilarang copy-paste atau klik kanan.</p>
                </div>
            </div>
            
            <div style="display:flex; gap:1rem; align-items:flex-start;">
                <div style="width:40px; height:40px; border-radius:12px; background:var(--danger-light); color:var(--danger); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:800;">3</div>
                <div>
                    <h4 style="font-size:1.05rem; margin-bottom:0.3rem;">Tahap 3: Asesmen Utama</h4>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">Ujian utama dengan pengawasan ketat. Membutuhkan persetujuan guru, mode layar penuh, dan deteksi perpindahan tab.</p>
                </div>
            </div>
            
            <div style="display:flex; gap:1rem; align-items:flex-start;">
                <div style="width:40px; height:40px; border-radius:12px; background:var(--success-light); color:var(--success); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:800;">4</div>
                <div>
                    <h4 style="font-size:1.05rem; margin-bottom:0.3rem;">Tahap 4: Pembentukan Karakter</h4>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">Refleksi 7 Kebiasaan Hebat Anak Indonesia untuk membangun pribadi yang lebih baik.</p>
                </div>
            </div>

            <div style="background:var(--bg-input); padding:1rem; border-radius:12px; border:1px dashed var(--border-color);">
                <h5 style="font-size:0.9rem; color:var(--danger); margin-bottom:0.5rem;"><i class="fas fa-exclamation-triangle"></i> Aturan Penting:</h5>
                <ul style="font-size:0.8rem; color:var(--text-secondary); padding-left:1.2rem; line-height:1.4;">
                    <li>Satu akun hanya boleh digunakan di <strong>satu perangkat</strong>.</li>
                    <li>Segala bentuk kecurangan (copy-paste, dsb) akan terekam oleh sistem.</li>
                    <li>Gunakan bahasa yang sopan saat berdiskusi dengan NARA-AI.</li>
                </ul>
            </div>
        </div>
        
        <div style="padding:1.5rem 2rem; background:var(--bg-sidebar); border-top:1px solid var(--border-color); text-align:center;">
            <button class="btn btn-primary btn-full" style="padding:1rem; font-size:1.1rem; font-weight:700; border-radius:12px;" onclick="closeStudentOnboarding()">
                <i class="fas fa-check-circle"></i> Saya Mengerti & Siap Belajar
            </button>
        </div>
    </div>`;

    document.body.appendChild(overlay);
}

function closeStudentOnboarding() {
    const overlay = document.getElementById('student-onboarding-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            overlay.remove();
            showAppShell();
            navigateTo('dashboard'); // Pastikan dashboard terbuka
        }, 300);
    }
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
    } else {
        // Admin & Guru have the same management menus
        items = `
            <div class="nav-section">Menu Utama</div>
            <button class="nav-item active" onclick="navigateTo('dashboard')"><i class="fas fa-chart-line"></i> Dashboard</button>
            <button class="nav-item" onclick="navigateTo('student-attendance')"><i class="fas fa-calendar-check"></i> Absen Siswa</button>
            <button class="nav-item" onclick="navigateTo('teacher-journal')"><i class="fas fa-journal-whills"></i> Jurnal Harian</button>
            <button class="nav-item" onclick="navigateTo('student-results')"><i class="fas fa-poll"></i> Hasil Penilaian</button>
            
            <div class="nav-section">Manajemen</div>
            <button class="nav-item" onclick="navigateTo('schedule-mgmt')"><i class="fas fa-clock"></i> Penjadwalan Waktu</button>
            <button class="nav-item" onclick="navigateTo('materials')"><i class="fas fa-book"></i> Materi</button>
            <button class="nav-item" onclick="navigateTo('assessment-mgmt')"><i class="fas fa-clipboard-check"></i> Asesmen</button>
            
            <button class="nav-item" onclick="navigateTo('banksoal')"><i class="fas fa-database"></i> Bank Soal</button>
            <button class="nav-item" onclick="navigateTo('kisi-kisi')"><i class="fas fa-file-signature"></i> Kisi-kisi Soal</button>
            
            <button class="nav-item" onclick="navigateTo('student-accounts')"><i class="fas fa-users"></i> Akun Siswa</button>
            
            <div class="nav-section">Monitoring</div>
            <button class="nav-item" onclick="navigateTo('monitoring')"><i class="fas fa-desktop"></i> Status Siswa</button>
            
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
    if (page === 'tahap1' || page === 'tahap2' || page === 'tahap3') {
        if (currentUser && currentUser.role === 'siswa') {
            const settings = getAssessmentSettings();
            const schedules = settings.classSchedules || {};
            const myClass = currentUser.kelas || 'Tanpa Kelas';
            const classSchedule = schedules[myClass] || {};
            
            // Fallback for old data structure
            const t1 = classSchedule.tahap1 || { start: classSchedule.start || '00:00', end: classSchedule.end || '23:59', active: classSchedule.active || false };
            const t2 = classSchedule.tahap2 || { start: '00:00', end: '23:59', active: false };
            const t3 = classSchedule.tahap3 || { start: '00:00', end: '23:59', active: false };
            
            let currentStageSchedule;
            if (page === 'tahap1') currentStageSchedule = t1;
            else if (page === 'tahap2') currentStageSchedule = t2;
            else if (page === 'tahap3') currentStageSchedule = t3;

            if (currentStageSchedule && currentStageSchedule.active) {
                const now = new Date();
                const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
                
                if (currentTime < currentStageSchedule.start || currentTime > currentStageSchedule.end) {
                    const stageName = page === 'tahap1' ? 'Tahap 1' : page === 'tahap2' ? 'Tahap 2' : 'Tahap 3';
                    alert(`⚠️ Belum Waktunya!\n\nJadwal akses ${stageName} untuk Kelas ${myClass} adalah:\n🕒 ${currentStageSchedule.start} s/d ${currentStageSchedule.end}\n\nSilakan kembali pada jam tersebut.`);
                    return;
                }
            }
        }
    }

    currentPage = page;
    localStorage.setItem('lastVisitedPage', page);
    const titles = {
        'dashboard': 'Dashboard',
        'profile': 'Profil Saya',
        'tahap1': 'Tahap 1 - Materi Pembelajaran',
        'tahap2': 'Tahap 2 - Latihan Soal',
        'tahap3': 'Tahap 3 - Asesmen Utama',
        'tahap4': 'Tahap 4 - 7 Kebiasaan Hebat',
        'student-results': 'Hasil Penilaian Siswa',
        'materials': 'Manajemen Materi',
        'assessment-mgmt': 'Manajemen Asesmen',
        'schedule-mgmt': 'Penjadwalan Waktu Akses',
        'banksoal': 'Bank Soal (HOTS)',
        'student-accounts': 'Manajemen Akun Siswa',
        'chat-history': 'Riwayat Chat Siswa',
        'monitoring': 'Status Siswa',
        'teacher-journal': 'Jurnal Harian Guru',

        'kisi-kisi': 'Pembuatan Kisi-kisi Soal',
        'violation-data': 'Data Pelanggaran Siswa'
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

    // Start Stage Timer if applicable
    startStageTimer(page);

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
        case 'tahap4':
            renderTahap4(main);
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
        case 'schedule-mgmt':
            if (typeof renderScheduleMgmt === 'function') renderScheduleMgmt(main);
            break;
        case 'banksoal':
            renderBankSoal(main);
            break;
        case 'student-accounts':
            renderStudentAccounts(main);
            break;
        case 'chat-history':
            renderChatHistory(main);
            break;
        case 'monitoring':
            renderMonitoring(main);
            break;
        case 'student-attendance':
            renderStudentAttendance(main);
            break;
        case 'teacher-journal':
            renderTeacherJournal(main);
            break;

        case 'kisi-kisi':
            renderKisiKisiSoal(main);
            break;
        case 'violation-data':
            renderViolationData(main);
            break;
        default:
            main.innerHTML = '<p>Halaman tidak ditemukan.</p>';
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', initApp);

window.filterTable = function (inputId, tableId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const filter = input.value.toLowerCase();
    const table = document.getElementById(tableId);
    if (!table) return;
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        const tds = tr[i].getElementsByTagName("td");
        if (tds.length === 0) continue; // skip headers
        let found = false;
        for (let j = 0; j < tds.length; j++) {
            if (tds[j]) {
                const txtValue = tds[j].textContent || tds[j].innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        tr[i].style.display = found ? "" : "none";
    }
}

window.sortTable = function (tableId, colIndex) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector('tbody') || table;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const ths = table.querySelectorAll('thead th');
    if (rows.length === 0 || rows[0].cells.length <= 1) return;
    let order = 'asc';
    const th = ths[colIndex];
    if (th) {
        if (th.dataset.sortDir === 'asc') order = 'desc';
        else order = 'asc';
        ths.forEach(t => {
            t.dataset.sortDir = '';
            const icon = t.querySelector('.fa-sort, .fa-sort-up, .fa-sort-down');
            if (icon) icon.className = 'fas fa-sort text-muted';
        });
        th.dataset.sortDir = order;
        const icon = th.querySelector('i.fas');
        if (icon) icon.className = order === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
    rows.sort((a, b) => {
        const cellA = a.cells[colIndex];
        const cellB = b.cells[colIndex];
        if (!cellA || !cellB) return 0;
        let valA = (cellA.textContent || cellA.innerText).trim();
        let valB = (cellB.textContent || cellB.innerText).trim();
        let isNumA = !isNaN(parseFloat(valA)) && isFinite(valA.replace('%', '').replace(/,/g, ''));
        let isNumB = !isNaN(parseFloat(valB)) && isFinite(valB.replace('%', '').replace(/,/g, ''));
        if (isNumA && isNumB) {
            let nA = parseFloat(valA.replace('%', '').replace(/,/g, ''));
            let nB = parseFloat(valB.replace('%', '').replace(/,/g, ''));
            return order === 'asc' ? nA - nB : nB - nA;
        }
        return order === 'asc' ? valA.localeCompare(valB, undefined, { numeric: true }) : valB.localeCompare(valA, undefined, { numeric: true });
    });
    rows.forEach(row => tbody.appendChild(row));
}