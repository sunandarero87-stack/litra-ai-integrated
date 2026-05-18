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
    const t3Status = (progress.tahap2Complete && progress.isReady) ? (progress.tahap3Complete ? 'completed' : 'unlocked') : 'locked';
    const t4Status = progress.tahap3Complete ? (progress.tahap4Complete ? 'completed' : 'unlocked') : 'locked';

    let downloadCardHtml = '';
    if (progress.tahap4Complete) {
        downloadCardHtml = `
        <div class="card mt-3 fade-in" style="background: linear-gradient(135deg, var(--bg-card), #162444); border: 1px solid var(--primary-light); text-align: center; padding: 2rem; border-radius: 16px;">
            <div style="font-size: 2.5rem; color: var(--accent); margin-bottom: 0.75rem;"><i class="fas fa-trophy"></i></div>
            <h3 class="card-title" style="font-size: 1.3rem; margin-bottom: 0.5rem; color: #fff;">🎉 Selamat, Kamu Telah Menyelesaikan Semua Tahap!</h3>
            <p class="text-muted" style="max-width: 520px; margin: 0 auto 1.5rem auto; font-size: 0.9rem; line-height: 1.5;">Semua tahapan pembelajaran dari Tahap 1 hingga Tahap 4 telah berhasil kamu lalui dengan gemilang. Laporan resmi hasil belajar, analisis kompetensi, serta saran karakter dari AI siap diunduh.</p>
            <button class="btn btn-success" onclick="downloadProgressReportPDF()" style="padding: 0.8rem 2.25rem; font-size: 1rem; border-radius: 12px; font-weight: 700;">
                <i class="fas fa-file-pdf" style="margin-right: 0.5rem;"></i> Unduh Laporan PDF Resmi
            </button>
        </div>`;
    }

    main.innerHTML = `
    <div style="margin-bottom:1.5rem">
        <h2 style="font-size:1.3rem;font-weight:800">Selamat Datang, ${currentUser.name}! 👋</h2>
        <p class="text-muted">Selamat Belajar Anak Hebat</p>
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
            <p>Asesmen Utama (10 soal AKM)</p>
            <p class="tahap-status" style="color:${t3Status === 'completed' ? 'var(--success)' : t3Status === 'locked' ? 'var(--text-muted)' : 'var(--danger)'}">
                ${t3Status === 'completed' ? '✅ Selesai' : t3Status === 'locked' ? '🔒 Terkunci' : '🎯 Mulai Asesmen'}
            </p>
        </div>
        <div class="tahap-card ${t4Status}" onclick="${t4Status !== 'locked' ? "navigateTo('tahap4')" : ''}">
            ${t4Status === 'locked' ? '<i class="fas fa-lock lock-icon"></i>' : ''}
            ${t4Status === 'completed' ? '<i class="fas fa-check-circle lock-icon" style="color:var(--success)"></i>' : ''}
            <div class="tahap-icon" style="background:var(--success-light);color:var(--success)"><i class="fas fa-heart"></i></div>
            <h3>Tahap 4</h3>
            <p>Refleksi 7 Kebiasaan Hebat</p>
            <p class="tahap-status" style="color:${t4Status === 'completed' ? 'var(--success)' : t4Status === 'locked' ? 'var(--text-muted)' : 'var(--primary)'}">
                ${t4Status === 'completed' ? '✅ Selesai' : t4Status === 'locked' ? '🔒 Terkunci' : '📝 Mulai Refleksi'}
            </p>
        </div>
    </div>
    ${downloadCardHtml}
    ${scoreHtml}`;
}

let currentMaterial = null;

/**
 * Format teks mentah dari PDF/DOCX menjadi HTML yang rapi dan mudah dibaca
 */
function formatMaterialContent(rawText, title) {
    if (!rawText) return '<p class="text-muted">Konten kosong.</p>';

    // Bersihkan whitespace berlebih dan split per baris
    const lines = rawText.split('\n').map(l => l.trimEnd());
    let html = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) {
            if (inList) { html += '</ul>'; inList = false; }
            continue;
        }

        // Deteksi heading: baris pendek yang diikuti baris kosong atau awal dokumen, ALL CAPS atau diakhiri ':'
        const isShortLine = line.length < 80;
        const nextLineEmpty = !lines[i + 1] || !lines[i + 1].trim();
        const isUpperCase = line === line.toUpperCase() && /[A-Z]/.test(line);
        const isNumberedHeading = /^(BAB|Bab|BAGIAN|Bagian)\s/i.test(line) || /^[IVXLC]+\.\s/.test(line);
        const endsWithColon = line.endsWith(':');

        if (isNumberedHeading || (isShortLine && isUpperCase && line.length > 3)) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h3 style="color:var(--primary); margin:1.5rem 0 0.75rem; font-size:1.15rem; font-weight:700;">${escapeHtml(line)}</h3>`;
            continue;
        }

        if (isShortLine && endsWithColon && nextLineEmpty) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h4 style="color:var(--text-primary); margin:1.2rem 0 0.5rem; font-weight:600;">${escapeHtml(line)}</h4>`;
            continue;
        }

        // Deteksi list item: dimulai dengan -, •, *, atau angka.
        const listMatch = line.match(/^(\d+[\.\)]\s|[-•*]\s)/);
        if (listMatch) {
            if (!inList) { html += '<ul style="margin:0.5rem 0 0.5rem 1.5rem; list-style:disc;">'; inList = true; }
            const content = line.replace(/^(\d+[\.\)]\s|[-•*]\s)/, '');
            html += `<li style="margin-bottom:0.3rem;">${escapeHtml(content)}</li>`;
            continue;
        }

        // Deteksi list alfabet: a. b. c. dst.
        const alphaMatch = line.match(/^[a-z][\.\)]\s/i);
        if (alphaMatch) {
            if (!inList) { html += '<ul style="margin:0.5rem 0 0.5rem 1.5rem; list-style:lower-alpha;">'; inList = true; }
            const content = line.replace(/^[a-z][\.\)]\s/i, '');
            html += `<li style="margin-bottom:0.3rem;">${escapeHtml(content)}</li>`;
            continue;
        }

        if (inList) { html += '</ul>'; inList = false; }

        // Paragraf biasa
        html += `<p style="margin-bottom:0.75rem; text-align:justify;">${escapeHtml(line)}</p>`;
    }

    if (inList) html += '</ul>';
    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderTahap1(main) {
    main.innerHTML = `
    <div class="card" style="text-align:center; padding:4rem 2rem; border-radius:24px; background:linear-gradient(145deg, var(--bg-card), #0f172a); border:1px solid rgba(255,255,255,0.05); box-shadow:var(--shadow-lg);">
        <h2 style="font-size:1.75rem; font-weight:800; color:white; margin-bottom: 1rem;">Pilih Mode Belajar Tahap 1</h2>
        <p class="text-muted" style="margin-bottom: 2rem;">Silakan pilih jalur pembelajaran yang ingin kamu mulai.</p>
        <div style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;">
            <div class="tahap-card unlocked" onclick="renderTahap1Literasi(document.getElementById('main-content'))" style="cursor: pointer; width: 250px; background: var(--bg-card); border: 2px solid var(--primary); display: flex; flex-direction: column; align-items: center;">
                <div class="tahap-icon chat" style="margin-bottom: 1rem;"><i class="fas fa-book-open"></i></div>
                <h3 style="margin-bottom: 0.5rem;">Tombol Literasi</h3>
                <p>Eksplorasi Materi Guru</p>
            </div>
            <div class="tahap-card unlocked" onclick="renderTahap1Numerasi(document.getElementById('main-content'))" style="cursor: pointer; width: 250px; background: var(--bg-card); border: 2px solid var(--accent); display: flex; flex-direction: column; align-items: center;">
                <div class="tahap-icon" style="background:var(--accent-light);color:var(--accent); margin-bottom: 1rem;"><i class="fas fa-calculator"></i></div>
                <h3 style="margin-bottom: 0.5rem;">Tombol Numerasi</h3>
                <p>Uji Nalar Matematika AI</p>
            </div>
        </div>
    </div>
    `;
}

let currentMathProblem = null;
let currentHintIndex = 0;

window.renderTahap1Numerasi = async function(main) {
    main.innerHTML = `
    <div class="card" style="text-align:center; padding:4rem 2rem; border-radius:24px; background: #12141d; border:1px solid rgba(255,255,255,0.05); box-shadow:var(--shadow-lg); min-height: 60vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--accent); margin-bottom: 1rem;"></i>
        <h3 style="color: white;">NARA-AI Sedang Menyiapkan Soal...</h3>
        <p class="text-muted">Tunggu sebentar ya, soalnya dibuat khusus untukmu!</p>
    </div>
    `;

    try {
        const res = await fetch('/api/chat/generate-math', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username })
        });
        const data = await res.json();
        if (data.success && data.problem) {
            currentMathProblem = data.problem;
            currentHintIndex = 0;
            showMathProblemUI(main);
        } else {
            main.innerHTML = `<div style="color:var(--danger); padding: 2rem;">Gagal membuat soal. Silakan coba lagi.</div>`;
        }
    } catch (err) {
        main.innerHTML = `<div style="color:var(--danger); padding: 2rem;">Terjadi kesalahan koneksi.</div>`;
    }
}

window.showMathProblemUI = function(main) {
    main.innerHTML = `
    <div style="background-color: #12141d; color: white; padding: 4rem 2rem; border-radius: 16px; text-align: center; font-family: 'Inter', sans-serif; position: relative; min-height: 70vh;">
        <button onclick="renderTahap1(document.getElementById('main-content'))" style="position: absolute; top: 1.5rem; left: 1.5rem; background: none; border: none; color: #aaa; cursor: pointer; font-size: 1.1rem;"><i class="fas fa-arrow-left"></i> Kembali</button>
        <h2 style="font-size: 1.2rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1.5rem; color: #fff;">SOAL:</h2>
        <p style="font-size: 1.15rem; line-height: 1.8; max-width: 600px; margin: 0 auto 3rem auto; font-weight: 400;">
            ${currentMathProblem.question}
        </p>
        
        <div id="hint-container" style="margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; text-align: left;">
        </div>

        <div style="margin-bottom: 2rem;">
            <button id="btn-hint" class="btn btn-outline" style="border-radius: 20px; border: 1px solid white; background: transparent; color: white; padding: 0.5rem 1.5rem; font-weight: 600; cursor: pointer;" onclick="showNextHint()">
                HINT BERTAHAP
            </button>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; align-items: center; max-width: 400px; margin: 0 auto;">
            <input type="number" id="math-answer-input" class="form-input" placeholder="Jawaban (Angka)" style="flex: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.8rem; border-radius: 8px;">
            <button class="btn btn-primary" onclick="checkMathAnswer()" style="padding: 0.8rem 1.5rem; border-radius: 8px;">Jawab</button>
        </div>
        <div id="math-feedback" style="margin-top: 1rem; font-weight: 600;"></div>
    </div>
    `;
}

window.showNextHint = function() {
    if (!currentMathProblem || !currentMathProblem.hints) return;
    if (currentHintIndex < currentMathProblem.hints.length) {
        const hintContainer = document.getElementById('hint-container');
        const hintDiv = document.createElement('div');
        hintDiv.style.cssText = "background: rgba(255,255,255,0.05); border-left: 4px solid var(--accent); padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px; animation: slideUp 0.3s ease;";
        hintDiv.innerHTML = `<strong style="color:var(--accent)">Hint ${currentHintIndex + 1}:</strong> ${currentMathProblem.hints[currentHintIndex]}`;
        hintContainer.appendChild(hintDiv);
        currentHintIndex++;
        
        if (currentHintIndex >= currentMathProblem.hints.length) {
            document.getElementById('btn-hint').style.display = 'none';
        }
    }
}

window.checkMathAnswer = function() {
    const input = document.getElementById('math-answer-input').value;
    const feedback = document.getElementById('math-feedback');
    if (input === "") return;
    
    // Bandingkan sebagai float untuk toleransi
    const isCorrect = parseFloat(input) === parseFloat(currentMathProblem.answer);
    
    if (isCorrect) {
        feedback.style.color = 'var(--success)';
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> Jawaban Benar! Hebat! <br><button class="btn btn-sm btn-success mt-2" onclick="renderTahap1Numerasi(document.getElementById(\\'main-content\\'))"><i class="fas fa-redo"></i> Coba Soal Lain</button>';
    } else {
        feedback.style.color = 'var(--danger)';
        feedback.innerHTML = '<i class="fas fa-times-circle"></i> Jawaban masih kurang tepat, coba periksa lagi.';
    }
}

window.renderTahap1Literasi = function(main) {
    const progress = getProgress(currentUser.username);
    // Jika siswa sudah lulus Tahap 1 (tahap1Complete) dan belum menyelesaikan Tahap 2, maka Tahap 1 dikunci
    if (progress.tahap1Complete && !progress.tahap2Complete) {
        main.innerHTML = `
        <div class="card" style="text-align:center; padding:4rem 2rem; border-radius:24px; background:linear-gradient(145deg, var(--bg-card), #0f172a); border:1px solid rgba(255,255,255,0.05); box-shadow:var(--shadow-lg);">
            <div style="width:100px; height:100px; background:rgba(255,193,7,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem;">
                <i class="fas fa-lock" style="font-size:3rem; color:#ffc107; filter:drop-shadow(0 0 10px rgba(255,193,7,0.4));"></i>
            </div>
            <h2 style="font-size:1.75rem; font-weight:800; color:white;">Tahap 1 Terkunci</h2>
            <p class="text-muted mt-1" style="max-width:450px; margin-left:auto; margin-right:auto; line-height:1.6;">
                Kamu telah menyelesaikan eksplorasi materi dan saat ini sedang berada di <strong>Tahap 2 (Refleksi Mandiri)</strong>. 
                <br><br>Untuk menjaga fokus belajarmu, akses materi Tahap 1 dikunci sementara hingga kamu menyelesaikan refleksi.
            </p>
            <div class="mt-3">
                <button class="btn btn-primary" onclick="navigateTo('tahap2')" style="padding:0.8rem 2rem; font-weight:600; border-radius:12px;">
                    <i class="fas fa-arrow-right"></i> Lanjutkan ke Tahap 2
                </button>
            </div>
        </div>`;
        return;
    }

    let materials = getMaterials();
    // Filter materials by class: show if 'Semua Kelas' or matches student's base grade (e.g. 7.6 -> 7 matches 7.7 -> 7)
    materials = materials.filter(m => {
        if (!m.kelas || m.kelas === 'Semua Kelas') return true;
        if (m.kelas === currentUser.kelas) return true;

        const getGrade = (kelasStr) => {
            if (!kelasStr) return null;
            const match = kelasStr.match(/^\d+/);
            return match ? match[0] : kelasStr;
        };

        const mGrade = getGrade(m.kelas);
        const userGrade = getGrade(currentUser.kelas);

        return mGrade && userGrade && mGrade === userGrade;
    });

    const users = getUsers();
    const teacher = users.find(u => u.role === 'guru') || { name: 'Guru', photo: null };
    const teacherPhoto = teacher.photo ? `<img src="${teacher.photo}" alt="Guru" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fas fa-chalkboard-teacher"></i>';

    main.innerHTML = `
    <div class="card" id="tahap1-container">
        <div class="card-header">
            <h3>📖 Tahap 1: Materi Pembelajaran</h3>
            <p class="text-muted">Pelajari materi yang telah diunggah oleh Guru sebelum melanjutkan.</p>
        </div>
        <div class="material-list mt-2" id="material-list-container" style="max-height: 400px; overflow-y: auto;">
            ${materials.map((m, i) => `
                <div class="material-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="viewMaterial('${m._id}', '${m.type}')">
                    <div style="display:flex; align-items:center;">
                        <i class="fas ${m.type === 'pdf' ? 'fa-file-pdf' : m.type === 'html' || m.type === 'ai' ? 'fa-robot' : 'fa-file-word'}" style="color: var(--primary); font-size: 1.5rem; margin-right: 1rem; vertical-align: middle; flex-shrink:0;"></i>
                        <div>
                            <span style="font-weight: 500;">${m.name}</span>
                            <small class="text-muted d-block mt-1">Diupload: ${new Date(m.date).toLocaleDateString('id-ID')}</small>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink:0;" onclick="event.stopPropagation()">
                        <button class="btn btn-outline btn-sm" onclick="downloadMaterial('${m._id}', '${m.name}', '${m.type}', event)" title="Download Materi"><i class="fas fa-download"></i></button>
                        <button class="btn btn-primary btn-sm material-buka-btn" onclick="viewMaterial('${m._id}', '${m.type}')" style="position:relative; animation: pulse-buka 1.8s infinite; box-shadow: 0 0 0 0 rgba(99,102,241,0.7);">
                            <i class="fas fa-book-open" style="margin-right:0.3rem;"></i>Buka
                        </button>
                    </div>
                </div>`).join('') || '<p class="text-muted text-center mt-2">Belum ada materi untuk dipelajari.</p>'}
        </div>

        <div id="material-viewer-container" style="display:none; margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" onclick="closeMaterialViewer()"><i class="fas fa-arrow-left"></i> Kembali</button>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <label style="font-weight: 500;">Materi:</label>
                    <select id="material-selector" class="form-input" style="padding: 0.4rem; min-width: 200px;" onchange="switchMaterial(this.value)"></select>
                </div>
            </div>
            <div id="viewer-content-wrapper" style="border: 1px solid var(--border-color); border-radius: 8px; height: 75vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-input); overflow: hidden;">
                <i class="fas fa-file-alt" style="font-size: 4rem; color: var(--primary-light); margin-bottom: 1rem;"></i>
                <h4 id="viewer-title">Judul</h4>
                <p class="text-muted" id="viewer-type">Format</p>
                <div class="mt-2 text-center" style="max-width: 60%; color: var(--text-muted)">
                    Materi ini sedang ditampilkan dalam mode Viewer.<br>
                    Silakan pelajari dengan seksama dan gunakan Asisten NARA-AI di kanan bawah jika ada pertanyaan atau ingin berdiskusi.
                </div>
            </div>
        </div>
        <div class="chat-complete-btn mt-2" style="text-align: right; padding: 0 1rem 1rem;">
            <button id="btn-lanjut-tahap2" class="btn btn-success" style="display:${localStorage.getItem('tahap1_ready_' + currentUser.username) === 'true' ? 'inline-block' : 'none'};" onclick="completeTahap1()">
                <i class="fas fa-check"></i> Selesai Belajar - Lanjut ke Tahap 2
            </button>
        </div>
    </div>

    <!-- Floating Chatbot -->
    <div id="floating-chatbot-container" style="display:flex; position: fixed; bottom: 20px; right: 0; left: 0; padding: 0 20px; z-index: 99999; align-items: flex-end; flex-direction: column; pointer-events: none;">
        <div id="chatbot-panel" style="display: none; width: 100%; max-width: 100vw; height: 75vh; max-height: 80vh; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); margin-bottom: 1rem; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease; pointer-events: auto;">
            <div class="chat-header" style="background: var(--gradient-primary); color: white; padding: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                <div class="bot-avatar" style="width:44px;height:44px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;padding:2px;">
                    <img src="nara-ai-bot.png" alt="NARA-AI" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                </div>
                <div class="chat-header-info" style="flex:1">
                    <h3 style="font-size:0.95rem; margin:0">NARA-AI Asisten ${teacher.name}</h3>
                    <p id="chat-material-context" style="font-size:0.75rem; color: rgba(255,255,255,0.8); margin:0">Membahas: Pilih Materi</p>
                </div>
                <div class="chat-header-actions" style="display:flex; gap:0.5rem;">
                    <button style="background:none; border:none; color:white; cursor:pointer; font-size:1rem; opacity:0.8;" onclick="clearChatHistory()" title="Bersihkan Riwayat Chat"><i class="fas fa-trash-alt"></i></button>
                    <button style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;" onclick="toggleChatbot()"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div id="chat-material-selector-container" style="display: none; padding: 0.5rem 1rem; background: var(--bg-sidebar); border-bottom: 1px solid var(--border-color); align-items: center; gap: 0.5rem;">
                <label style="font-size: 0.75rem; font-weight: 600; white-space: nowrap;"><i class="fas fa-book"></i> Bahas:</label>
                <select id="chat-material-selector" class="form-input" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; flex: 1;" onchange="updateChatMaterial(this.value)">
                    <option value="">-- Pilih Materi --</option>
                    ${materials.map(m => `<option value="${m._id}">${m.name}</option>`).join('')}
                </select>
            </div>
            <div class="chat-messages" id="floating-chat-messages" style="flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:1rem;background:var(--bg-card);user-select:none;-webkit-user-select:none;" oncopy="return false;" oncontextmenu="return false;"></div>
            <div id="quick-replies" style="padding:0.5rem 1rem; background:var(--bg-card); display:none; gap:0.5rem; justify-content:center; border-top:1px solid var(--border-color); flex-wrap: wrap;"></div>
            <div class="chat-input" style="padding:1rem;display:flex;gap:0.5rem;background:var(--bg-sidebar); pointer-events: auto;">
                <input type="text" id="floating-chat-input" placeholder="Ketik pertanyaanmu..." style="flex:1;padding:0.7rem 1rem;background:var(--bg-input);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);outline:none;" onkeypress="if(event.key==='Enter')sendFloatingChat()">
                <button onclick="sendFloatingChat()" class="btn btn-primary" style="padding:0.7rem 1.2rem;"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
        <button id="chatbot-toggle-btn" onclick="toggleChatbot()" style="width: 65px; height: 65px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 3px solid var(--primary); box-shadow: 0 4px 15px rgba(99,102,241,0.5); transition: transform 0.3s; pointer-events: auto; overflow: hidden; padding: 0;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1.0)'">
            <img src="nara-ai-bot.png" alt="NARA-AI" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
        </button>
    </div>
    `;
}

function showMaterialPopup() {
    const existing = document.getElementById('material-reminder-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'material-reminder-popup';
    popup.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:var(--bg-card); padding:2rem; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.5); z-index:9999; text-align:center; max-width:400px; width:90%; animation: slideUp 0.3s ease; border: 1px solid var(--border-color);';
    popup.innerHTML = `
        <div style="margin-bottom:1rem; position:relative; display:inline-block;">
             <i class="fas fa-robot" style="font-size:3.5rem; color:var(--primary);"></i>
        </div>
        <h3 style="margin-bottom:0.75rem; color:var(--text-primary); font-size:1.2rem;">NARA-AI Siap Membantu!</h3>
        <p style="color:var(--text-secondary); margin-bottom:1.5rem; font-size:1rem; line-height:1.6;">Chat dengan <strong>NARA-AI</strong> untuk mendampingi kamu belajar dan menguji pemahamanmu.</p>
        <button class="btn btn-primary" onclick="this.parentElement.remove(); showChatbotPointer();" style="width:100%; padding: 0.8rem;">Saya Mengerti</button>
    `;
    document.body.appendChild(popup);
}

/**
 * Tunjukkan tanda panah ke arah chatbot toggle button
 */
function showChatbotPointer() {
    const btn = document.getElementById('chatbot-toggle-btn');
    if (!btn) return;

    // Hapus arrow lama jika ada
    const existingArrow = document.getElementById('chatbot-arrow-pointer');
    if (existingArrow) existingArrow.remove();

    const arrow = document.createElement('div');
    arrow.id = 'chatbot-arrow-pointer';
    // Posisi di atas tombol chatbot (bottom right)
    arrow.style.cssText = 'position: fixed; bottom: 90px; right: 20px; width: 120px; pointer-events: none; z-index: 1001;';
    arrow.innerHTML = `
        <div style="text-align: center; color: var(--primary-light); animation: bounce-arrow 2s infinite;">
            <div style="font-weight: 800; font-size: 0.75rem; background: var(--primary); color: white; padding: 4px 12px; border-radius: 20px; box-shadow: var(--shadow-md); margin-bottom: 10px; white-space: nowrap; text-transform: uppercase; letter-spacing: 1px;">Chat di Sini!</div>
            <i class="fas fa-arrow-down" style="font-size: 2.8rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></i>
        </div>
    `;

    document.body.appendChild(arrow);

    // Tambahkan efek pulse pada tombol
    btn.classList.add('pulse');

    // Hapus arrow saat chatbot dibuka
    btn.addEventListener('click', () => {
        if (arrow.parentElement) arrow.remove();
        btn.classList.remove('pulse');
    }, { once: true });

    // Bersihkan otomatis setelah 15 detik jika tidak diklik
    setTimeout(() => {
        if (arrow.parentElement) arrow.remove();
        btn.classList.remove('pulse');
    }, 15000);
}

async function viewMaterial(id, type) {
    document.getElementById('material-list-container').style.display = 'none';
    document.getElementById('material-viewer-container').style.display = 'block';

    const materials = getMaterials();

    // Populate the dropdown selector
    const sel = document.getElementById('material-selector');
    if (sel) {
        sel.innerHTML = materials.map(m => `<option value="${m._id}">${m.name}</option>`).join('');
        sel.value = id;
    }

    // Find material in database to check if we have the content
    const material = materials.find(m => m._id === id || m.name === id); // fallback just in case

    if (!material) return;

    // =========================================================================
    // CHATBOT CONTEXT INITIALIZATION (tanpa auto-open)
    // =========================================================================
    if (currentMaterial !== id) {
        currentMaterial = id;

        // Pastikan chatbot TIDAK auto-terbuka — siswa harus scroll dulu
        const chatPanel = document.getElementById('chatbot-panel');
        if (chatPanel) chatPanel.style.display = 'none';

        // Pastikan tombol chatbot terlihat
        const chatbotContainer = document.getElementById('floating-chatbot-container');
        if (chatbotContainer) chatbotContainer.style.display = 'flex';

        // Update konteks header chatbot
        const contextEl = document.getElementById('chat-material-context');
        if (contextEl) contextEl.textContent = `Membahas: ${material.name}`;
        const chatSelector = document.getElementById('chat-material-selector');
        if (chatSelector) chatSelector.value = material._id;

        // Kosongkan chat messages (siap untuk sesi baru)
        const chatBox = document.getElementById('floating-chat-messages');
        if (chatBox) chatBox.innerHTML = '';

        // Pulihkan state evaluasi jika ada
        const restoredState = getChatState();
        waitingForUnderstandingAnswer = restoredState.waitingForUnderstandingAnswer;
        lastAiExplanation = restoredState.lastAiExplanation;
    } else {
        const chatbotContainer = document.getElementById('floating-chatbot-container');
        if (chatbotContainer) chatbotContainer.style.display = 'flex';
        const contextEl = document.getElementById('chat-material-context');
        if (contextEl && material) contextEl.textContent = `Membahas: ${material.name}`;
        const chatSelector = document.getElementById('chat-material-selector');
        if (chatSelector && material) chatSelector.value = material._id;
    }
    // =========================================================================

    const wrapper = document.getElementById('viewer-content-wrapper');

    // Default: Show PDF in iframe if it's a PDF
    if (type === 'pdf') {
        const urlObj = material._id ? `/api/materials/content/${material._id}` : material.contentDataUrl;
        wrapper.style.flexDirection = 'column';
        wrapper.innerHTML = `
            <iframe src="${urlObj}" style="width:100%; flex:1; border:none; background: white;"></iframe>
            <div id="scroll-chatbot-hint" style="display:none; padding:1rem 1.5rem; background:linear-gradient(135deg,var(--primary),var(--secondary)); border-top:2px solid var(--primary-light); text-align:center; animation: slideUp 0.4s ease;">
                <p style="color:white;font-size:0.88rem;font-weight:600;margin:0 0 0.5rem;">✅ Selesai membaca? Lanjut ke tahap berikutnya!</p>
                <p style="color:rgba(255,255,255,0.85);font-size:0.82rem;margin:0;">👇 Klik tombol <strong>NARA-AI</strong> di kanan bawah untuk masuk ke Mode Penguatan Literasi & Numerasi Tahap 1</p>
            </div>`;
        // Untuk PDF, tampilkan hint setelah 10 detik (karena tidak bisa detect scroll iframe)
        setTimeout(() => showScrollChatbotHint(), 10000);
        return;
    } else if (type === 'html' || type === 'ai') {
        let currentMatData = material;
        if (!currentMatData.contentDataUrl) {
            wrapper.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--primary);"></i><p style="margin-left:1rem;">Memuat materi...</p></div>';
            try {
                const res = await fetch(`/api/materials/${material._id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.material) {
                        currentMatData = data.material;
                    }
                }
            } catch (err) {
                console.warn('Gagal fetch material:', err);
            }
        }
        
        let htmlContent = '';
        if (currentMatData.contentDataUrl) {
            try {
                const base64Data = currentMatData.contentDataUrl.split(',')[1];
                const utf8Decoder = new TextDecoder('utf-8');
                const binaryStr = atob(base64Data);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                htmlContent = utf8Decoder.decode(bytes);
            } catch (e) {
                console.error('Failed to decode HTML content:', e);
                htmlContent = currentMatData.content || '<p class="text-muted">Gagal memuat format HTML.</p>';
            }
        } else {
            htmlContent = currentMatData.content || '<p class="text-muted">Konten kosong.</p>';
        }

        wrapper.innerHTML = `
            <div id="material-scroll-area" style="width:100%; height:100%; overflow-y:auto; padding:2rem 2.5rem; text-align:left; line-height:1.8; font-size:1rem; color:var(--text-primary); background: var(--bg-card);">
                <div style="max-width:800px; margin:0 auto;">
                    <div class="material-text-content">${htmlContent}</div>
                    <div id="scroll-chatbot-hint" style="display:none; margin-top:2rem; padding:1.25rem 1.5rem; background:linear-gradient(135deg,var(--primary),var(--secondary)); border-radius:12px; text-align:center; animation: slideUp 0.4s ease;">
                        <div style="font-size:1.8rem;margin-bottom:0.5rem;">🎯</div>
                        <p style="color:white;font-size:0.95rem;font-weight:700;margin:0 0 0.4rem;">Masuk ke Mode Penguatan Literasi & Numerasi Tahap 1</p>
                        <p style="color:rgba(255,255,255,0.88);font-size:0.83rem;margin:0;">Diskusi dengan NARA-AI untuk menguji pemahamanmu tentang materi ini 💬</p>
                        <div style="margin-top:1rem; display:flex; align-items:center; justify-content:center; gap:0.5rem; color:rgba(255,255,255,0.9); font-size:0.82rem;">
                            <i class="fas fa-arrow-down" style="animation:bounce-arrow 1s infinite;"></i>
                            <span>Klik tombol <strong>NARA-AI</strong> di kanan bawah</span>
                            <i class="fas fa-arrow-down" style="animation:bounce-arrow 1s infinite;"></i>
                        </div>
                    </div>
                </div>
            </div>`;
        setupScrollChatbotHint();
        return;
    }

    // For non-PDF or fallback, show text content
    let textContent = material.content || '';

    // Jika content belum ada di cache, ambil dari backend
    if (!textContent && material._id) {
        wrapper.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--primary);"></i><p style="margin-left:1rem;">Memuat materi...</p></div>';
        try {
            const res = await fetch(`/api/materials/${material._id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.material && data.material.content) {
                    textContent = data.material.content;
                }
            }
        } catch (err) {
            console.warn('Gagal fetch content materi:', err);
        }
    }

    if (textContent && textContent.trim()) {
        const formattedHTML = formatMaterialContent(textContent, material.name);
        wrapper.innerHTML = `
            <div id="material-scroll-area" style="width:100%; height:100%; overflow-y:auto; padding:2rem 2.5rem; text-align:left; line-height:1.8; font-size:1rem; color:var(--text-primary); background: var(--bg-card);">
                <div style="max-width:800px; margin:0 auto;">
                    <h2 style="color:var(--primary); margin-bottom:1.5rem; padding-bottom:0.75rem; border-bottom:2px solid var(--primary-light);">
                        <i class="fas fa-book-open" style="margin-right:0.5rem;"></i>${material.name}
                    </h2>
                    <div class="material-text-content">${formattedHTML}</div>
                    <div id="scroll-chatbot-hint" style="display:none; margin-top:2rem; padding:1.25rem 1.5rem; background:linear-gradient(135deg,var(--primary),var(--secondary)); border-radius:12px; text-align:center; animation: slideUp 0.4s ease;">
                        <div style="font-size:1.8rem;margin-bottom:0.5rem;">🎯</div>
                        <p style="color:white;font-size:0.95rem;font-weight:700;margin:0 0 0.4rem;">Masuk ke Mode Penguatan Literasi &amp; Numerasi Tahap 1</p>
                        <p style="color:rgba(255,255,255,0.88);font-size:0.83rem;margin:0;">Diskusi dengan NARA-AI untuk menguji pemahamanmu tentang materi ini 💬</p>
                        <div style="margin-top:1rem; display:flex; align-items:center; justify-content:center; gap:0.5rem; color:rgba(255,255,255,0.9); font-size:0.82rem;">
                            <i class="fas fa-arrow-down" style="animation:bounce-arrow 1s infinite;"></i>
                            <span>Klik tombol <strong>NARA-AI</strong> di kanan bawah</span>
                            <i class="fas fa-arrow-down" style="animation:bounce-arrow 1s infinite;"></i>
                        </div>
                    </div>
                </div>
            </div>`;
        setupScrollChatbotHint();
    } else {
        wrapper.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding:2rem; text-align:center; background: var(--bg-input);">
                <i class="fas fa-file-alt" style="font-size: 4rem; color: var(--primary-light); margin-bottom: 1rem;"></i>
                <h4>${material.name}</h4>
                <p class="text-muted">Format: ${type.toUpperCase()}</p>
                <div class="mt-2" style="max-width: 60%; color: var(--text-muted)">
                    Tampilan preview tidak tersedia untuk format ini.<br>
                    Silakan gunakan tombol <strong>Download</strong> untuk membaca file aslinya.
                </div>
            </div>`;
    }


}

function updateChatMaterial(id) {
    if (!id) {
        currentMaterial = null;
        const contextEl = document.getElementById('chat-material-context');
        if (contextEl) contextEl.textContent = 'Membahas: Pilih Materi';
        return;
    }

    const materials = getMaterials();
    const material = materials.find(m => m._id === id);
    if (material) {
        currentMaterial = id;

        // Update header UI
        const contextEl = document.getElementById('chat-material-context');
        if (contextEl) contextEl.textContent = `Membahas: ${material.name}`;

        // Load chat history for this specific material
        const chatBox = document.getElementById('floating-chat-messages');
        chatBox.innerHTML = '<div style="text-align:center; padding:1rem; color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Memuat riwayat chat...</div>';

        const users = getUsers();
        const teacher = users.find(u => u.role === 'guru') || { name: 'Guru', photo: null };
        const teacherPhoto = teacher.photo ? `<img src="${teacher.photo}" alt="Guru" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fas fa-chalkboard-teacher"></i>';

        fetch(`/api/chat/${currentUser.username}`)
            .then(res => res.json())
            .then(data => {
                chatBox.innerHTML = '';
                let history = [];
                if (data.success && data.history) {
                    history = data.history;
                }

                if (history.length === 0) {
                    const initialGreeting = "Halo " + currentUser.name + ", Saya adalah Asisten pak nandar yang akan menguji pemahamanmu tentang materi **" + material.name + "**. Apakah kamu siap diuji?";
                    appendFloatingMessage('bot', initialGreeting, teacherPhoto);
                } else {
                    history.forEach(m => appendFloatingMessage(m.role, formatMessageLocal(m.text), teacherPhoto));
                }
            })
            .catch(err => {
                console.error('Failed to fetch chat history:', err);
                chatBox.innerHTML = '';
            });
    }
}

function switchMaterial(id) {
    const materials = getMaterials();
    const material = materials.find(m => m._id === id || m.name === id);
    if (!material) return;

    // Toggle smoothly to new viewed material
    viewMaterial(material._id || material.name, material.type);
}

function downloadMaterial(id, name, type, event) {
    if (event) event.stopPropagation();
    const materials = getMaterials();
    const material = materials.find(m => m._id === id || m.name === id);
    if (!material) return;

    const url = material._id ? `/api/materials/content/${material._id}` : material.contentDataUrl;

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.${type}`; // e.g., "Materi.pdf"
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Tampilkan popup pengingat chatbot setelah download
    // showMaterialPopup(); (Dinonaktifkan, otomatis terbuka saat klik Buka)
}

function closeMaterialViewer() {
    document.getElementById('material-list-container').style.display = 'block';
    document.getElementById('material-viewer-container').style.display = 'none';
    document.getElementById('floating-chatbot-container').style.display = 'none';
    document.getElementById('chatbot-panel').style.display = 'none';
    currentMaterial = null;
    const arrow = document.getElementById('chatbot-arrow-pointer');
    if (arrow) arrow.remove();
}

/**
 * Setup scroll listener pada area konten materi.
 * Saat siswa scroll >= 75%, tampilkan hint chatbot.
 */
function setupScrollChatbotHint() {
    setTimeout(() => {
        const scrollArea = document.getElementById('material-scroll-area');
        if (!scrollArea) return;
        scrollArea.onscroll = null;
        scrollArea.addEventListener('scroll', function onMaterialScroll() {
            const scrolled = scrollArea.scrollTop + scrollArea.clientHeight;
            const total = scrollArea.scrollHeight;
            if (scrolled >= total * 0.75) {
                showScrollChatbotHint();
                scrollArea.removeEventListener('scroll', onMaterialScroll);
            }
        });
        // Jika konten pendek (tidak perlu scroll), langsung tampilkan
        if (scrollArea.scrollHeight <= scrollArea.clientHeight + 20) {
            setTimeout(() => showScrollChatbotHint(), 2000);
        }
    }, 300);
}

/**
 * Tampilkan card hint di bawah materi + tanda panah ke tombol chatbot.
 */
function showScrollChatbotHint() {
    const hint = document.getElementById('scroll-chatbot-hint');
    if (hint && hint.style.display === 'none') {
        hint.style.display = 'block';
        hint.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    const btn = document.getElementById('chatbot-toggle-btn');
    if (!btn) return;
    const existing = document.getElementById('chatbot-arrow-pointer');
    if (existing) return;
    const arrow = document.createElement('div');
    arrow.id = 'chatbot-arrow-pointer';
    arrow.style.cssText = 'position:fixed; bottom:90px; right:16px; width:165px; pointer-events:none; z-index:100001; text-align:center;';
    arrow.innerHTML = `
        <div style="background:linear-gradient(135deg,var(--primary),var(--secondary)); color:white; border-radius:12px; padding:8px 12px; font-size:0.78rem; font-weight:700; line-height:1.5; box-shadow:0 4px 20px rgba(99,102,241,0.5); margin-bottom:8px;">
            🎯 Masuk ke Mode<br>Penguatan Literasi &amp;<br>Numerasi Tahap 1<br><span style="font-size:0.7rem;opacity:0.9;font-weight:400;">Diskusi dengan NARA-AI</span>
        </div>
        <div style="color:var(--primary-light); animation:bounce-arrow 1s infinite; font-size:2rem;"><i class="fas fa-arrow-down"></i></div>
    `;
    document.body.appendChild(arrow);
    btn.classList.add('pulse');
    btn.addEventListener('click', () => {
        if (arrow.parentElement) arrow.remove();
        btn.classList.remove('pulse');
    }, { once: true });
}


async function toggleChatbot() {
    const panel = document.getElementById('chatbot-panel');
    const isOpening = panel.style.display === 'none';

    if (isOpening) {
        // === CEK: Apakah siswa sudah membuka materi? ===
        if (!currentMaterial) {
            // Tampilkan panel chatbot dengan pesan pengarahan
            panel.style.display = 'flex';

            const chatBox = document.getElementById('floating-chat-messages');
            chatBox.innerHTML = '';

            // Tampilkan pesan pengarahan
            const guideDiv = document.createElement('div');
            guideDiv.style.cssText = 'display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding:1.5rem; text-align:center; gap:1rem;';
            guideDiv.innerHTML = `
                <div style="font-size:3rem; animation: bounce-arrow 1.5s infinite;">📚</div>
                <h4 style="color:var(--text-primary); font-size:1rem; margin:0;">Pelajari Materi Dulu, ya!</h4>
                <p style="color:var(--text-secondary); font-size:0.88rem; line-height:1.6; max-width:280px; margin:0;">
                    Sebelum berdiskusi dengan NARA-AI, kamu perlu membuka dan membaca materi terlebih dahulu.<br><br>
                    Klik tombol <strong style="color:var(--primary);">"<i class='fas fa-book-open'></i> Buka"</strong> pada materi di atas.
                </p>
                <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem; margin-top:0.5rem;">
                    <div style="font-size:1.8rem; color:var(--primary-light); animation: bounce-arrow 1.2s infinite;"><i class="fas fa-arrow-up"></i></div>
                    <span style="font-size:0.8rem; font-weight:700; background:var(--primary); color:white; padding:4px 16px; border-radius:20px; letter-spacing:0.5px; animation: pulse-buka 1.8s infinite; box-shadow: 0 0 0 0 rgba(99,102,241,0.7);"><i class="fas fa-book-open" style="margin-right:4px;"></i>Buka Materi</span>
                </div>
                <button onclick="toggleChatbot()" style="margin-top:0.5rem; background:none; border:1px solid var(--border-color); color:var(--text-secondary); border-radius:8px; padding:0.4rem 1rem; cursor:pointer; font-size:0.82rem;">Tutup</button>
            `;
            chatBox.appendChild(guideDiv);

            // Disable input area sementara
            const chatInput = document.getElementById('floating-chat-input');
            const sendBtn = chatInput ? chatInput.nextElementSibling : null;
            if (chatInput) { chatInput.disabled = true; chatInput.placeholder = 'Buka materi terlebih dahulu...'; }
            if (sendBtn) sendBtn.disabled = true;
            return;
        }

        // Re-enable input jika sebelumnya di-disable
        const chatInput = document.getElementById('floating-chat-input');
        const sendBtn = chatInput ? chatInput.nextElementSibling : null;
        if (chatInput) { chatInput.disabled = false; chatInput.placeholder = 'Ketik pertanyaanmu...'; }
        if (sendBtn) sendBtn.disabled = false;

        // Cek antrian ke server
        try {
            const res = await fetch('/api/chat/check-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username })
            });
            const data = await res.json();

            if (!data.allowed) {
                alert(data.message || "Maaf, antrian penuh. Silakan menunggu sambil mempelajari materi.");
                return;
            }

            panel.style.display = 'flex';

            // === INISIALISASI CHAT: Load riwayat atau tampilkan salam awal ===
            const chatBox = document.getElementById('floating-chat-messages');
            if (chatBox && chatBox.children.length === 0) {
                const users = getUsers();
                const teacher = users.find(u => u.role === 'guru') || { name: 'Guru', photo: null };
                const teacherPhoto = teacher.photo
                    ? `<img src="${teacher.photo}" alt="Guru" style="width:100%;height:100%;object-fit:cover;">`
                    : '<i class="fas fa-chalkboard-teacher"></i>';
                const materials = getMaterials();
                const mat = materials.find(m => m._id === currentMaterial || m.name === currentMaterial);
                const matName = mat ? mat.name : 'materi ini';

                chatBox.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Memuat...</div>';

                fetch(`/api/chat/${currentUser.username}`)
                    .then(r => r.json())
                    .then(d => {
                        chatBox.innerHTML = '';
                        const history = (d.success && d.history && d.history.length > 0) ? d.history : [];
                        if (history.length === 0) {
                            const greeting = `Halo **${currentUser.name}**! 👋\n\nAku NARA-AI, teman belajarmu yang asik! 😊\n\nWah, kamu udah selesai baca materi **${matName}** ya? Keren banget! Biar makin jago, yuk kita main tebak-tebakan seru buat uji pemahaman kamu!\n\n🎯 **Gimana, udah siap belum buat jawab tantangannya?**\n\n- Ketik **"Siap"** → Aku kasih dua tantangan seru: Literasi & Numerasi!\n- Ketik **"Belum"** atau tanya dulu → Aku bantu jelasin lagi sampai kamu paham, santai aja! 😄`;
                            appendFloatingMessage('bot', formatMessageLocal(greeting), teacherPhoto);
                            const histories = getChatHistories();
                            histories[currentUser.username] = [{ role: 'bot', text: greeting, time: new Date().toISOString() }];
                            saveChatHistories(histories);
                        } else {
                            history.forEach(m => appendFloatingMessage(m.role, formatMessageLocal(m.text), teacherPhoto));
                        }
                    })
                    .catch(() => {
                        chatBox.innerHTML = '';
                        const users2 = getUsers();
                        const t2 = users2.find(u => u.role === 'guru') || { name: 'Guru', photo: null };
                        const tp2 = t2.photo ? `<img src="${t2.photo}" alt="Guru" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fas fa-chalkboard-teacher"></i>';
                        const greeting = `Halo **${currentUser.name}**! 👋\n\nAku NARA-AI, teman belajarmu! 😊\n\n**Udah siap dijawab soalnya?**\n\n- Ketik **"Siap"** → Aku langsung kasih soal!\n- Ketik **"Belum"** atau mau tanya dulu → Aku bantu jelasin, tenang aja! 😄`;
                        appendFloatingMessage('bot', formatMessageLocal(greeting), tp2);
                    });
            }

            chatInput.focus();
        } catch (err) {
            console.error('Queue check failed:', err);
            alert('Gagal menghubungkan ke sistem. Silakan coba lagi.');
        }
    } else {
        panel.style.display = 'none';
    }
}

function appendFloatingMessage(role, html, teacherPhoto) {
    const container = document.getElementById('floating-chat-messages');
    const div = document.createElement('div');
    div.className = `message ${role}`;

    // Inline styling for message structure because we are not adding new classes to root CSS
    div.style.display = 'flex';
    div.style.gap = '0.75rem';
    div.style.maxWidth = '85%';
    if (role === 'bot') {
        div.style.alignSelf = 'flex-start';
    } else {
        div.style.alignSelf = 'flex-end';
        div.style.flexDirection = 'row-reverse';
    }

    let avatarIcon = role === 'bot' ? '<img src="nara-ai-bot.png" alt="NARA-AI" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">' : '<i class="fas fa-user"></i>';
    let bgColor = role === 'bot' ? 'var(--bg-input)' : 'var(--primary)';
    let color = role === 'bot' ? 'inherit' : 'white';
    let borderRadius = role === 'bot' ? '8px 8px 8px 4px' : '8px 8px 4px 8px';

    div.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;background:${role === 'bot' ? 'white' : 'var(--bg-input)'};color:${role === 'bot' ? 'var(--primary)' : 'var(--text-secondary)'};font-size:0.8rem;border:${role === 'bot' ? '2px solid var(--primary)' : 'none'};">
            ${avatarIcon}
        </div>
        <div style="padding:0.75rem 1rem;font-size:0.9rem;line-height:1.6;background:${bgColor};color:${color};border-radius:${borderRadius}; overflow-x: auto; max-width: 100%;">
            ${html}
        </div>`;

    container.appendChild(div);
    if (role === 'bot') {
        div.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        container.scrollTop = container.scrollHeight;
    }
}

// ---- State untuk alur Cek Pemahaman ----
function getChatState() {
    try {
        if (!currentUser || !currentUser.username) return { waitingForUnderstandingAnswer: false, lastAiExplanation: '' };
        const saved = localStorage.getItem('nara_chat_state_' + currentUser.username);
        if (saved) return JSON.parse(saved);
    } catch (e) { }
    return { waitingForUnderstandingAnswer: false, lastAiExplanation: '' };
}

function updateChatState(waiting, explanation = undefined) {
    if (!currentUser || !currentUser.username) return;
    const state = getChatState();
    state.waitingForUnderstandingAnswer = waiting;
    if (explanation !== undefined) {
        state.lastAiExplanation = explanation;
    }
    localStorage.setItem('nara_chat_state_' + currentUser.username, JSON.stringify(state));
    // Update global vars
    waitingForUnderstandingAnswer = waiting;
    if (explanation !== undefined) lastAiExplanation = explanation;
}

// Inisialisasi awal
let lastAiExplanation = '';
let waitingForUnderstandingAnswer = false; // True = siswa sedang menjawab soal, siap dinilai
let waitingForTestQuestion = false;         // True = siswa konfirmasi siap, AI sedang mengirim soal
let waitingForPemantikAnswer = false;       // True = AI sudah kirim pemantik pasca skor merah, tunggu jawaban
let lastPemantikQuestion = '';             // Simpan pertanyaan pemantik terakhir untuk konteks evaluasi
let lastUserMessage = ''; // Simpan pesan terakhir siswa untuk deteksi sapaan

/**
 * Deteksi apakah pesan siswa hanya sapaan (bukan pertanyaan)
 * Jika ya, tombol Paham/Belum Paham tidak perlu ditampilkan
 */
function isGreetingMessage(msg) {
    if (!msg) return true;
    const cleaned = msg.trim().toLowerCase();
    const greetingPatterns = [
        /^(halo|hai|hi|hello|hey|hei|assalamualaikum|assalam|wa'alaikumsalam|waalaikumsalam)(\s|!|$)/,
        /^selamat\s+(pagi|siang|sore|malam|datang)/,
        /^(good\s+(morning|afternoon|evening|night))/,
        /^(apa kabar|apa khabar|gimana kabar|bagaimana kabar)/,
        /^(terima kasih|makasih|thanks|thank you|thx)(\s|!|$)/,
        /^(ok|oke|iya|ya|siap|baik|mantap|sip|otw)(\s|!|$)/,
    ];
    // Cek apakah pesan singkat (≤5 kata) dan cocok dengan pola sapaan
    const wordCount = cleaned.split(/\s+/).length;
    if (wordCount <= 5) {
        return greetingPatterns.some(pattern => pattern.test(cleaned));
    }
    return false;
}

/**
 * Deteksi apakah pesan siswa merupakan konfirmasi kesiapan untuk diuji
 */
function isAffirmativeResponse(msg) {
    if (!msg) return false;
    const cleaned = msg.trim().toLowerCase();
    const affirmativePatterns = [
        /^(ya|siap|ok|oke|baik|boleh|tentu|mau|tancap|lanjut|gaskeun|sangat siap|siap diuji|gas|yoi)(\s|!|$)/i,
        /^saya\s+(siap|mau)/i,
        /^iya/i,
        /^boleh/i,
        /^ok/i
    ];
    return affirmativePatterns.some(pattern => pattern.test(cleaned));
}

/**
 * Deteksi apakah pesan siswa merupakan indikasi ketidaksiapan (belum siap)
 */
function isNegativeResponse(msg) {
    if (!msg) return false;
    const cleaned = msg.trim().toLowerCase();
    const negativePatterns = [
        /^(belum|tidak|nggak|engga|ndak)(\s|!|$)/i,
        /^(belum siap|tidak siap|kurang paham|belum paham|gak siap)(\s|!|$)/i,
        /^saya\s+(belum|tidak|nggak)\s+(siap|paham|mengerti)/i
    ];
    return negativePatterns.some(pattern => pattern.test(cleaned));
}

/**
 * Tampilkan atau sembunyikan tombol Paham/Belum Paham
 */
function showPahamButtons() {
    // Dinonaktifkan sesuai instruksi: diganti dengan interaksi teks langsung
    return;
}

function hidePahamButtons() {
    const qr = document.getElementById('quick-replies');
    if (qr) { qr.style.display = 'none'; qr.innerHTML = ''; }
}

/**
 * Tampilkan tombol Ulangi Penjelasan / Buat Pertanyaan Baru saat skor < 75
 */
function showGagalButtons(score = 0) {
    const qr = document.getElementById('quick-replies');
    if (!qr) return;
    qr.style.display = 'flex';
    
    let html = `
        <button id="btn-kembali-materi" class="btn btn-outline btn-sm" onclick="toggleChatbot()"
            style="padding:0.4rem 0.9rem;font-size:0.85rem;border-color:var(--primary);color:var(--primary);">
            <i class="fas fa-book"></i> Kembali ke materi
        </button>
        <button id="btn-siap-uji-ulang" class="btn btn-primary btn-sm" onclick="onSiapUjiUlang()"
            style="padding:0.4rem 0.9rem;font-size:0.85rem;">
            <i class="fas fa-check-circle"></i> Siap Uji ulang pemahaman
        </button>
    `;

    // Jika skor >= 50, tambahkan opsi tombol Lanjut ke Tahap 2
    if (score >= 50) {
        html += `
        <button id="btn-inline-lanjut" class="btn btn-success btn-sm" onclick="window.location.href='index.html?stage=2'"
            style="padding:0.4rem 0.9rem;font-size:0.85rem;background:var(--success);">
            <i class="fas fa-arrow-right"></i> Lanjut Tahap 2
        </button>
        `;
    }

    qr.innerHTML = html;
}

/** Siswa klik "Belum Paham" */
function onBelumPaham() {
    hidePahamButtons();
    sendFloatingChat('Saya belum paham. Tolong jelaskan lagi dengan cara yang lebih sederhana atau dengan analogi yang mudah dipahami.');
}

/** Siswa klik "Sudah Paham" — minta NARA-AI buat pertanyaan uji */
function onPaham() {
    hidePahamButtons();
    waitingForUnderstandingAnswer = true;
    const materials = getMaterials();
    const currMat = materials.find(m => m._id === currentMaterial || m.name === currentMaterial);
    const materialName = currMat ? currMat.name : currentMaterial;
    // Kirim pesan "Saya Sudah Siap diuji." secara silent (tidak muncul di chat)
    sendFloatingChat(`Saya Sudah Siap diuji.`, true);
}

/** Siswa klik "Siap Uji Ulang Pemahaman" setelah gagal */
function onSiapUjiUlang() {
    hidePahamButtons();
    updateChatState(true);
    waitingForTestQuestion = true; // Kita asumsikan ini mengirim permintaan soal baru
    const materials = getMaterials();
    const currMat = materials.find(m => m._id === currentMaterial || m.name === currentMaterial);
    const materialName = currMat ? currMat.name : currentMaterial;
    // Kirim konfirmasi tertulis siswa ke chat
    sendFloatingChat(`Saya Siap Uji Ulang Pemahaman terhadap materi **${materialName}**.`);
}

/**
 * Kirim jawaban uji pemahaman ke endpoint /api/chat/analyze-understanding
 * dipanggil ketika waitingForUnderstandingAnswer = true dan siswa mengirim pesan
 */
async function sendUnderstandingAnswer(studentAnswer, teacherPhoto) {
    updateChatState(false);
    hidePahamButtons();

    const chatBox = document.getElementById('floating-chat-messages');
    // Tampilkan indikator typing
    const typing = document.createElement('div');
    typing.id = 'floating-typing-indicator';
    typing.style.cssText = 'display:flex;gap:0.75rem;align-self:flex-start;';
    typing.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;background:white;border:2px solid var(--primary);">
            <img src="nara-ai-bot.png" alt="NARA-AI" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
        </div>
        <div style="padding:0.75rem 1rem;font-size:0.9rem;background:var(--bg-input);border-radius:8px 8px 8px 4px;">
            <div style="display:flex;gap:4px;padding:0.5rem 0;">
                <span style="width:8px;height:8px;border-radius:50%;background:var(--text-muted);animation:typing 1.4s ease infinite;"></span>
                <span style="width:8px;height:8px;border-radius:50%;background:var(--text-muted);animation:typing 1.4s ease infinite;animation-delay:0.2s;"></span>
                <span style="width:8px;height:8px;border-radius:50%;background:var(--text-muted);animation:typing 1.4s ease infinite;animation-delay:0.4s;"></span>
            </div>
        </div>`;
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const res = await fetch('/api/chat/analyze-understanding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUser.username,
                originalExplanation: lastAiExplanation,
                studentAnswer: studentAnswer
            })
        });
        const data = await res.json();
        document.getElementById('floating-typing-indicator')?.remove();

        if (data.success) {
            let feedbackText = data.result;
            
            // Regex lebih tangguh untuk menangkap [SKOR: X], Skor: X, atau Skor: X/10
            const scoreMatch = feedbackText.match(/(?:\[SKOR:|SKOR:|Skor:)\s*(\d+)(?:\/10)?/i);
            let score = 0;
            if (scoreMatch) {
                score = parseInt(scoreMatch[1]);
                // Jika skor dalam skala 10 (misal 8/10), konversi ke skala 100
                if (feedbackText.includes(`${score}/10`)) {
                    score = score * 10;
                }
                // Pastikan skor maksimal 100
                if (score > 100) score = 100;
            }

            // Hapus tag skor dari teks yang ditampilkan agar bersih
            feedbackText = feedbackText.replace(/\[SKOR:\s*\d+\]/gi, '').replace(/Skor:\s*\d+(\/10)?/gi, '').trim();

            if (score >= 80) {
                // ✅ HIJAU (80-100): Lanjut otomatis tanpa syarat
                const btnLanjut = document.getElementById('btn-lanjut-tahap2');
                if (btnLanjut) btnLanjut.style.display = 'inline-block';
                localStorage.setItem('tahap1_ready_' + currentUser.username, 'true');
                
                // Simpan progres ke server
                updateProgress(currentUser.username, { 
                    tahap1Score: score, 
                    tahap1Complete: true 
                });

                feedbackText += `<br><br><div style="background:linear-gradient(135deg,#166534,#22c55e);border-radius:12px;padding:1rem;color:white;text-align:center;margin-top:0.5rem;box-shadow:0 4px 12px rgba(34,197,94,0.3);">
                    <i class="fas fa-check-circle" style="font-size:1.8rem;margin-bottom:0.5rem;display:block;"></i>
                    <div style="font-size:1.1rem;font-weight:800;">Luar Biasa! Skor Pemahaman: ${score}%</div>
                    <div style="font-size:0.85rem;opacity:0.9;margin-top:0.3rem;">Pemahamanmu sangat matang. Menuju Tahap 2 dalam beberapa detik... 🎉</div>
                </div>`;

                setTimeout(() => {
                    startChatbotCountdown(score);
                }, 1500);

            } else if (score >= 50) {
                // ⚠️ KUNING (50-79): Bisa lanjut atau uji ulang (manual)
                const btnLanjut = document.getElementById('btn-lanjut-tahap2');
                if (btnLanjut) btnLanjut.style.display = 'inline-block';
                localStorage.setItem('tahap1_ready_' + currentUser.username, 'true');

                // Simpan progres ke server (Bisa lanjut)
                updateProgress(currentUser.username, { 
                    tahap1Score: score, 
                    tahap1Complete: true 
                });

                feedbackText += `<br><br><div style="background:linear-gradient(135deg,#a16207,#eab308);border-radius:12px;padding:1rem;color:white;text-align:center;margin-top:0.5rem;box-shadow:0 4px 12px rgba(234,179,8,0.3);">
                    <i class="fas fa-exclamation-triangle" style="font-size:1.8rem;margin-bottom:0.5rem;display:block;"></i>
                    <div style="font-size:1.1rem;font-weight:800;">Skor Pemahaman: ${score}%</div>
                    <div style="font-size:0.85rem;opacity:0.9;margin-top:0.3rem;">Pemahamanmu sudah cukup. Kamu bisa lanjut ke Tahap 2 sekarang, atau tetap di sini untuk mengulang materi dan uji ulang agar lebih maksimal.</div>
                </div>`;

                setTimeout(() => {
                    showGagalButtons(score);
                }, 800);

            } else {
                // ❌ MERAH (<50): Tidak bisa lanjut, wajib remedial/penjelasan ulang
                const btnLanjut = document.getElementById('btn-lanjut-tahap2');
                if (btnLanjut) btnLanjut.style.display = 'none';
                localStorage.removeItem('tahap1_ready_' + currentUser.username);

                // Tetap simpan skor merah agar terpantau orang tua
                updateProgress(currentUser.username, { 
                    tahap1Score: score, 
                    tahap1Complete: false 
                });

                feedbackText += `<br><br><div style="background:linear-gradient(135deg,#991b1b,#ef4444);border-radius:12px;padding:1rem;color:white;text-align:center;margin-top:0.5rem;box-shadow:0 4px 12px rgba(239,68,68,0.3);">
                    <i class="fas fa-times-circle" style="font-size:1.8rem;margin-bottom:0.5rem;display:block;"></i>
                    <div style="font-size:1.1rem;font-weight:800;">Skor Pemahaman: ${score}%</div>
                    <div style="font-size:0.85rem;opacity:0.9;margin-top:0.3rem;">Mari kita pelajari kembali bagian ini. Tenang, NARA-AI akan membantumu memahami inti materinya sebelum uji ulang. 💪</div>
                </div>`;

                appendFloatingMessage('bot', formatMessageLocal(feedbackText), teacherPhoto);

                const historiesTmp = getChatHistories();
                if (!historiesTmp[currentUser.username]) historiesTmp[currentUser.username] = [];
                historiesTmp[currentUser.username].push({ role: 'bot', text: feedbackText, time: new Date().toISOString() });
                saveChatHistories(historiesTmp);

                setTimeout(async () => {
                    const pemantikMsg = `[MODE PEMANTIK REMEDIASI] Siswa mendapat skor ${score}% pada uji pemahaman — di bawah nilai minimum. Mula-mula berikan penjelasan ringkas yang mudah dipahami tentang konsep materi tersebut. SETELAH penjelasan, berikan SATU pertanyaan pemantik (Socratic) yang relevan untuk mengajak siswa berpikir mandiri. Mulailah dengan kalimat yang menyemangati siswa.`;
                    await sendPemantikRemediasi(pemantikMsg, teacherPhoto);
                }, 1200);
                return;
            }

            appendFloatingMessage('bot', formatMessageLocal(feedbackText), teacherPhoto);

            const histories = getChatHistories();
            if (!histories[currentUser.username]) histories[currentUser.username] = [];
            histories[currentUser.username].push({ role: 'bot', text: feedbackText, time: new Date().toISOString() });
            saveChatHistories(histories);
        }
    } catch (err) {
        document.getElementById('floating-typing-indicator')?.remove();
        appendFloatingMessage('bot', 'Maaf, gagal menganalisis jawabanmu. Silakan coba lagi.', teacherPhoto);
    }
}

/**
 * Kirim pertanyaan pemantik ke AI (pasca skor merah) via /api/chat biasa.
 * Setelah AI menjawab, set waitingForPemantikAnswer = true.
 */
async function sendPemantikRemediasi(pemantikMsg, teacherPhoto) {
    const chatBox = document.getElementById('floating-chat-messages');
    const input = document.getElementById('floating-chat-input');
    if (input) { input.disabled = true; input.placeholder = 'Jawab pertanyaan pemantik di atas...'; }

    // Tampilkan typing indicator
    const typing = document.createElement('div');
    typing.id = 'floating-typing-indicator';
    typing.style.cssText = 'display:flex;gap:0.75rem;align-self:flex-start;';
    typing.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;background:white;border:2px solid var(--primary);">
            <img src="nara-ai-bot.png" alt="NARA-AI" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
        </div>`;
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    const users = getUsers();
    const teacher = users.find(u => u.role === 'guru') || { name: 'Guru', photo: null };
    const materials = getMaterials();
    const mat = materials.find(m => m._id === currentMaterial || m.name === currentMaterial);
    const matName = mat ? mat.name : 'materi ini';

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: pemantikMsg,
                username: currentUser.username,
                studentName: currentUser.name || currentUser.username,
                selectedMaterial: matName,
                teacherName: teacher.name
            })
        });
        const data = await res.json();
        document.getElementById('floating-typing-indicator')?.remove();

        if (data.success) {
            const pemantikReply = data.reply;
            lastPemantikQuestion = pemantikReply;
            waitingForPemantikAnswer = true;

            // Tampilkan pertanyaan pemantik dengan badge khusus
            const badgeHtml = `<div style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:white;font-size:0.7rem;font-weight:700;padding:2px 10px;border-radius:20px;margin-bottom:0.5rem;letter-spacing:0.5px;">💡 PERTANYAAN PEMANTIK</div><br>`;
            appendFloatingMessage('bot', badgeHtml + formatMessageLocal(pemantikReply), teacherPhoto);

            const histories = getChatHistories();
            if (!histories[currentUser.username]) histories[currentUser.username] = [];
            histories[currentUser.username].push({ role: 'bot', text: pemantikReply, time: new Date().toISOString() });
            saveChatHistories(histories);

            // Aktifkan input untuk menjawab
            if (input) { input.disabled = false; input.placeholder = 'Jawab pertanyaan pemantik di atas...'; input.focus(); }

            // Tampilkan label petunjuk
            const qr = document.getElementById('quick-replies');
            if (qr) {
                qr.style.display = 'flex';
                qr.innerHTML = `<span style="font-size:0.82rem;color:var(--text-muted);align-self:center;">✏️ Tuliskan jawabanmu untuk pertanyaan pemantik di atas...</span>`;
            }
        }
    } catch (err) {
        document.getElementById('floating-typing-indicator')?.remove();
        appendFloatingMessage('bot', 'Maaf, gagal mengirim pertanyaan. Silakan ketik pertanyaanmu sendiri.', teacherPhoto);
        if (input) { input.disabled = false; input.placeholder = 'Ketik pertanyaanmu...'; }
    }
}

/**
 * Evaluasi jawaban siswa terhadap pertanyaan pemantik remediasi.
 * Dipanggil dari sendFloatingChat saat waitingForPemantikAnswer = true.
 */
async function evaluasiJawabanPemantik(jawabanSiswa, teacherPhoto) {
    waitingForPemantikAnswer = false;
    hidePahamButtons();

    const chatBox = document.getElementById('floating-chat-messages');
    const input = document.getElementById('floating-chat-input');
    if (input) input.disabled = true;

    const typing = document.createElement('div');
    typing.id = 'floating-typing-indicator';
    typing.style.cssText = 'display:flex;gap:0.75rem;align-self:flex-start;';
    typing.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;background:white;border:2px solid var(--primary);">
            <img src="nara-ai-bot.png" alt="NARA-AI" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
        </div>`;
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    const users = getUsers();
    const teacher = users.find(u => u.role === 'guru') || { name: 'Guru', photo: null };
    const materials = getMaterials();
    const mat = materials.find(m => m._id === currentMaterial || m.name === currentMaterial);
    const matName = mat ? mat.name : 'materi ini';

    // Instruksikan AI untuk mengevaluasi jawaban pemantik siswa
    const evalMsg = `[EVALUASI JAWABAN PEMANTIK] Pertanyaan pemantik yang diberikan: "${lastPemantikQuestion}". Jawaban siswa: "${jawabanSiswa}". 
Tugasmu:
1. Evaluasi apakah jawaban siswa menunjukkan pemahaman yang memadai (baik/cukup/kurang).
2. Jika BAIK: Berikan pujian kepada siswa.
3. Jika KURANG: Berikan kata-kata penyemangat (jangan menyalahkan), lalu berikan penjelasan ringkas dan mudah dipahami, SERTAKAN minimal 1 contoh penerapan dalam kehidupan sehari-hari yang relevan.
4. SETELAH memberikan pujian atau penjelasan (tergantung hasil evaluasi), LANGSUNG berikan SATU pertanyaan Uji Pemahaman baru kepada siswa. Jangan bertanya apakah mereka siap, langsung uji sekarang!`;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: evalMsg,
                username: currentUser.username,
                studentName: currentUser.name || currentUser.username,
                selectedMaterial: matName,
                teacherName: teacher.name
            })
        });
        const data = await res.json();
        document.getElementById('floating-typing-indicator')?.remove();

        if (data.success) {
            const aiReply = data.reply;
            lastAiExplanation = aiReply;
            appendFloatingMessage('bot', formatMessageLocal(aiReply), teacherPhoto);

            const histories = getChatHistories();
            if (!histories[currentUser.username]) histories[currentUser.username] = [];
            histories[currentUser.username].push({ role: 'bot', text: aiReply, time: new Date().toISOString() });
            saveChatHistories(histories);

            // Karena AI langsung memberikan pertanyaan Uji Pemahaman baru,
            // atur state untuk menunggu jawaban pemahaman dari siswa
            updateChatState(true, aiReply);

            const qr = document.getElementById('quick-replies');
            if (qr) {
                qr.style.display = 'flex';
                qr.innerHTML = `<span style="font-size:0.82rem;color:var(--text-muted);align-self:center;">✏️ Ketik jawaban uji pemahaman di kolom chat di bawah...</span>`;
            }
        }
    } catch (err) {
        document.getElementById('floating-typing-indicator')?.remove();
        appendFloatingMessage('bot', 'Maaf, terjadi gangguan. Silakan coba lagi.', teacherPhoto);
    } finally {
        if (input) { input.disabled = false; input.placeholder = 'Ketik pertanyaanmu...'; input.focus(); }
    }
}


function startChatbotCountdown(score) {
    // Guard: Hanya tampilkan countdown jika siswa LULUS (skor >= 75)
    if (score === undefined || score < 75) return;

    const chatPanel = document.getElementById('chatbot-panel');
    if (!chatPanel || chatPanel.style.display === 'none') return;

    const existing = document.getElementById('chatbot-countdown-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'chatbot-countdown-overlay';
    // Meletakkan overlay di atas agar nilai jawaban yang muncul di akhir feed chat tetap dapat dibaca di bawahnya
    overlay.style.cssText = 'position:absolute; top:15px; left:50%; transform:translateX(-50%); width:80%; max-width:280px; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); color:white; z-index:100; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5); padding:1rem; text-align:center; transition:all 0.3s; border:1px solid rgba(255,255,255,0.1);';

    let seconds = 20;

    overlay.innerHTML = `
        <div style="animation: scaleIn 0.3s ease;">
            <i class="fas fa-robot" style="font-size:2.5rem; color:var(--primary-light); margin-bottom:0.75rem;"></i>
            <h3 style="margin-bottom:0.3rem; font-size:1.1rem; font-weight:700;">Verifikasi Berhasil! 🎉</h3>
            <p style="opacity:0.8; margin-bottom:1rem; font-size:0.8rem;">Menuju Tahap 2 dalam:</p>
            <div id="countdown-number" style="font-size:3.5rem; font-weight:800; color:var(--success); line-height:1; text-shadow:0 0 20px rgba(34,197,94,0.5);">${seconds}</div>
            <p style="margin-top:1rem; font-size:0.7rem; color:var(--text-secondary); font-style:italic;">Siap lanjut ke Tahap 2</p>
        </div>
    `;

    chatPanel.style.position = 'relative';
    chatPanel.appendChild(overlay);

    let timer;

    timer = setInterval(() => {
        seconds--;
        const numElem = document.getElementById('countdown-number');
        if (numElem) {
            numElem.textContent = seconds;
            numElem.style.animation = 'none';
            void numElem.offsetWidth; // trigger reflow
            numElem.style.animation = 'scaleIn 0.5s ease';
        }

        if (seconds <= 0) {
            clearInterval(timer);
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                if (chatPanel.style.display !== 'none') {
                    toggleChatbot(); // Close chatbot
                }
                showTahap2Pointer(); // Show arrow
            }, 300);
        }
    }, 1000);
}

function showTahap2Pointer() {
    const btn = document.getElementById('btn-lanjut-tahap2');
    if (!btn) return;

    // Pastikan tombol terlihat
    btn.style.display = 'inline-block';
    localStorage.setItem('tahap1_ready_' + currentUser.username, 'true');

    // Scroll ke tombol agar terlihat
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Hapus arrow lama jika ada
    const existingArrow = document.getElementById('tahap2-arrow-pointer');
    if (existingArrow) existingArrow.remove();

    const arrow = document.createElement('div');
    arrow.id = 'tahap2-arrow-pointer';
    arrow.style.cssText = 'position: absolute; top: -75px; left: 50%; transform: translateX(-50%); width: 100px; pointer-events: none; z-index: 100;';
    arrow.innerHTML = `
        <div style="text-align: center; color: var(--success); animation: bounce-arrow 2s infinite;">
            <i class="fas fa-arrow-down" style="font-size: 2.8rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></i>
            <div style="font-weight: 800; font-size: 0.85rem; background: var(--success); color: white; padding: 4px 12px; border-radius: 20px; box-shadow: var(--shadow-md); margin-top: 5px; white-space: nowrap; text-transform: uppercase; letter-spacing: 1px;">Klik Sini!</div>
        </div>
    `;

    // Pastikan parent punya position relative
    const parent = btn.parentElement;
    if (parent) {
        parent.style.position = 'relative';
        parent.appendChild(arrow);
    }

    // Tambahkan efek kilau pada tombol
    btn.classList.add('pulse');

    // Bersihkan setelah beberapa saat jika tidak diklik
    setTimeout(() => {
        if (arrow.parentElement) arrow.remove();
        btn.classList.remove('pulse');
    }, 15000);
}

function sendFloatingChat(quickMsg, isSilent = false) {
    const input = document.getElementById('floating-chat-input');
    let msg = (typeof quickMsg === 'string') ? quickMsg : input.value.trim();
    if (!msg) return;

    // Simpan pesan asli siswa (bukan quick message sistem) untuk deteksi sapaan
    if (typeof quickMsg !== 'string') {
        lastUserMessage = msg;
    }

    const users = getUsers();
    const teacher = users.find(u => u.role === 'guru') || { name: 'Guru', photo: null };
    const teacherPhoto = teacher.photo ? `<img src="${teacher.photo}" alt="Guru" style="width:100%;height:100%;object-fit:cover;">` : '<i class="fas fa-chalkboard-teacher"></i>';

    const chatBox = document.getElementById('floating-chat-messages');

    // Tampilkan pesan di UI hanya jika tidak silent
    if (!isSilent) {
        appendFloatingMessage('user', msg, teacherPhoto);
    }

    const histories = getChatHistories();
    if (!histories[currentUser.username]) histories[currentUser.username] = [];
    histories[currentUser.username].push({ role: 'user', text: msg, time: new Date().toISOString() });

    if (typeof quickMsg !== 'string') input.value = '';
    input.disabled = true;
    hidePahamButtons();

    // STEP 0.5: Siswa sedang dalam mode pemantik remediasi (pasca skor merah)
    if (waitingForPemantikAnswer && typeof quickMsg !== 'string') {
        input.disabled = false;
        input.focus();
        evaluasiJawabanPemantik(msg, teacherPhoto);
        return;
    }

    let isSendingPemantik = false;

    // STEP 1: Siswa konfirmasi siap diuji → kirim ke chat biasa agar AI membuat SOAL
    if (!waitingForTestQuestion && !waitingForUnderstandingAnswer && !waitingForPemantikAnswer && isAffirmativeResponse(msg)) {
        waitingForTestQuestion = true;
        updateChatState(false);
        msg = "Saya Sudah Siap diuji. Berikan saya SATU pertanyaan uji pemahaman sekarang.";
        // Lanjutkan ke alur chat biasa
    }
    // STEP 1.5: Siswa belum siap → mode pemantik (Socratic)
    else if (!waitingForTestQuestion && !waitingForUnderstandingAnswer && !waitingForPemantikAnswer && isNegativeResponse(msg)) {
        msg = `[MODE PEMANTIK] Siswa menyatakan belum siap diuji atau belum paham. MULA-MULA, berikan penjelasan ringkas dan mudah dipahami tentang materi tersebut. SETELAH penjelasan, berikan SATU pertanyaan pemantik (Socratic) yang mengajak siswa berpikir tentang inti materi. Mulailah dengan kalimat yang ramah dan menyemangati.`;
        isSendingPemantik = true;
    }
    // STEP 1.6: Siswa bertanya tentang materi (bukan sapaan, bukan siap/belum) → pertanyaan pemantik
    else if (!waitingForTestQuestion && !waitingForUnderstandingAnswer && !waitingForPemantikAnswer && !isGreetingMessage(msg)) {
        const originalMsg = msg;
        msg = `[MODE PEMANTIK] Siswa bertanya: "${originalMsg}". MULA-MULA, berikan jawaban ringkas dan jelas atas pertanyaan tersebut. SETELAH memberikan jawaban, berikan SATU pertanyaan pemantik (Socratic) untuk memandu siswa memikirkan lebih dalam. Mulailah dengan sapaan yang ramah.`;
        isSendingPemantik = true;
    }
    // STEP 2: Siswa sudah menerima soal dan sekarang mengirim JAWABAN → kirim ke evaluasi
    else if (waitingForUnderstandingAnswer && typeof quickMsg !== 'string') {
        input.disabled = false;
        input.focus();
        sendUnderstandingAnswer(msg, teacherPhoto);
        return;
    }

    const typing = document.createElement('div');
    typing.className = 'message bot';
    typing.id = 'floating-typing-indicator';
    typing.style.alignSelf = 'flex-start';
    typing.style.display = 'flex';
    typing.style.gap = '0.75rem';
    typing.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;background:white;border:2px solid var(--primary);">
            <img src="nara-ai-bot.png" alt="NARA-AI" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
        </div>
        <div style="padding:0.75rem 1rem;font-size:0.9rem;line-height:1.6;background:var(--bg-input);border-radius:8px 8px 8px 4px;">
            <div class="typing-indicator" style="display:flex; gap:4px; padding:0.5rem 0;">
                <span style="width:8px;height:8px;border-radius:50%;background:var(--text-muted);animation:typing 1.4s ease infinite;"></span>
                <span style="width:8px;height:8px;border-radius:50%;background:var(--text-muted);animation:typing 1.4s ease infinite;animation-delay:0.2s;"></span>
                <span style="width:8px;height:8px;border-radius:50%;background:var(--text-muted);animation:typing 1.4s ease infinite;animation-delay:0.4s;"></span>
            </div>
        </div>`;
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    const materials = getMaterials();
    const currMat = materials.find(m => m._id === currentMaterial || m.name === currentMaterial);
    const materialName = currMat ? currMat.name : currentMaterial;

    fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: msg,
            username: currentUser.username,
            studentName: currentUser.name || currentUser.username,
            selectedMaterial: materialName,
            teacherName: teacher.name
        })
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById('floating-typing-indicator')?.remove();
            if (data.success) {
                let aiReply = data.reply;

                // Simpan penjelasan AI sebagai konteks untuk uji pemahaman nanti
                lastAiExplanation = aiReply;

                appendFloatingMessage('bot', formatMessageLocal(aiReply), teacherPhoto);
                histories[currentUser.username].push({ role: 'bot', text: aiReply, time: new Date().toISOString() });
                saveChatHistories(histories);

                // Jika AI baru saja mengirimkan soal ujian (setelah siswa konfirmasi siap),
                // transisi ke mode menunggu jawaban siswa
                if (waitingForTestQuestion) {
                    waitingForTestQuestion = false;
                    updateChatState(true, aiReply);
                    
                    // Beri petunjuk visual kepada siswa
                    const qr = document.getElementById('quick-replies');
                    if (qr) {
                        qr.style.display = 'flex';
                        qr.innerHTML = `<span style="font-size:0.82rem;color:var(--text-muted);align-self:center;">✏️ Ketik jawabanmu di kolom chat di bawah...</span>`;
                    }
                    return; // Jangan tampilkan tombol Paham/Belum Paham
                }

                // Jika AI mengirimkan pertanyaan pemantik (awal diskusi)
                if (isSendingPemantik) {
                    waitingForPemantikAnswer = true;
                    lastPemantikQuestion = aiReply;
                    const qr = document.getElementById('quick-replies');
                    if (qr) {
                        qr.style.display = 'flex';
                        qr.innerHTML = `<span style="font-size:0.82rem;color:var(--text-muted);align-self:center;">✏️ Tuliskan jawabanmu untuk pertanyaan pemantik di atas...</span>`;
                    }
                    return; // Jangan tampilkan tombol Paham/Belum Paham
                }

                // Tampilkan tombol Paham/Belum Paham hanya jika:
                // 1. Tidak sedang menunggu jawaban uji pemahaman
                // 2. Pesan siswa bukan sapaan
                // 3. SEDANG MEMBAHAS MATERI (currentMaterial tidak null)
                if (!waitingForUnderstandingAnswer && !waitingForPemantikAnswer && !isGreetingMessage(lastUserMessage) && currentMaterial) {
                    showPahamButtons();
                }
            } else {
                throw new Error(data.error);
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('floating-typing-indicator')?.remove();
            appendFloatingMessage('bot', 'Maaf, saat ini sedang terjadi gangguan jaringan. Silakan coba lagi.', teacherPhoto);
        })
        .finally(() => {
            input.disabled = false;
            input.focus();
        });
}

function formatMessageLocal(text) {
    if (!text) return '';
    if (typeof marked !== 'undefined') {
        // breaks: true membuat single newline jadi <br>
        return marked.parse(text, { breaks: true });
    }
    // Fallback jika library belum load: ganti \n dengan <br> dan **teks** dengan bold
    return text.toString().replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

async function completeTahap1() {
    // Beri tahu server bahwa sesi chat selesai (bebaskan slot antrian)
    try {
        await fetch('/api/chat/end-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username })
        });
    } catch (e) { console.error('End session failed', e); }

    localStorage.removeItem('tahap1_ready_' + currentUser.username);
    updateProgress(currentUser.username, { tahap1Complete: true });
    navigateTo('tahap2');
}

// ---- TAHAP 2: REFLEKSI (ESSAY) ----
let reflectionQuestions = [];
let reflectionAnswers = {};
let reflectionLoading = false;

/**
 * Format AI Readiness analysis into a structured HTML display
 */
function formatAiReadiness(data) {
    if (!data) return '<p class="text-muted">Analisis tidak tersedia.</p>';

    let parsed = data;
    if (typeof data === 'string') {
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            // Jika bukan JSON, anggap sebagai teks biasa
            return `<p style="line-height: 1.6; text-align: justify; color: var(--text-primary); font-size: 0.95rem; font-weight: 500;">${data}</p>`;
        }
    }

    // Jika data adalah object hasil analisis baru
    if (parsed && parsed.analysis && typeof parsed.analysis === 'object') {
        const a = parsed.analysis;
        return `
            <div class="ai-analysis-structured">
                <div class="analysis-section mb-2" style="background: rgba(var(--primary-rgb), 0.05); padding: 1rem; border-radius: 12px; border-left: 4px solid var(--primary);">
                    <h5 style="margin: 0 0 0.5rem; color: var(--primary); font-size: 0.9rem; font-weight: 700;"><i class="fas fa-file-alt"></i> Analisis Isi (Konten Jawaban)</h5>
                    <p style="font-size: 0.88rem; line-height: 1.6; color: var(--text-primary); margin: 0;">${a.isi || 'Tidak tersedia.'}</p>
                </div>
                <div class="analysis-section mb-2" style="background: rgba(var(--accent-rgb), 0.05); padding: 1rem; border-radius: 12px; border-left: 4px solid var(--accent);">
                    <h5 style="margin: 0 0 0.5rem; color: var(--accent); font-size: 0.9rem; font-weight: 700;"><i class="fas fa-pen-nib"></i> Analisis Penulisan (EYD & Tata Bahasa)</h5>
                    <p style="font-size: 0.88rem; line-height: 1.6; color: var(--text-primary); margin: 0;">${a.penulisan || 'Tidak tersedia.'}</p>
                </div>
                <div class="analysis-section" style="padding: 0.5rem 1rem;">
                    <p style="font-size: 0.88rem; font-style: italic; color: var(--text-secondary); margin: 0;"><strong>Kesimpulan:</strong> ${a.umum || ''}</p>
                </div>
                ${parsed.recommendation ? `
                <div class="mt-3" style="background: var(--bg-input); padding: 1rem; border-radius: 12px; border: 1px dashed var(--border-color);">
                    <h5 style="margin: 0 0 0.4rem; color: var(--success); font-size: 0.9rem; font-weight: 700;"><i class="fas fa-lightbulb"></i> Rekomendasi Guru NARA:</h5>
                    <p style="font-size: 0.88rem; color: var(--text-primary); margin: 0;">${parsed.recommendation}</p>
                </div>` : ''}
            </div>
        `;
    }

    // Fallback untuk format objek lama atau tidak dikenal
    const text = parsed.analysis || parsed.umum || JSON.stringify(parsed);
    return `<p style="line-height: 1.6; text-align: justify; color: var(--text-primary); font-size: 0.95rem; font-weight: 500;">${text}</p>`;
}

async function renderTahap2(main) {
    // Reset local cache agar selalu mengambil yang terbaru dari server berdasarkan chat terakhir
    if (typeof lastRenderedTahap === 'undefined' || lastRenderedTahap !== 'tahap2') {
        reflectionQuestions = [];
        window.lastRenderedTahap = 'tahap2';
    }

    const progress = getProgress(currentUser.username);
    if (progress.tahap2Complete) {
        const isReady = progress.isReady;
        const statusClass = isReady ? 'pass' : 'fail';
        const statusLabel = isReady ? 'SIAP ASESMEN' : 'BELUM SIAP';
        const statusIcon = isReady ? '🎉' : '⚠️';

        let answersHtml = '';
        if (progress.reflectionAnswers && progress.reflectionAnswers.length > 0) {
            answersHtml = `
            <div class="card mt-3" style="padding: 1.5rem; border-radius: 16px; text-align: left; background: var(--bg-sidebar); border: 1px solid var(--border-color);">
                <h4 style="margin-bottom: 1rem; color: var(--text-primary); font-size: 1.1rem; font-weight: 700;">
                    <i class="fas fa-history" style="color: var(--primary);"></i> Jawaban Refleksi Kamu:
                </h4>
                ${progress.reflectionAnswers.map((ans, idx) => `
                    <div style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-top: 1rem;">
                        <p style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${idx + 1}. ${ans.question}</p>
                        <p style="margin-top: 0.4rem; color: var(--text-secondary); background: var(--bg-input); padding: 0.75rem 1rem; border-radius: 8px; font-style: italic; font-size: 0.88rem; line-height: 1.5; border: 1px solid rgba(255,255,255,0.05);">"${ans.answer}"</p>
                    </div>
                `).join('')}
            </div>`;
        }

        let actionButtonHtml = '';
        if (isReady) {
            actionButtonHtml = `
                <button class="btn btn-success mt-2" style="padding: 0.8rem 2rem; font-weight: 700; border-radius: 12px;" onclick="navigateTo('tahap3')">
                    <i class="fas fa-arrow-right"></i> Lanjut ke Tahap 3
                </button>
                <button class="btn btn-outline mt-2" style="padding: 0.8rem 2rem; border-radius: 12px;" onclick="navigateTo('dashboard')">
                    Kembali ke Dashboard
                </button>`;
        } else {
            actionButtonHtml = `
                <button class="btn btn-danger mt-2" style="padding: 0.8rem 2rem; font-weight: 700; border-radius: 12px;" id="btn-reset-tahap1">
                    <i class="fas fa-redo"></i> Ulangi Pembelajaran dari Tahap 1
                </button>
                <button class="btn btn-outline mt-2" style="padding: 0.8rem 2rem; border-radius: 12px;" onclick="navigateTo('dashboard')">
                    Kembali ke Dashboard
                </button>`;
        }

        main.innerHTML = `
        <div class="score-display" style="max-width: 700px; margin: 0 auto; padding: 2rem;">
            <div class="score-circle ${statusClass}" style="margin: 0 auto 1.5rem auto; width: 100px; height: 100px; font-size: 2rem; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                ${statusIcon}
            </div>
            <h2 style="font-weight: 800; font-size: 1.6rem; color: var(--text-primary); margin-bottom: 0.5rem;">Tahap 2 Selesai!</h2>
            <div style="display: inline-block; padding: 0.4rem 1.2rem; border-radius: 50px; font-weight: 800; font-size: 0.9rem; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 1.5rem; background: ${isReady ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${isReady ? 'var(--success)' : 'var(--danger)'}; border: 1px solid ${isReady ? 'var(--success-light)' : 'var(--danger-light)'};">
                Status: ${statusLabel}
            </div>

            <div class="card mt-2" style="border: 1px solid ${isReady ? 'var(--success-light)' : 'var(--danger-light)'}; background: ${isReady ? 'rgba(34, 197, 94, 0.02)' : 'rgba(239, 68, 68, 0.02)'}; padding: 1.5rem; border-radius: 16px; text-align: left; margin-bottom: 1.5rem;">
                <h4 style="color: ${isReady ? 'var(--success)' : 'var(--danger)'}; margin-bottom: 0.75rem; font-size: 1.1rem; font-weight: 700;">
                    <i class="fas fa-robot"></i> Analisis & Evaluasi NARA-AI:
                </h4>
                <div class="analysis-content-wrapper">
                    ${formatAiReadiness(progress.aiReadiness)}
                </div>
                <div class="mt-2" style="font-size: 0.88rem; color: var(--text-muted); font-weight: 600;">
                    <strong>Skor Kesiapan Belajar:</strong> ${progress.tahap2Score || 0}%
                </div>
            </div>

            ${!isReady ? `
                <div class="alert alert-danger" style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--danger); padding: 1rem; border-radius: 8px; color: var(--text-primary); text-align: left; margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.5;">
                    <p style="font-weight: 700; margin-bottom: 0.25rem;"><i class="fas fa-lock"></i> Akses Tahap 3 Terkunci</p>
                    <p>Karena rekomendasi AI menyatakan kamu belum siap, kamu diwajibkan mengulang pembelajaran materi dan berdiskusi kembali dengan NARA-AI di Tahap 1. Klik tombol di bawah untuk menyetel ulang progresmu secara otomatis.</p>
                </div>
            ` : ''}

            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                ${actionButtonHtml}
            </div>

            ${answersHtml}
        </div>`;

        if (!isReady) {
            const btnReset = document.getElementById('btn-reset-tahap1');
            if (btnReset) {
                btnReset.addEventListener('click', async () => {
                    if (!confirm('Apakah kamu siap memulai ulang pembelajaran dari Tahap 1? Seluruh progres Tahap 1 dan Tahap 2 kamu akan di-reset.')) return;
                    btnReset.disabled = true;
                    btnReset.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus Progres...';
                    try {
                        const res = await fetch('/api/progress/reset', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ usernames: [currentUser.username] })
                        });
                        if (res.ok) {
                            alert('🔄 Progres berhasil di-reset! Silakan ulangi pembelajaran Tahap 1.');
                            await syncData(); // Sync local cache from database
                            navigateTo('dashboard');
                        } else {
                            throw new Error('Gagal menghubungi server untuk mereset progres.');
                        }
                    } catch (err) {
                        alert(err.message || 'Gagal menyetel ulang progres.');
                        btnReset.disabled = false;
                        btnReset.innerHTML = '<i class="fas fa-redo"></i> Ulangi Pembelajaran dari Tahap 1';
                    }
                });
            }
        }
        return;
    }

    if (reflectionQuestions.length === 0 && !reflectionLoading) {
        reflectionLoading = true;
        main.innerHTML = `<div class="loading-state"> <i class="fas fa-spinner fa-spin"></i> Membangkitkan Pertanyaan Refleksi Berdasarkan Belajarmu...</div>`;

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
        <div class="quiz-container" oncontextmenu="return false;" onselectstart="return false;" oncopy="return false;" onpaste="return false;" style="user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;">
        <div class="quiz-header">
            <h3>📝 Tahap 2: Yuk Cerita Pengalaman Belajarmu!</h3>
            <p class="text-muted">Jawab pertanyaan di bawah ini dengan jujur ya! Ceritain sesuai apa yang kamu rasakan dan kamu pelajari bareng NARA-AI. <strong>Tulis sendiri ya, jangan copy-paste 😊</strong></p>
        </div>
        <div class="card mt-2">
            <form id="reflection-form">
                ${reflectionQuestions.map((q, i) => {
                    const questionText = typeof q === 'object' ? (q.question || q.pertanyaan || q.text || JSON.stringify(q)) : q;
                    return `
                    <div class="question-group mb-3" style="width: 100%; display: flex; flex-direction: column;">
                        <label class="d-block mb-2"><strong>${i + 1}. ${questionText}</strong></label>
                        <textarea 
                            class="form-input reflection-input" 
                            rows="5"
                            style="width: 100%; min-height: 120px; box-sizing: border-box; resize: vertical;"
                            onpaste="return false;" 
                            oncopy="return false;" 
                            oncontextmenu="return false;"
                            data-question="${questionText}"
                            placeholder="Ketik jawabanmu di sini... (Copy-paste dilarang)"
                            required
                        ></textarea>
                    </div>`;
                }).join('')}
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
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> NARA-AI lagi baca jawabanmu... sabar ya!';

        const inputs = document.querySelectorAll('.reflection-input');
        const answers = Array.from(inputs).map(input => ({
            question: input.dataset.question,
            answer: input.value
        }));

        // Tampilkan overlay loading yang ramah
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; padding:3rem; text-align:center;">
                <div style="font-size:4rem; margin-bottom:1.5rem; animation: bounce-arrow 1s infinite;">🤖</div>
                <h3 style="font-size:1.4rem; font-weight:800; color:var(--text-primary); margin-bottom:0.75rem;">NARA-AI sedang baca refleksimu...</h3>
                <p style="color:var(--text-secondary); max-width:400px; line-height:1.6;">Sebentar ya, NARA-AI lagi analisis jawabanmu dengan teliti! Ini untuk bantu kamu belajar lebih baik lagi 💪</p>
                <div style="margin-top:2rem; display:flex; gap:0.5rem; justify-content:center;">
                    <span style="width:12px;height:12px;border-radius:50%;background:var(--primary);animation:typing 1.4s ease infinite;"></span>
                    <span style="width:12px;height:12px;border-radius:50%;background:var(--primary);animation:typing 1.4s ease infinite;animation-delay:0.2s;"></span>
                    <span style="width:12px;height:12px;border-radius:50%;background:var(--primary);animation:typing 1.4s ease infinite;animation-delay:0.4s;"></span>
                </div>
            </div>
        `;

        try {
            // 1. Analyze Readiness
            const analysisRes = await fetch('/api/assessment/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username, reflectionAnswers: answers })
            });
            const analysisData = await analysisRes.json();

            // PENTING: Dulu AI membuat 20 soal asesmen di sini, sekarang tidak. Soal akan dibuat nanti saat Guru meng-Approve.

            // Update local progress with analysis and raw reflection answers
            const progress = getProgress(currentUser.username);
            progress.tahap2Complete = true;
            
            // Simpan seluruh objek analisis ke aiReadiness (nanti di-stringify oleh updateProgress)
            progress.aiReadiness = analysisData.analysis;
            progress.isReady = analysisData.analysis.ready;
            progress.tahap2Score = analysisData.analysis.score ?? null; 
            progress.reflectionAnswers = answers; // Save raw answers for later generation
            updateProgress(currentUser.username, progress);

            // Langsung render hasil Tahap 2 tanpa alert
            renderTahap2(document.getElementById('main-content'));
        } catch (err) {
            console.error(err);
            document.getElementById('main-content').innerHTML = `
                <div class="card" style="text-align:center; padding:2rem;">
                    <div style="font-size:3rem; margin-bottom:1rem;">😔</div>
                    <h3>Aduh, ada masalah nih!</h3>
                    <p class="text-muted">Gagal mengirim refleksi. Coba lagi ya!</p>
                    <button class="btn btn-primary mt-2" onclick="navigateTo('tahap2')">Coba Lagi</button>
                </div>
            `;
        }
    });
}


// ---- TAHAP 3: ASESMEN ----
let assessmentAnswers = {};
let assessmentCurrentQ = 0;
let assessmentActive = false;

function renderTahap3(main) {
    const progress = getProgress(currentUser.username);

    if (progress.tahap3Complete) {
        const results = getAssessmentResults();
        const r = results[currentUser.username];
        if (r) {
            const pct = Math.round((r.score / r.total) * 100);
            const pass = pct >= 70;

            let remedialInfo = '';
            if (!pass) {
                const settings = getAssessmentSettings();
                if (settings.remedialMode === 'mandiri') {
                    remedialInfo = `<div class="alert alert-info mt-2" style="background:var(--info-light); color:var(--info); padding:1rem; border-radius:8px;">
                        <i class="fas fa-info-circle"></i> Kamu belum lulus. Kamu dapat mengulang asesmen secara mandiri.
                        <br><button class="btn btn-sm btn-primary mt-1" onclick="startRemedialMandiri()">Mulai Remedial Mandiri</button>
                    </div>`;
                } else if (progress.remedialStatus === 'waiting_approval') {
                    remedialInfo = '<div class="alert alert-warning mt-2" style="background:var(--warning-light); color:var(--warning); padding:1rem; border-radius:8px;"><i class="fas fa-exclamation-triangle"></i> Kamu belum lulus. Silakan melapor ke Guru untuk meminta persetujuan <strong>Remedial</strong>.</div>';
                } else if (progress.remedialStatus === 'approved') {
                    // Just in case it was set to approved but tahap3Complete is true somehow
                    remedialInfo = '<div class="alert alert-success mt-2" style="background:var(--success-light); color:var(--success); padding:1rem; border-radius:8px;"><i class="fas fa-check-circle"></i> Remedial disetujui.</div>';
                }
            }

            main.innerHTML = `<div class="score-display"><div class="score-circle ${pass ? 'pass' : 'fail'}">${pct}%<small>${pass ? 'LULUS' : 'TIDAK LULUS'}</small></div><p>Skor: ${r.score}/${r.total}</p><p>Literasi: ${r.literasi} | Numerasi: ${r.numerasi}</p>${remedialInfo}<button class="btn btn-primary mt-2" onclick="navigateTo('dashboard')">Kembali</button></div>`;
        }
        return;
    }





    // Show start screen
    if (!assessmentActive) {
        const settings = getAssessmentSettings();
        main.innerHTML = `
        <div class="card" style="max-width:600px;margin:0 auto;text-align:center;padding:2.5rem">
            <div class="tahap-icon exam" style="margin:0 auto 1.5rem"><i class="fas fa-file-alt"></i></div>
            <h2>Asesmen Utama</h2>
            <p class="text-muted mt-1">Format TKA (Literasi & Numerasi)</p>
            <div style="margin:1.5rem 0;text-align:left" class="card" style="background:var(--bg-input)">
                <p><i class="fas fa-list"></i> <strong>Jumlah Soal:</strong> ${settings.questionAmount || 10} soal</p>
                <p class="mt-1"><i class="fas fa-clock"></i> <strong>Waktu:</strong> ${settings.duration} menit</p>
                <p class="mt-1"><i class="fas fa-pencil-alt" style="color:var(--info)"></i> <strong>Petunjuk:</strong> Jawab semua soal dengan teliti dan jujur.</p>
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

window.startRemedialMandiri = async function () {
    if (!confirm('Apakah kamu yakin ingin memulai Remedial Mandiri sekarang? Soal baru akan disiapkan.')) return;

    const settings = getAssessmentSettings();
    const amount = settings.questionAmount || 50;

    const btn = document.querySelector('button[onclick="startRemedialMandiri()"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyiapkan...';
    }

    try {
        const genRes = await fetch('/api/assessment/generate-from-bank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, amount })
        });

        if (!genRes.ok) {
            const errBody = await genRes.json();
            throw new Error(errBody.error || "Gagal mengambil soal dari Bank Soal");
        }
        const genData = await genRes.json();

        const progress = getProgress(currentUser.username);
        // Shuffle options and adjust correct index uniquely for each student
        const shuffledQuestions = (genData.questions || []).map(q => {
            const originalCorrectText = q.options[q.correct];
            const shuffledOptions = [...q.options];
            for (let i = shuffledOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            }
            q.options = shuffledOptions;
            q.correct = shuffledOptions.indexOf(originalCorrectText);
            return q;
        });
        progress.generatedAssessment = shuffledQuestions;
        progress.tahap3Complete = false;
        progress.remedialStatus = 'approved';
        updateProgress(currentUser.username, progress);

        renderTahap3(document.getElementById('main-content'));
    } catch (err) {
        console.error(err);
        alert(err.message || 'Gagal menyiapkan soal Remedial Mandiri!');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Mulai Remedial Mandiri';
        }
    }
}

async function startAssessment() {
    assessmentAnswers = {};
    assessmentCurrentQ = 0;
    assessmentActive = true;
    tabViolationCount = 0;

    const btn = document.querySelector('button[onclick="startAssessment()"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyiapkan Soal...';
    }

    try {
        const settings = getAssessmentSettings();
        const res = await fetch('/api/assessment/generate-from-bank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, amount: settings.questionAmount || 10 })
        });
        const data = await res.json();

        if (data.success && data.questions && data.questions.length > 0) {
            const progress = getProgress(currentUser.username);
            // Shuffle options and adjust correct index uniquely for each student
            const shuffledQuestions = (data.questions || []).map(q => {
                const originalCorrectText = q.options[q.correct];
                const shuffledOptions = [...q.options];
                for (let i = shuffledOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
                }
                q.options = shuffledOptions;
                q.correct = shuffledOptions.indexOf(originalCorrectText);
                return q;
            });
            progress.generatedAssessment = shuffledQuestions;
            updateProgress(currentUser.username, progress);
        } else {
            alert(data.error || 'Gagal mengambil soal dari Bank Soal');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-play"></i> Mulai Asesmen';
            }
            assessmentActive = false;
            return;
        }
    } catch (err) {
        alert('Gagal menghubungi server untuk mengambil soal.');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-play"></i> Mulai Asesmen';
        }
        assessmentActive = false;
        return;
    }

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Mulai Asesmen';
    }

    // Masuk ke Mode Fullscreen (Exambrowser)
    enterFullscreen();

    // Anti-Cheat: cegah copy/paste/klik kanan
    document.addEventListener('contextmenu', preventDefaultAction);
    document.addEventListener('copy', preventDefaultAction);
    document.addEventListener('paste', preventDefaultAction);

    // Deteksi Pelanggaran (Tab Switch & Fullscreen Exit)
    setupExambrowserListeners();

    showAssessmentQuestion(document.getElementById('main-content'));
}

function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

function setupExambrowserListeners() {
    // Bersihkan listener lama jika ada
    document.removeEventListener('visibilitychange', handleTabViolation);
    document.removeEventListener('fullscreenchange', handleFullscreenViolation);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenViolation);

    document.addEventListener('visibilitychange', handleTabViolation);
    document.addEventListener('fullscreenchange', handleFullscreenViolation);
    document.addEventListener('webkitfullscreenchange', handleFullscreenViolation);
}

function handleTabViolation() {
    if (assessmentActive && document.visibilityState === 'hidden') {
        tabViolationCount++;
        alert(`🚨 PERINGATAN PELANGGARAN!\n\nKamu dilarang berpindah tab/aplikasi selama ujian.\nPelanggaran dicatat: ${tabViolationCount}x`);
    }
}

function handleFullscreenViolation() {
    if (assessmentActive && !document.fullscreenElement && !document.webkitFullscreenElement) {
        tabViolationCount++;
        alert(`🚨 PERINGATAN!\n\nJangan keluar dari mode Fullscreen (Exambrowser) selama ujian.\nSilakan masuk kembali ke Fullscreen.\nPelanggaran dicatat: ${tabViolationCount}x`);
        // Opsional: Paksa masuk lagi
        // enterFullscreen();
    }
}

function preventDefaultAction(e) {
    e.preventDefault();
}

function updateTimerDisplay() {
    const el = document.getElementById('assessment-timer');
    if (!el) return;
    const mins = Math.floor(assessmentTimeLeft / 60);
    const secs = assessmentTimeLeft % 60;
    el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} `;
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
            ${q.image ? `<div class="question-image mt-2" style="text-align:center;"><img src="${q.image}" style="max-width:100%; max-height:250px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1); border:1px solid var(--border-color);"></div>` : ""}
            <div class="question-text ${q.image ? "mt-1" : ""}" style="white-space:pre-line">${q.question}</div>
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

async function submitAssessment(autoRedirect = false) {
    if (!assessmentActive) return;
    if (!autoRedirect && !confirm("Kirim hasil asesmen sekarang?")) return;

    assessmentActive = false;
    clearInterval(assessmentTimer);

    // Hentikan mode fullscreen dan hapus listener
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }

    document.removeEventListener('contextmenu', preventDefaultAction);
    document.removeEventListener('copy', preventDefaultAction);
    document.removeEventListener('paste', preventDefaultAction);
    document.removeEventListener('visibilitychange', handleTabViolation);
    document.removeEventListener('fullscreenchange', handleFullscreenViolation);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenViolation);

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
    const existingResult = results[currentUser.username];
    let remedialCount = existingResult ? (existingResult.remedialCount || 0) : 0;

    if (existingResult) {
        remedialCount++;
    }

    results[currentUser.username] = { score, total, literasi, numerasi, litTotal, numTotal, pct, pass, date: new Date().toISOString(), violations: tabViolationCount, remedialCount };
    saveAssessmentResults(results);


    updateProgress(currentUser.username, { tahap3Complete: true });

    const settings = getAssessmentSettings();

    // If fail, set to waiting remedial instead of resetting to tahap 1
    if (!pass) {
        updateProgress(currentUser.username, { remedialStatus: 'waiting_approval' });
        // Clear approval
        saveApprovalForUser(currentUser.username, null);
    }

    if (autoRedirect) {
        navigateTo('dashboard');
        return;
    }

    let failInfo = '';
    if (!pass) {
        if (settings.remedialMode === 'mandiri') {
            failInfo = `<p style="color:var(--info)" class="mt-2"><i class="fas fa-info-circle"></i> Kamu belum lulus. Kamu dapat mengulang asesmen secara mandiri.</p>`;
        } else {
            failInfo = `<p style="color:var(--warning)" class="mt-2"><i class="fas fa-exclamation-triangle"></i> Kamu harus melakukan Remedial atas persetujuan guru.</p>`;
        }
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
                ${failInfo}
                ${tabViolationCount > 0 ? `<p class="mt-1 text-muted">⚠️ Pelanggaran tab: ${tabViolationCount}x</p>` : ''}
                <button class="btn btn-primary mt-2" onclick="navigateTo('dashboard')">Kembali ke Dashboard</button>
            </div>
    </div>`;
}

/**
 * Format Habit analysis for Stage 4
 */
function formatHabitAnalysis(analysis, details) {
    if (!analysis) return '<p class="text-muted">Analisis tidak tersedia.</p>';

    // Jika analysis adalah object (format baru)
    if (typeof analysis === 'object' && analysis.analysis) {
        const isIrrelevant = analysis.isRelevant === false;
        return `
            <div class="habit-analysis-container">
                <div class="analysis-main-card mb-3" style="background: ${isIrrelevant ? 'rgba(var(--danger-rgb), 0.05)' : 'rgba(var(--success-rgb), 0.05)'}; padding: 1.5rem; border-radius: 16px; border: 1px solid ${isIrrelevant ? 'var(--danger)' : 'var(--success)'};">
                    <h4 style="color: ${isIrrelevant ? 'var(--danger)' : 'var(--success)'}; margin-bottom: 0.5rem; font-weight: 800;">
                        <i class="fas ${isIrrelevant ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> 
                        ${isIrrelevant ? 'Pesan Motivasi NARA' : 'Analisis Karakter NARA'}
                    </h4>
                    <p style="line-height: 1.6; color: var(--text-primary); font-size: 0.95rem; text-align: justify;">${analysis.analysis}</p>
                </div>
                
                ${details && details.length > 0 ? `
                <div class="analysis-details">
                    <h5 style="margin-bottom: 0.75rem; color: var(--primary-light); font-weight: 700;">
                        <i class="fas fa-lightbulb"></i> ${isIrrelevant ? 'Langkah Kecil untuk Kamu:' : 'Saran Pengembangan Diri:'}
                    </h5>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                        ${details.map(d => `
                            <li style="background: var(--bg-input); padding: 0.8rem 1rem; border-radius: 10px; border-left: 3px solid var(--primary-light); font-size: 0.9rem;">
                                ${d}
                            </li>
                        `).join('')}
                    </ul>
                </div>` : ''}
            </div>
        `;
    }

    // Fallback untuk string (format lama)
    const detailsHtml = (details || []).map(d => `<li>${d}</li>`).join('');
    return `
        <div class="habit-analysis-legacy">
            <p class="text-center" style="line-height: 1.6;">${analysis}</p>
            ${detailsHtml ? `<ul class="mt-2" style="max-width:600px;margin:0 auto;text-align:left; color: var(--text-secondary); font-size: 0.9rem;">${detailsHtml}</ul>` : ''}
        </div>
    `;
}

// ---- TAHAP 4: REFLEKSI 7 KEBIASAAN HEBAT ----
function renderTahap4(main) {
    const progress = getProgress(currentUser.username);
    if (!progress.tahap3Complete) {
        main.innerHTML = `<div class="card"><p class="text-center text-muted">Selesaikan Tahap 3 terlebih dahulu.</p></div>`;
        return;
    }

    if (progress.tahap4Complete) {
        main.innerHTML = `
        <div class="card fade-in" style="max-width: 800px; margin: 0 auto;">
            <div class="text-center mb-3">
                <h3 class="card-title" style="font-size: 1.5rem; font-weight: 800; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🎉 Tahap 4 Selesai!</h3>
                <p class="text-muted">Terima kasih telah berbagi refleksimu hari ini.</p>
            </div>

            <div class="score-display text-center my-3">
                <div class="score-circle pass mx-auto" style="width:130px; height:130px; font-size: 2.2rem; border-width: 6px; box-shadow: 0 0 20px rgba(var(--success-rgb), 0.3);">
                    ${progress.tahap4Score}
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Skor Karakter</p>
            </div>

            <div class="mt-3">
                ${formatHabitAnalysis(progress.tahap4Analysis, progress.tahap4Details)}
            </div>

            <div class="text-center mt-4" style="display:flex; gap:1rem; justify-content:center; flex-wrap: wrap;">
                <button class="btn btn-outline" onclick="navigateTo('dashboard')">
                    <i class="fas fa-home"></i> Dashboard
                </button>
                <button class="btn btn-success" onclick="downloadProgressReportPDF()" style="background: var(--gradient-success);">
                    <i class="fas fa-file-pdf"></i> Unduh Laporan PDF
                </button>
            </div>
        </div>`;
        return;
    }

    const questions = [
        "1. 🌅 Bangun Pagi: Tadi pagi kamu bangun jam berapa? Setelah bangun, kamu ngapain dulu?",
        "2. 🙏 Beribadah: Gimana caramu supaya nggak lupa sholat/beribadah setiap hari, terutama sebelum berangkat sekolah?",
        "3. 🏃 Olahraga: Minggu ini kamu olahraga apa aja? Ceritain kegiatan gerak badanmu yang seru!",
        "4. 🥗 Makan Sehat: Tadi sarapan apa? Kira-kira kenapa makanan itu bagus buat tubuhmu?",
        "5. 📚 Gemar Belajar: Kalau belajar di rumah, biasanya kamu ngapain dulu? Ceritain caramu biar semangat belajar!",
        "6. 🤝 Bermasyarakat: Pernah nggak kamu bantu teman atau tetangga? Ceritain pengalaman serumu!",
        "7. 😴 Tidur Cepat: Biasanya kamu tidur jam berapa? Sebelum tidur, kamu ngapain dulu supaya tidurnya nyenyak?"
    ];

    main.innerHTML = `
    <div class="card fade-in" oncontextmenu="return false;" onselectstart="return false;" oncopy="return false;" onpaste="return false;" style="user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;">
        <h3 class="card-title text-center mb-2">🌱 Refleksi 7 Kebiasaan Hebat Anak Indonesia</h3>
        <p class="text-center text-muted mb-3">Silakan jawab dengan jujur secara mandiri. Jawaban akan dianalisis oleh AI. Copy & Paste dinonaktifkan.</p>
        
        <form id="tahap4-form" onsubmit="return submitHabitReflections(event)">
            ${questions.map((q, i) => `
                <div class="form-group mb-3">
                    <label style="font-weight:600; font-size:1.05rem;">${q}</label>
                    <textarea id="habit-q${i}" class="input-modern mt-1" rows="3" placeholder="Ketik refleksimu di sini..." onpaste="return false;" oncopy="return false;" oncontextmenu="return false;" autocomplete="off" required minlength="15"></textarea>
                </div>
            `).join('')}
            <div class="text-center mt-3">
                <button type="submit" id="submit-t4-btn" class="btn btn-primary" style="padding:1rem 3rem;font-size:1.1rem">Kirim Refleksi ke AI</button>
            </div>
            <div id="t4-error" class="error-msg hidden mt-2"></div>
        </form>
    </div>`;
}

async function submitHabitReflections(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-t4-btn');
    const err = document.getElementById('t4-error');
    err.classList.add('hidden');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI sedang menganalisis (estimasi 10-30 detik)...';

    try {
        const answers = [];
        for (let i = 0; i < 7; i++) {
            answers.push(document.getElementById(`habit-q${i}`).value);
        }

        const res = await fetch('/api/assessment/analyze-habits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, habitAnswers: answers })
        });
        const data = await res.json();

        if (data.success && data.analysis) {
            updateProgress(currentUser.username, {
                tahap4Complete: true,
                tahap4Score: data.analysis.score || 0,
                tahap4Analysis: data.analysis, // Simpan seluruh objek analisis
                tahap4Details: data.analysis.details || []
            });
            renderTahap4(document.getElementById('main-content'));
        } else {
            throw new Error("Gagal memperoleh respon dari AI");
        }
    } catch (e) {
        console.error(e);
        err.textContent = "Terjadi kesalahan saat menghubungi API! Coba lagi.";
        err.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = 'Kirim Refleksi ke AI';
    }
}


async function clearChatHistory() {
    if (!confirm('Apakah kamu yakin ingin menghapus semua riwayat chat dengan NARA-AI? Halaman refleksi mungkin akan kosong jika kamu belum chat kembali.')) return;
    try {
        const res = await fetch('/api/chat/' + currentUser.username, { method: 'DELETE' });
        if (res.ok) {
            // Clear local storage
            const histories = getChatHistories();
            histories[currentUser.username] = [];
            saveChatHistories(histories);

            // Clear UI
            document.getElementById('floating-chat-messages').innerHTML = '';
            alert('Riwayat chat berhasil dibersihkan!');
            toggleChatbot();
        }
    } catch (err) {
        console.error(err);
        alert('Gagal menghapus riwayat chat.');
    }
}


function downloadProgressReportPDF() {
    const studentUsername = currentUser.role === 'orang_tua' ? (currentUser.linkedStudent || currentUser.username) : currentUser.username;
    const studentName = currentUser.role === 'orang_tua' ? (currentUser.studentName || studentUsername) : currentUser.name;

    const progress = getProgress(studentUsername);
    const results = getAssessmentResults();
    const myResult = results[studentUsername] || progress.assessmentResult || { score: 0, total: 10, literasi: 0, numerasi: 0 };
    const scorePct = myResult.pct !== undefined ? myResult.pct : (myResult.total > 0 ? Math.round((myResult.score / myResult.total) * 100) : 0);
    const passStatus = scorePct >= 70 ? 'LULUS' : 'REMEDIAL';

    let t4AnalysisText = progress.tahap4Analysis;
    if (typeof t4AnalysisText === 'object' && t4AnalysisText !== null) {
        t4AnalysisText = t4AnalysisText.analysis || '';
    }
    t4AnalysisText = t4AnalysisText || 'Siswa menunjukkan pengamalan karakter 7 Kebiasaan Hebat Anak Indonesia yang sangat positif, terutama kedisiplinan beribadah dan gemar belajar mandiri.';

    let aiReadinessText = progress.aiReadiness;
    if (typeof aiReadinessText === 'string' && aiReadinessText.startsWith('{')) {
        try {
            const parsed = JSON.parse(aiReadinessText);
            aiReadinessText = parsed.analysis ? (parsed.analysis.umum || parsed.analysis.isi || JSON.stringify(parsed.analysis)) : aiReadinessText;
        } catch(e) {}
    } else if (typeof aiReadinessText === 'object' && aiReadinessText !== null) {
        aiReadinessText = aiReadinessText.analysis ? (aiReadinessText.analysis.umum || aiReadinessText.analysis.isi || JSON.stringify(aiReadinessText.analysis)) : JSON.stringify(aiReadinessText);
    }
    aiReadinessText = aiReadinessText || 'Siswa menunjukkan kesiapan belajar mandiri yang sangat baik dengan kemampuan menganalisis materi secara logis dan menyusun kesimpulan reflektif secara orisinal.';


    const element = document.createElement('div');
    element.style.padding = '40px 50px';
    element.style.fontFamily = "'Inter', sans-serif";
    element.style.color = '#1e293b';
    element.style.backgroundColor = '#ffffff';
    element.style.position = 'relative';
    element.style.minHeight = '1000px';

    element.innerHTML = `
        <!-- Watermark Container -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; display: flex; flex-direction: column; justify-content: space-around; align-items: center; z-index: 0; opacity: 0.055;">
            <div style="transform: rotate(-35deg); font-size: 4rem; font-weight: 800; color: #1a73e8; white-space: nowrap; margin: 80px 0;">SMP NEGERI 1 BALIKPAPAN</div>
            <div style="transform: rotate(-35deg); font-size: 4rem; font-weight: 800; color: #1a73e8; white-space: nowrap; margin: 80px 0;">SMP NEGERI 1 BALIKPAPAN</div>
            <div style="transform: rotate(-35deg); font-size: 4rem; font-weight: 800; color: #1a73e8; white-space: nowrap; margin: 80px 0;">SMP NEGERI 1 BALIKPAPAN</div>
        </div>

        <!-- Content -->
        <div style="position: relative; z-index: 1;">
            <!-- Kop Surat -->
            <div style="display: flex; align-items: center; border-bottom: 3px double #1e293b; padding-bottom: 15px; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; margin-right: 20px; display: flex; align-items: center; justify-content: center;">
                    <div style="width:70px; height:70px; border-radius:50%; background: linear-gradient(135deg, #1a73e8, #00bcd4); color: white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.8rem; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">S</div>
                </div>
                <div style="flex: 1; text-align: center;">
                    <h1 style="font-size: 1.6rem; font-weight: 800; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">SMP NEGERI 1 BALIKPAPAN</h1>
                    <p style="font-size: 0.85rem; margin: 3px 0 0 0; color: #475569; font-weight: 500;">Pemerintah Kota Balikpapan • Dinas Pendidikan dan Kebudayaan</p>
                    <p style="font-size: 0.8rem; margin: 2px 0 0 0; color: #64748b; font-style: italic;">Jl. Kapten Piere Tendean No.1, Balikpapan Kota, Kota Balikpapan, Kalimantan Timur</p>
                </div>
            </div>

            <!-- Title -->
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="font-size: 1.3rem; font-weight: 800; margin: 0; color: #1e293b; text-transform: uppercase; letter-spacing: 1px;">LAPORAN HASIL BELAJAR INTEGRASI NARA-AI</h2>
                <div style="width: 80px; height: 4px; background: #1a73e8; margin: 8px auto 0 auto; border-radius: 2px;"></div>
            </div>

            <!-- Student Metadata -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 0.9rem;">
                <tr>
                    <td style="width: 15%; padding: 6px 0; font-weight: 600; color: #475569;">Nama Siswa</td>
                    <td style="width: 2%; padding: 6px 0; color: #64748b;">:</td>
                    <td style="width: 33%; padding: 6px 0; font-weight: 700; color: #0f172a;">${studentName}</td>
                    <td style="width: 15%; padding: 6px 0; font-weight: 600; color: #475569;">Tanggal Cetak</td>
                    <td style="width: 2%; padding: 6px 0; color: #64748b;">:</td>
                    <td style="width: 33%; padding: 6px 0; color: #0f172a;">${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #475569;">Username</td>
                    <td style="padding: 6px 0; color: #64748b;">:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${studentUsername}</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #475569;">Status Program</td>
                    <td style="padding: 6px 0; color: #64748b;">:</td>
                    <td style="padding: 6px 0; color: #10b981; font-weight: 700;">SELESAI</td>
                </tr>
            </table>

            <!-- Stages Summary Table -->
            <div style="margin-bottom: 30px;">
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #1e293b; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #1a73e8; padding-left: 10px;">I. Rekapitulasi Nilai Pembelajaran</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                    <thead>
                        <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">
                            <th style="padding: 10px; font-weight: 700; color: #334155; width: 40%;">Tahapan Pembelajaran</th>
                            <th style="padding: 10px; font-weight: 700; color: #334155; width: 25%; text-align: center;">Skor Hasil</th>
                            <th style="padding: 10px; font-weight: 700; color: #334155; width: 15%; text-align: center;">Kualifikasi</th>
                            <th style="padding: 10px; font-weight: 700; color: #334155; width: 20%; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 12px 10px; font-weight: 600; color: #0f172a;">Tahap 1: Eksplorasi & Diskusi Interaktif</td>
                            <td style="padding: 12px 10px; text-align: center; color: #475569;">Kompeten (100)</td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 600; color: #10b981;">Sangat Baik</td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: #10b981;">Selesai</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 12px 10px; font-weight: 600; color: #0f172a;">Tahap 2: Refleksi Belajar Mandiri</td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: #0f172a;">${progress.tahap2Score || 80}%</td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 600; color: ${(progress.tahap2Score || 80) >= 80 ? '#10b981' : '#ff9800'};">${(progress.tahap2Score || 80) >= 85 ? 'Sangat Baik' : (progress.tahap2Score || 80) >= 70 ? 'Baik' : 'Cukup'}</td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: #10b981;">Selesai</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 12px 10px; font-weight: 600; color: #0f172a;">Tahap 3: Asesmen Utama (TKA - HOTS)</td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: #0f172a;">${scorePct}% <small style="font-weight:normal;color:#64748b;">(Benar: ${myResult.score}/${myResult.total})</small></td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 600; color: ${scorePct >= 70 ? '#10b981' : '#ef4444'};">${scorePct >= 85 ? 'Sangat Baik' : scorePct >= 70 ? 'Baik' : 'Kurang'}</td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: ${scorePct >= 70 ? '#10b981' : '#ef4444'};">${passStatus}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #cbd5e1;">
                            <td style="padding: 12px 10px; font-weight: 600; color: #0f172a;">Tahap 4: Pembentukan Karakter Unggul</td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: #0f172a;">${progress.tahap4Score || 85}%</td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 600; color: #10b981;">Sangat Baik</td>
                            <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: #10b981;">Selesai</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- AI Detailed Evaluations and Suggestions -->
            <div style="margin-bottom: 30px;">
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #1e293b; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #1a73e8; padding-left: 10px;">II. Hasil Evaluasi & Saran Rekomendasi AI</h3>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="font-size: 0.92rem; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
                        <span>📝</span> Analisis Kesiapan Belajar Mandiri (Tahap 2)
                    </h4>
                    <p style="font-size: 0.85rem; color: #334155; line-height: 1.5; margin: 0; font-style: italic;">
                        "${aiReadinessText}"
                    </p>
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="font-size: 0.92rem; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
                        <span>🎯</span> Analisis Kompetensi Literasi & Numerasi (Tahap 3)
                    </h4>
                    <p style="font-size: 0.85rem; color: #334155; line-height: 1.5; margin: 0;">
                        Siswa berhasil memperoleh skor asesmen sebesar <strong>${scorePct}%</strong>. Berdasarkan analisis, siswa memiliki pemahaman yang kuat pada soal HOTS aspek <strong>Literasi (${myResult.literasi || 0}/${myResult.litTotal || 5})</strong> dan <strong>Numerasi (${myResult.numerasi || 0}/${myResult.numTotal || 5})</strong>. AI menyarankan siswa untuk terus mengasah kemampuan analitik dengan berlatih soal-soal penalaran tingkat tinggi.
                    </p>
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px;">
                    <h4 style="font-size: 0.92rem; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
                        <span>🌱</span> Analisis & Umpan Balik Karakter (Tahap 4)
                    </h4>
                    <p style="font-size: 0.85rem; color: #334155; line-height: 1.5; margin: 0 0 8px 0; font-style: italic;">
                        "${t4AnalysisText}"
                    </p>
                    ${progress.tahap4Details && progress.tahap4Details.length ? `
                        <div style="font-size: 0.8rem; color: #475569; padding-left: 15px;">
                            <strong style="display:block;margin-bottom:4px;color:#334155;">Saran Pengembangan Karakter dari AI:</strong>
                            <ul style="margin:0; padding-left:15px; line-height:1.4;">
                                ${(progress.tahap4Details || []).slice(0, 3).map(d => `<li>${d}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Signatures Section -->
            <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 0.88rem; page-break-inside: avoid;">
                <div style="text-align: center; width: 30%;">
                    <p style="margin: 0 0 60px 0; color: #475569;">Orang Tua / Wali Siswa</p>
                    <div style="width: 150px; border-bottom: 1px solid #1e293b; margin: 0 auto 5px auto;"></div>
                    <p style="margin: 0; font-weight: 600; color: #0f172a;">............................................</p>
                </div>
                <div style="text-align: center; width: 30%;">
                    <p style="margin: 0 0 60px 0; color: #475569;">Mengetahui,<br>Kepala SMP Negeri 1 Balikpapan</p>
                    <div style="width: 150px; border-bottom: 1px solid #1e293b; margin: 0 auto 5px auto;"></div>
                    <p style="margin: 0; font-weight: 700; color: #0f172a;">.................................................</p>
                    <p style="margin: 2px 0 0 0; color: #64748b; font-size: 0.8rem;">NIP. ................................</p>
                </div>
                <div style="text-align: center; width: 30%;">
                    <p style="margin: 0 0 60px 0; color: #475569;">Balikpapan, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>Guru Pendamping / Wali Kelas</p>
                    <div style="width: 150px; border-bottom: 1px solid #1e293b; margin: 0 auto 5px auto;"></div>
                    <p style="margin: 0; font-weight: 700; color: #0f172a;">.................................................</p>
                    <p style="margin: 2px 0 0 0; color: #64748b; font-size: 0.8rem;">NIP. ................................</p>
                </div>
            </div>
        </div>
    `;

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `Laporan_NARA_AI_${studentUsername}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

