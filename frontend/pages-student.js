// ============================================
// PAGES - Student Dashboard, Tahap 1-3
// ============================================

function renderStudentDashboard(main) {
    const progress = getProgress(currentUser.username);
    const results = getAssessmentResults();
    const myResult = results[currentUser.username];

    let scoreHtml = '';
    if (myResult) {
        const pct = Math.round((myResult.score / myResult.total) * 100);
        const pass = pct >= 70;
        scoreHtml = `
        <div class="card mt-2">
            <div class="card-header"><h3 class="card-title">📊 Hasil Asesmen Terakhir</h3></div>
            <div class="score-display">
                <div class="score-circle ${pass ? 'pass' : 'fail'}">
                    ${pct}%
                    <small>${pass ? 'LULUS' : 'TIDAK LULUS'}</small>
                </div>
                <p>Benar: ${myResult.score}/${myResult.total}</p>
                <p>Literasi: ${myResult.literasi || 0} | Numerasi: ${myResult.numerasi || 0}</p>
                ${!pass ? '<p class="mt-1" style="color:var(--danger)"><i class="fas fa-exclamation-triangle"></i> Nilai di bawah 70%. Silakan ulangi dari Tahap 1.</p>' : '<p class="mt-1" style="color:var(--success)"><i class="fas fa-check-circle"></i> Selamat! Kamu telah lulus asesmen!</p>'}
            </div>
        </div>`;
    }

    const t1Status = progress.tahap1Complete ? 'completed' : 'unlocked';
    const t2Status = progress.tahap1Complete ? (progress.tahap2Complete ? 'completed' : 'unlocked') : 'locked';
    const t3Status = progress.tahap2Complete ? (progress.tahap3Complete ? 'completed' : 'unlocked') : 'locked';

    main.innerHTML = `
    <div style="margin-bottom:1.5rem">
        <h2 style="font-size:1.3rem;font-weight:800">Selamat Datang, ${currentUser.name}! 👋</h2>
        <p class="text-muted">Lanjutkan perjalanan belajarmu tentang Analisis Data</p>
    </div>
    <div class="tahap-grid">
        <div class="tahap-card ${t1Status}" onclick="${t1Status !== 'locked' ? "navigateTo('tahap1')" : ''}">
            ${t1Status === 'locked' ? '<i class="fas fa-lock lock-icon"></i>' : ''}
            ${t1Status === 'completed' ? '<i class="fas fa-check-circle lock-icon" style="color:var(--success)"></i>' : ''}
            <div class="tahap-icon chat"><i class="fas fa-book-open"></i></div>
            <h3>Tahap 1</h3>
            <p>Pembelajaran Materi Guru</p>
            <p class="tahap-status" style="color:${t1Status === 'completed' ? 'var(--success)' : 'var(--primary-light)'}">
                ${t1Status === 'completed' ? '✅ Selesai' : '📚 Mulai Belajar'}
            </p>
        </div>
        <div class="tahap-card ${t2Status}" onclick="${t2Status !== 'locked' ? "navigateTo('tahap2')" : ''}">
            ${t2Status === 'locked' ? '<i class="fas fa-lock lock-icon"></i>' : ''}
            ${t2Status === 'completed' ? '<i class="fas fa-check-circle lock-icon" style="color:var(--success)"></i>' : ''}
            <div class="tahap-icon quiz"><i class="fas fa-pencil-alt"></i></div>
            <h3>Tahap 2</h3>
            <p>Refleksi (5 Soal Essay)</p>
            <p class="tahap-status" style="color:${t2Status === 'completed' ? 'var(--success)' : t2Status === 'locked' ? 'var(--text-muted)' : 'var(--accent)'}">
                ${t2Status === 'completed' ? '✅ Selesai' : t2Status === 'locked' ? '🔒 Terkunci' : '📝 Mulai Refleksi'}
            </p>
        </div>
        <div class="tahap-card ${t3Status}" onclick="${t3Status !== 'locked' ? "navigateTo('tahap3')" : ''}">
            ${t3Status === 'locked' ? '<i class="fas fa-lock lock-icon"></i>' : ''}
            ${t3Status === 'completed' ? '<i class="fas fa-check-circle lock-icon" style="color:var(--success)"></i>' : ''}
            <div class="tahap-icon exam"><i class="fas fa-file-alt"></i></div>
            <h3>Tahap 3</h3>
            <p>Asesmen Utama (50 soal ANBK)</p>
            <p class="tahap-status" style="color:${t3Status === 'completed' ? 'var(--success)' : t3Status === 'locked' ? 'var(--text-muted)' : 'var(--danger)'}">
                ${t3Status === 'completed' ? '✅ Selesai' : t3Status === 'locked' ? '🔒 Terkunci' : '🎯 Mulai Asesmen'}
            </p>
        </div>
    </div>
    ${scoreHtml}`;
}

// ---- TAHAP 1: CHATBOT ----
function renderTahap1(main) {
    const materials = getMaterials();

    main.innerHTML = `
    <div class="card">
        <div class="card-header">
            <h3>📖 Tahap 1: Materi Pembelajaran</h3>
            <p class="text-muted">Pelajari materi yang telah diunggah oleh Pak Nandar di bawah ini sebelum melanjutkan.</p>
        </div>
        <div class="material-list mt-2" style="max-height: 400px; overflow-y: auto;">
            ${materials.map((m, i) => `
                <div class="material-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border-color);">
                    <div>
                        <i class="fas ${m.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-word'}" style="color: var(--primary); font-size: 1.5rem; margin-right: 1rem; vertical-align: middle;"></i>
                        <span style="font-weight: 500;">${m.name}</span>
                        <small class="text-muted d-block mt-1">Diupload: ${new Date(m.date).toLocaleDateString('id-ID')}</small>
                    </div>
                </div>`).join('') || '<p class="text-muted text-center mt-2">Belum ada materi untuk dipelajari.</p>'}
        </div>
        <div class="chat-complete-btn mt-2" style="text-align: right;">
            <button class="btn btn-success" onclick="completeTahap1()">
                <i class="fas fa-check"></i> Selesai Belajar - Lanjut ke Tahap 2
            </button>
        </div>
    </div>`;
}

function completeTahap1() {
    updateProgress(currentUser.username, { tahap1Complete: true });
    alert('🎉 Tahap 1 selesai! Sekarang kamu bisa mengerjakan Latihan Soal di Tahap 2.');
    navigateTo('dashboard');
}

// ---- TAHAP 2: REFLEKSI (ESSAY) ----
let reflectionQuestions = [];
let reflectionAnswers = {};
let reflectionLoading = false;

async function renderTahap2(main) {
    const progress = getProgress(currentUser.username);
    if (progress.tahap2Complete) {
        main.innerHTML = `
        <div class="score-display">
            <div class="score-circle pass">✅<small>SELESAI</small></div>
            <p>Kamu sudah menyelesaikan Tahap 2: Refleksi!</p>
            <p>Status: SIAP ASESMEN</p>
            <button class="btn btn-primary mt-2" onclick="navigateTo('dashboard')">Kembali ke Dashboard</button>
        </div>`;
        return;
    }

    if (reflectionQuestions.length === 0 && !reflectionLoading) {
        reflectionLoading = true;
        main.innerHTML = `<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Membangkitkan Pertanyaan Refleksi Berdasarkan Belajarmu...</div>`;

        try {
            const response = await fetch('/api/reflections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username })
            });
            const data = await response.json();
            if (data.success) {
                reflectionQuestions = data.reflections;
                reflectionLoading = false;
                renderTahap2(main);
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            console.error(e);
            reflectionQuestions = [
                "Apa hal terpenting yang kamu pelajari hari ini tentang Analisis Data?",
                "Bagian mana dari Microsoft Excel yang menurutmu paling menantang?",
                "Bagaimana kamu akan menggunakan rumus Excel yang baru kamu pelajari untuk membantu tugas sekolahmu?",
                "Apakah kamu sudah mempraktikkan kebiasaan 'Gemar Belajar' dengan bertanya aktif hari ini? Jelaskan.",
                "Apa targetmu selanjutnya setelah memahami materi ini?"
            ];
            reflectionLoading = false;
            renderTahap2(main);
        }
        return;
    }

    main.innerHTML = `
    <div class="quiz-container">
        <div class="quiz-header">
            <h3>📝 Tahap 2: Refleksi Belajar</h3>
            <p class="text-muted">Jawablah pertanyaan berikut dengan jujur berdasarkan apa yang telah kamu diskusikan dengan Litra-AI.</p>
        </div>
        <div class="card mt-2">
            <form id="reflection-form">
                ${reflectionQuestions.map((q, i) => `
                <div class="question-group mb-2">
                    <label class="d-block mb-1"><strong>${i + 1}. ${q}</strong></label>
                    <textarea 
                        class="form-input reflection-input" 
                        rows="3" 
                        onpaste="return false;" 
                        oncopy="return false;" 
                        oncontextmenu="return false;"
                        data-question="${q}"
                        placeholder="Ketik jawabanmu di sini... (Copy-paste dilarang)"
                        required
                    ></textarea>
                </div>`).join('')}
                <div class="quiz-nav">
                    <button type="button" class="btn btn-outline" onclick="navigateTo('dashboard')">Batal</button>
                    <button type="submit" class="btn btn-success" id="submit-reflection">
                        <i class="fas fa-paper-plane"></i> Kirim Refleksi
                    </button>
                </div>
            </form>
        </div>
    </div>`;

    document.getElementById('reflection-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-reflection');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menganalisis Refleksi...';

        const inputs = document.querySelectorAll('.reflection-input');
        const answers = Array.from(inputs).map(input => ({
            question: input.dataset.question,
            answer: input.value
        }));

        try {
            // 1. Analyze Readiness
            const analysisRes = await fetch('/api/assessment/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username, reflectionAnswers: answers })
            });
            const analysisData = await analysisRes.json();

            // 2. Generate Assessment Questions
            const genRes = await fetch('/api/assessment/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username, reflectionAnswers: answers })
            });
            const genData = await genRes.json();

            // Update local progress with generated questions and analysis
            const progress = getProgress(currentUser.username);
            progress.tahap2Complete = true;
            progress.aiReadiness = analysisData.analysis;
            progress.isReady = analysisData.ready;
            progress.generatedAssessment = genData.questions;
            updateProgress(currentUser.username, progress);

            // Notify Guru Recommendation in background (handled by progress object usually)

            alert('🎉 Refleksi berhasil dikirim! AI telah menganalisis kesiapanmu.');
            navigateTo('dashboard');
        } catch (err) {
            console.error(err);
            alert('Gagal mengirim refleksi. Silakan coba lagi.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Refleksi';
        }
    });
}


// ---- TAHAP 3: ASESMEN ----
let assessmentAnswers = {};
let assessmentCurrentQ = 0;
let assessmentActive = false;

function renderTahap3(main) {
    const progress = getProgress(currentUser.username);

    // Check if already completed
    if (progress.tahap3Complete) {
        const results = getAssessmentResults();
        const r = results[currentUser.username];
        if (r) {
            const pct = Math.round((r.score / r.total) * 100);
            main.innerHTML = `<div class="score-display"><div class="score-circle ${pct >= 70 ? 'pass' : 'fail'}">${pct}%<small>${pct >= 70 ? 'LULUS' : 'TIDAK LULUS'}</small></div><p>Skor: ${r.score}/${r.total}</p><p>Literasi: ${r.literasi} | Numerasi: ${r.numerasi}</p><button class="btn btn-primary mt-2" onclick="navigateTo('dashboard')">Kembali</button></div>`;
        }
        return;
    }

    // Check approval
    const approvals = getApprovals();
    if (!approvals[currentUser.username]) {
        main.innerHTML = `
        <div class="card">
            <div class="approval-waiting">
                <div class="approval-icon"><i class="fas fa-hourglass-half"></i></div>
                <h2>Menunggu Persetujuan Guru</h2>
                <p class="text-muted">Guru harus menyetujui kamu sebelum asesmen dapat dimulai.</p>
                <p class="text-muted mt-1">Hubungi Pak Nandar untuk mendapatkan persetujuan.</p>
                <button class="btn btn-outline mt-2" onclick="navigateTo('dashboard')">Kembali ke Dashboard</button>
            </div>
        </div>`;
        return;
    }

    // Show start screen
    if (!assessmentActive) {
        const settings = getAssessmentSettings();
        main.innerHTML = `
        <div class="card" style="max-width:600px;margin:0 auto;text-align:center;padding:2.5rem">
            <div class="tahap-icon exam" style="margin:0 auto 1.5rem"><i class="fas fa-file-alt"></i></div>
            <h2>Asesmen Utama</h2>
            <p class="text-muted mt-1">Format ANBK (Literasi & Numerasi)</p>
            <div style="margin:1.5rem 0;text-align:left" class="card" style="background:var(--bg-input)">
                <p><i class="fas fa-list"></i> <strong>Jumlah Soal:</strong> 50 soal</p>
                <p class="mt-1"><i class="fas fa-clock"></i> <strong>Waktu:</strong> ${settings.duration} menit</p>
                <p class="mt-1"><i class="fas fa-exclamation-triangle" style="color:var(--danger)"></i> <strong>Peringatan:</strong> Jika membuka tab lain, soal akan diulang dari awal!</p>
                <p class="mt-1"><i class="fas fa-percentage"></i> <strong>KKM:</strong> 70%</p>
            </div>
            <button class="btn btn-danger btn-full" onclick="startAssessment()">
                <i class="fas fa-play"></i> Mulai Asesmen
            </button>
        </div>`;
        return;
    }

    showAssessmentQuestion(main);
}

function startAssessment() {
    assessmentAnswers = {};
    assessmentCurrentQ = 0;
    assessmentActive = true;
    tabViolationCount = 0;
    const settings = getAssessmentSettings();
    assessmentTimeLeft = settings.duration * 60;

    // Start timer
    assessmentTimer = setInterval(() => {
        assessmentTimeLeft--;
        updateTimerDisplay();
        if (assessmentTimeLeft <= 0) {
            clearInterval(assessmentTimer);
            assessmentTimer = null;
            submitAssessment();
        }
    }, 1000);

    // Tab visibility detection
    document.addEventListener('visibilitychange', handleTabSwitch);

    showAssessmentQuestion(document.getElementById('main-content'));
}

function handleTabSwitch() {
    if (!assessmentActive) return;
    if (document.hidden) {
        tabViolationCount++;
        assessmentAnswers = {};
        assessmentCurrentQ = 0;

        // Show violation overlay
        const overlay = document.createElement('div');
        overlay.className = 'tab-violation-overlay';
        overlay.id = 'tab-violation-overlay';
        overlay.innerHTML = `
            <div class="tab-violation-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>⚠️ Pelanggaran Terdeteksi!</h2>
                <p>Kamu membuka tab lain! Semua jawaban direset. Timer tetap berjalan.</p>
                <p>Pelanggaran ke-${tabViolationCount}</p>
                <button class="btn btn-outline" onclick="dismissViolation()" style="color:white;border-color:white">
                    Kembali ke Soal
                </button>
            </div>`;
        document.body.appendChild(overlay);
    }
}

function dismissViolation() {
    const overlay = document.getElementById('tab-violation-overlay');
    if (overlay) overlay.remove();
    showAssessmentQuestion(document.getElementById('main-content'));
}

function updateTimerDisplay() {
    const el = document.getElementById('assessment-timer');
    if (!el) return;
    const mins = Math.floor(assessmentTimeLeft / 60);
    const secs = assessmentTimeLeft % 60;
    el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    el.className = 'quiz-timer' + (assessmentTimeLeft < 300 ? ' danger' : assessmentTimeLeft < 600 ? ' warning' : '');
}

function showAssessmentQuestion(main) {
    const progress = getProgress(currentUser.username);
    const questions = progress.generatedAssessment && progress.generatedAssessment.length > 0
        ? progress.generatedAssessment
        : ASSESSMENT_QUESTIONS;

    const q = questions[assessmentCurrentQ];
    const total = questions.length;
    const mins = Math.floor(assessmentTimeLeft / 60);
    const secs = assessmentTimeLeft % 60;

    main.innerHTML = `
    <div class="quiz-container">
        <div class="quiz-header">
            <span class="quiz-progress-text">Soal ${assessmentCurrentQ + 1}/${total}</span>
            <div class="quiz-timer" id="assessment-timer">${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</div>
        </div>
        <div class="progress-bar mb-2"><div class="progress-fill" style="width:${((assessmentCurrentQ + 1) / total) * 100}%"></div></div>
        <div class="question-card">
            <div class="question-number">Soal ${assessmentCurrentQ + 1} <span class="question-type-badge ${q.type || 'literasi'}">${(q.type || 'literasi') === 'literasi' ? '📖 Literasi' : '🔢 Numerasi'}</span></div>
            <div class="question-text" style="white-space:pre-line">${q.question}</div>
            <div class="options-list">
                ${q.options.map((opt, i) => `
                    <div class="option-item ${assessmentAnswers[q.id || assessmentCurrentQ] === i ? 'selected' : ''}" onclick="selectAssessmentAnswer(${q.id || assessmentCurrentQ}, ${i})">
                        <div class="option-radio"></div>
                        <span>${opt}</span>
                    </div>`).join('')}
            </div>
        </div>
        <div class="quiz-nav">
            <button class="btn btn-outline" ${assessmentCurrentQ === 0 ? 'disabled' : ''} onclick="assessmentCurrentQ--;showAssessmentQuestion(document.getElementById('main-content'))">
                <i class="fas fa-arrow-left"></i> Sebelumnya
            </button>
            ${assessmentCurrentQ < total - 1 ?
            `<button class="btn btn-primary" onclick="assessmentCurrentQ++;showAssessmentQuestion(document.getElementById('main-content'))">Selanjutnya <i class="fas fa-arrow-right"></i></button>` :
            `<button class="btn btn-danger" onclick="submitAssessment()"><i class="fas fa-flag-checkered"></i> Selesai</button>`
        }
        </div>
    </div>`;
}

function selectAssessmentAnswer(qId, optIdx) {
    assessmentAnswers[qId] = optIdx;
    showAssessmentQuestion(document.getElementById('main-content'));
}

function submitAssessment() {
    if (assessmentTimer) { clearInterval(assessmentTimer); assessmentTimer = null; }
    document.removeEventListener('visibilitychange', handleTabSwitch);
    assessmentActive = false;

    const progress = getProgress(currentUser.username);
    const questions = progress.generatedAssessment && progress.generatedAssessment.length > 0
        ? progress.generatedAssessment
        : ASSESSMENT_QUESTIONS;

    let score = 0, literasi = 0, numerasi = 0, litTotal = 0, numTotal = 0;
    questions.forEach((q, idx) => {
        const qId = q.id || idx;
        const qType = q.type || 'literasi';
        if (qType === 'literasi') { litTotal++; if (assessmentAnswers[qId] === q.correct) { score++; literasi++; } }
        else { numTotal++; if (assessmentAnswers[qId] === q.correct) { score++; numerasi++; } }
    });

    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    const pass = pct >= 70;

    // Save results
    const results = getAssessmentResults();
    results[currentUser.username] = { score, total, literasi, numerasi, litTotal, numTotal, pct, pass, date: new Date().toISOString(), violations: tabViolationCount };
    saveAssessmentResults(results);


    updateProgress(currentUser.username, { tahap3Complete: true });

    // If fail, reset to tahap 1
    if (!pass) {
        updateProgress(currentUser.username, { tahap: 1, tahap1Complete: false, tahap2Complete: false, tahap2Score: 0, tahap3Complete: false });
        // Clear approval
        const approvals = getApprovals();
        delete approvals[currentUser.username];
        saveApprovals(approvals);
    }

    const main = document.getElementById('main-content');
    main.innerHTML = `
    <div class="quiz-container">
        <div class="score-display">
            <div class="score-circle ${pass ? 'pass' : 'fail'}">
                ${pct}%
                <small>${pass ? 'LULUS' : 'TIDAK LULUS'}</small>
            </div>
            <h2>${pass ? '🎉 Selamat! Kamu Lulus!' : '😔 Belum Berhasil'}</h2>
            <div class="analysis-grid mt-2">
                <div class="analysis-card">
                    <h4>📖 Literasi</h4>
                    <div class="analysis-value ${literasi / litTotal >= 0.7 ? 'high' : literasi / litTotal >= 0.5 ? 'medium' : 'low'}">${literasi}/${litTotal}</div>
                </div>
                <div class="analysis-card">
                    <h4>🔢 Numerasi</h4>
                    <div class="analysis-value ${numerasi / numTotal >= 0.7 ? 'high' : numerasi / numTotal >= 0.5 ? 'medium' : 'low'}">${numerasi}/${numTotal}</div>
                </div>
                <div class="analysis-card">
                    <h4>📊 Keseluruhan</h4>
                    <div class="analysis-value ${pass ? 'high' : 'low'}">${score}/${total}</div>
                </div>
            </div>
            ${!pass ? '<p style="color:var(--danger)" class="mt-2"><i class="fas fa-redo"></i> Kamu harus mengulang dari Tahap 1.</p>' : ''}
            ${tabViolationCount > 0 ? `<p class="mt-1 text-muted">⚠️ Pelanggaran tab: ${tabViolationCount}x</p>` : ''}
            <button class="btn btn-primary mt-2" onclick="navigateTo('dashboard')">Kembali ke Dashboard</button>
        </div>
    </div>`;
}
