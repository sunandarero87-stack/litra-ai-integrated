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
            <div class="tahap-icon chat"><i class="fas fa-robot"></i></div>
            <h3>Tahap 1</h3>
            <p>Pembelajaran dengan Chatbot AI</p>
            <p class="tahap-status" style="color:${t1Status === 'completed' ? 'var(--success)' : 'var(--primary-light)'}">
                ${t1Status === 'completed' ? '✅ Selesai' : '📚 Mulai Belajar'}
            </p>
        </div>
        <div class="tahap-card ${t2Status}" onclick="${t2Status !== 'locked' ? "navigateTo('tahap2')" : ''}">
            ${t2Status === 'locked' ? '<i class="fas fa-lock lock-icon"></i>' : ''}
            ${t2Status === 'completed' ? '<i class="fas fa-check-circle lock-icon" style="color:var(--success)"></i>' : ''}
            <div class="tahap-icon quiz"><i class="fas fa-pencil-alt"></i></div>
            <h3>Tahap 2</h3>
            <p>Latihan Soal (20 soal)</p>
            <p class="tahap-status" style="color:${t2Status === 'completed' ? 'var(--success)' : t2Status === 'locked' ? 'var(--text-muted)' : 'var(--accent)'}">
                ${t2Status === 'completed' ? '✅ Selesai' : t2Status === 'locked' ? '🔒 Terkunci' : '📝 Mulai Latihan'}
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
    const histories = getChatHistories();
    const myHistory = histories[currentUser.username] || [];

    main.innerHTML = `
    <div class="chat-container">
        <div class="chat-header">
            <div class="bot-avatar"><i class="fas fa-robot"></i></div>
            <div class="chat-header-info">
                <h3>Litra-AI</h3>
                <p>Asisten Pak Nandar untuk Mata Pelajaran Informatika</p>
            </div>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
            <input type="text" id="chat-input-field" placeholder="Ketik pertanyaanmu..." onkeypress="if(event.key==='Enter')sendChatMessage()">
            <button onclick="sendChatMessage()"><i class="fas fa-paper-plane"></i></button>
        </div>
    </div>
    <div class="chat-complete-btn">
        <button class="btn btn-success" onclick="completeTahap1()">
            <i class="fas fa-check"></i> Selesai Belajar - Lanjut ke Tahap 2
        </button>
    </div>`;

    const chatBox = document.getElementById('chat-messages');

    // Show greeting if no history
    if (myHistory.length === 0) {
        appendMessage(chatBox, 'bot', ChatbotEngine.formatMessage(ChatbotEngine.greeting));
    } else {
        myHistory.forEach(m => appendMessage(chatBox, m.role, ChatbotEngine.formatMessage(m.text)));
    }
}

function appendMessage(container, role, html) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${role === 'bot' ? 'fa-robot' : 'fa-user'}"></i>
        </div>
        <div class="message-bubble">${html}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById('chat-input-field');
    const msg = input.value.trim();
    if (!msg) return;

    const chatBox = document.getElementById('chat-messages');
    appendMessage(chatBox, 'user', msg);

    // Save to history
    const histories = getChatHistories();
    if (!histories[currentUser.username]) histories[currentUser.username] = [];
    histories[currentUser.username].push({ role: 'user', text: msg, time: new Date().toISOString() });

    input.value = '';
    input.disabled = true;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'message bot';
    typing.id = 'typing-indicator';
    typing.innerHTML = `<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Use Gemini API (async) with fallback to local engine
    ChatbotEngine.getResponseFromAPI(msg, currentUser.username, histories[currentUser.username])
        .then(response => {
            const ti = document.getElementById('typing-indicator');
            if (ti) ti.remove();
            const formatted = ChatbotEngine.formatMessage(response);
            appendMessage(chatBox, 'bot', formatted);
            histories[currentUser.username].push({ role: 'bot', text: response, time: new Date().toISOString() });
            saveChatHistories(histories);
            input.disabled = false;
            input.focus();
        })
        .catch(err => {
            const ti = document.getElementById('typing-indicator');
            if (ti) ti.remove();
            const fallback = ChatbotEngine.getResponse(msg);
            const formatted = ChatbotEngine.formatMessage(fallback);
            appendMessage(chatBox, 'bot', formatted);
            histories[currentUser.username].push({ role: 'bot', text: fallback, time: new Date().toISOString() });
            saveChatHistories(histories);
            input.disabled = false;
            input.focus();
        });
}


function completeTahap1() {
    const histories = getChatHistories();
    const myHistory = histories[currentUser.username] || [];
    if (myHistory.length < 2) {
        alert('Kamu harus bertanya minimal 1 pertanyaan ke Litra-AI sebelum melanjutkan!');
        return;
    }
    updateProgress(currentUser.username, { tahap1Complete: true });
    alert('🎉 Tahap 1 selesai! Sekarang kamu bisa mengerjakan Latihan Soal di Tahap 2.');
    navigateTo('dashboard');
}

// ---- TAHAP 2: LATIHAN SOAL ----
let practiceAnswers = {};
let practiceCurrentQ = 0;
let practiceSubmitted = false;

function renderTahap2(main) {
    practiceAnswers = {};
    practiceCurrentQ = 0;
    practiceSubmitted = false;
    const progress = getProgress(currentUser.username);
    if (progress.tahap2Complete) {
        main.innerHTML = `<div class="score-display"><div class="score-circle pass">✅<small>SELESAI</small></div><p>Kamu sudah menyelesaikan Tahap 2!</p><p>Skor: ${progress.tahap2Score}/20</p><button class="btn btn-primary mt-2" onclick="navigateTo('dashboard')">Kembali ke Dashboard</button></div>`;
        return;
    }
    showPracticeQuestion(main);
}

function showPracticeQuestion(main) {
    const q = PRACTICE_QUESTIONS[practiceCurrentQ];
    const total = PRACTICE_QUESTIONS.length;
    main.innerHTML = `
    <div class="quiz-container">
        <div class="quiz-header">
            <span class="quiz-progress-text">Soal ${practiceCurrentQ + 1} dari ${total}</span>
            <div class="progress-bar" style="flex:1;max-width:300px"><div class="progress-fill" style="width:${((practiceCurrentQ + 1) / total) * 100}%"></div></div>
        </div>
        <div class="question-card">
            <div class="question-number">Soal ${practiceCurrentQ + 1}</div>
            <div class="question-text">${q.question}</div>
            <div class="options-list">
                ${q.options.map((opt, i) => `
                    <div class="option-item ${practiceAnswers[q.id] === i ? 'selected' : ''}" onclick="selectPracticeAnswer(${q.id}, ${i})">
                        <div class="option-radio"></div>
                        <span>${opt}</span>
                    </div>`).join('')}
            </div>
        </div>
        <div class="quiz-nav">
            <button class="btn btn-outline" ${practiceCurrentQ === 0 ? 'disabled' : ''} onclick="practiceCurrentQ--;showPracticeQuestion(document.getElementById('main-content'))">
                <i class="fas fa-arrow-left"></i> Sebelumnya
            </button>
            ${practiceCurrentQ < total - 1 ?
            `<button class="btn btn-primary" onclick="practiceCurrentQ++;showPracticeQuestion(document.getElementById('main-content'))">Selanjutnya <i class="fas fa-arrow-right"></i></button>` :
            `<button class="btn btn-success" onclick="submitPractice()"><i class="fas fa-check"></i> Kirim Jawaban</button>`
        }
        </div>
    </div>`;
}

function selectPracticeAnswer(qId, optIdx) {
    practiceAnswers[qId] = optIdx;
    showPracticeQuestion(document.getElementById('main-content'));
}

function submitPractice() {
    const answered = Object.keys(practiceAnswers).length;
    if (answered < PRACTICE_QUESTIONS.length) {
        if (!confirm(`Kamu baru menjawab ${answered}/${PRACTICE_QUESTIONS.length} soal. Yakin mau kirim?`)) return;
    }
    let score = 0;
    PRACTICE_QUESTIONS.forEach(q => {
        if (practiceAnswers[q.id] === q.correct) score++;
    });

    const pass = score >= 15;
    const main = document.getElementById('main-content');
    main.innerHTML = `
    <div class="quiz-container">
        <div class="score-display">
            <div class="score-circle ${pass ? 'pass' : 'fail'}">
                ${score}/20
                <small>${pass ? 'LULUS' : 'BELUM LULUS'}</small>
            </div>
            <h2>${pass ? '🎉 Selamat!' : '😔 Belum Berhasil'}</h2>
            <p>${pass ? 'Kamu berhasil! Sekarang Tahap 3 (Asesmen) sudah terbuka.' : 'Kamu harus menjawab minimal 15 soal dengan benar. Coba lagi!'}</p>
            <button class="btn ${pass ? 'btn-primary' : 'btn-warning'} mt-2" onclick="${pass ? "navigateTo('dashboard')" : "renderTahap2(document.getElementById('main-content'))"}">
                ${pass ? 'Kembali ke Dashboard' : 'Coba Lagi'}
            </button>
        </div>
    </div>`;

    if (pass) {
        updateProgress(currentUser.username, { tahap2Complete: true, tahap2Score: score });
    }
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
    const q = ASSESSMENT_QUESTIONS[assessmentCurrentQ];
    const total = ASSESSMENT_QUESTIONS.length;
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
            <div class="question-number">Soal ${assessmentCurrentQ + 1} <span class="question-type-badge ${q.type}">${q.type === 'literasi' ? '📖 Literasi' : '🔢 Numerasi'}</span></div>
            <div class="question-text" style="white-space:pre-line">${q.question}</div>
            <div class="options-list">
                ${q.options.map((opt, i) => `
                    <div class="option-item ${assessmentAnswers[q.id] === i ? 'selected' : ''}" onclick="selectAssessmentAnswer(${q.id}, ${i})">
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

    let score = 0, literasi = 0, numerasi = 0, litTotal = 0, numTotal = 0;
    ASSESSMENT_QUESTIONS.forEach(q => {
        if (q.type === 'literasi') { litTotal++; if (assessmentAnswers[q.id] === q.correct) { score++; literasi++; } }
        else { numTotal++; if (assessmentAnswers[q.id] === q.correct) { score++; numerasi++; } }
    });

    const total = ASSESSMENT_QUESTIONS.length;
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
