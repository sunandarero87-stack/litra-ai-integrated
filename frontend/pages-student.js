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
    const t4Status = progress.tahap3Complete ? (progress.tahap4Complete ? 'completed' : 'unlocked') : 'locked';

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
                    <div>
                        <i class="fas ${m.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-word'}" style="color: var(--primary); font-size: 1.5rem; margin-right: 1rem; vertical-align: middle;"></i>
                        <span style="font-weight: 500;">${m.name}</span>
                        <small class="text-muted d-block mt-1">Diupload: ${new Date(m.date).toLocaleDateString('id-ID')}</small>
                    </div>
                    <div style="display: flex; gap: 0.5rem;" onclick="event.stopPropagation()">
                        <button class="btn btn-outline btn-sm" onclick="downloadMaterial('${m._id}', '${m.name}', '${m.type}', event)" title="Download Materi"><i class="fas fa-download"></i></button>
                        <a href="index.html?viewMaterial=${m._id}" target="_blank" class="btn btn-outline btn-sm" title="Buka di Tab Baru"><i class="fas fa-external-link-alt"></i></a>
                        <button class="btn btn-primary btn-sm" onclick="viewMaterial('${m._id}', '${m.type}')">Buka</button>
                    </div>
                </div>`).join('') || '<p class="text-muted text-center mt-2">Belum ada materi untuk dipelajari.</p>'}
        </div>

        <div id="material-viewer-container" style="display:none; margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" onclick="closeMaterialViewer()"><i class="fas fa-arrow-left"></i> Kembali</button>
                    <button id="btn-view-new-tab" class="btn btn-outline" title="Buka di Tab Baru"><i class="fas fa-external-link-alt"></i></button>
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
                <div class="bot-avatar" style="width:40px;height:40px;border-radius:50%;background:white;color:var(--primary);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
                    ${teacherPhoto}
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
            <div id="chat-material-selector-container" style="padding: 0.5rem 1rem; background: var(--bg-sidebar); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.5rem;">
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
        <button id="chatbot-toggle-btn" onclick="toggleChatbot()" style="width: 60px; height: 60px; border-radius: 50%; background: var(--gradient-primary); color: white; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 3px solid white; transition: transform 0.3s; pointer-events: auto;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1.0)'">
            <i class="fas fa-comment-dots"></i>
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

    // Update "Buka di Tab Baru" button link
    const newTabBtn = document.getElementById('btn-view-new-tab');
    if (newTabBtn) {
        newTabBtn.onclick = () => window.open(`index.html?viewMaterial=${id}`, '_blank');
    }

    // Find material in database to check if we have the content
    const material = materials.find(m => m._id === id || m.name === id); // fallback just in case

    if (!material) return;

    const wrapper = document.getElementById('viewer-content-wrapper');
    
    // Default: Show PDF in iframe if it's a PDF
    if (type === 'pdf') {
        const urlObj = material._id ? `/api/materials/content/${material._id}` : material.contentDataUrl;
        wrapper.innerHTML = `<iframe src="${urlObj}" style="width:100%; height:100%; border:none; background: white;"></iframe>`;
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
        } catch(err) {
            console.warn('Gagal fetch content materi:', err);
        }
    }

    if (textContent && textContent.trim()) {
        const formattedHTML = formatMaterialContent(textContent, material.name);
        wrapper.innerHTML = `
            <div style="width:100%; height:100%; overflow-y:auto; padding:2rem 2.5rem; text-align:left; line-height:1.8; font-size:1rem; color:var(--text-primary); background: var(--bg-card);">
                <div style="max-width:800px; margin:0 auto;">
                    <h2 style="color:var(--primary); margin-bottom:1.5rem; padding-bottom:0.75rem; border-bottom:2px solid var(--primary-light);">
                        <i class="fas fa-book-open" style="margin-right:0.5rem;"></i>${material.name}
                    </h2>
                    <div class="material-text-content">${formattedHTML}</div>
                </div>
            </div>`;
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

    // Avoid duplicate initialization if switching material inside the viewer
    if (currentMaterial !== id) {
        currentMaterial = id;

        // Tampilkan popup pengingat uji pemahaman
        showMaterialPopup();

        // Ensure chatbot is visible in viewer
        const chatbotContainer = document.getElementById('floating-chatbot-container');
        if (chatbotContainer) chatbotContainer.style.display = 'flex';

        // Update chatbot header subtitle and selector
        const contextEl = document.getElementById('chat-material-context');
        if (contextEl) contextEl.textContent = `Membahas: ${material.name}`;
        const chatSelector = document.getElementById('chat-material-selector');
        if (chatSelector) chatSelector.value = material._id;

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
                    const initialGreeting = "Halo " + currentUser.name + " Saya NARA-AI Asistennya " + teacher.name + " untuk menemani kamu belajar Materi " + material.name + ", Tanyakan bagian mana yang tidak kamu pahami dari " + material.name;
                    appendFloatingMessage('bot', initialGreeting, teacherPhoto);
                    history.push({ role: 'bot', text: initialGreeting, time: new Date().toISOString() });
                } else {
                    history.forEach(m => appendFloatingMessage(m.role, formatMessageLocal(m.text), teacherPhoto));
                }
                
                // Update local storage
                const histories = getChatHistories();
                histories[currentUser.username] = history;
                saveChatHistories(histories);
            })
            .catch(err => {
                console.error('Failed to fetch chat history:', err);
                chatBox.innerHTML = '';
                const initialGreeting = "Halo " + currentUser.name + " Saya NARA-AI Asistennya " + teacher.name + " untuk menemani kamu belajar Materi " + material.name + ", Tanyakan bagian mana yang tidak kamu pahami dari " + material.name;
                appendFloatingMessage('bot', initialGreeting, teacherPhoto);
            });
    } else {
        // Even if same material, ensure chatbot is visible and context is set
        const chatbotContainer = document.getElementById('floating-chatbot-container');
        if (chatbotContainer) chatbotContainer.style.display = 'flex';
        
        const contextEl = document.getElementById('chat-material-context');
        const materials = getMaterials();
        const mat = materials.find(m => m._id === id || m.name === id);
        if (contextEl && mat) contextEl.textContent = `Membahas: ${mat.name}`;
        const chatSelector = document.getElementById('chat-material-selector');
        if (chatSelector && mat) chatSelector.value = mat._id;
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
                    const initialGreeting = "Halo " + currentUser.name + " Saya NARA-AI Asistennya " + teacher.name + " untuk menemani kamu belajar Materi " + material.name + ", Tanyakan bagian mana yang tidak kamu pahami dari " + material.name;
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
    showMaterialPopup();
}

function closeMaterialViewer() {
    document.getElementById('material-list-container').style.display = 'block';
    document.getElementById('material-viewer-container').style.display = 'none';
    document.getElementById('floating-chatbot-container').style.display = 'none';
    document.getElementById('chatbot-panel').style.display = 'none';
    currentMaterial = null;
}

async function toggleChatbot() {
    const panel = document.getElementById('chatbot-panel');
    const isOpening = panel.style.display === 'none';

    if (isOpening) {
        // Cek antrian ke server
        try {
            const res = await fetch('/api/chat/check-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username })
            });
            const data = await res.json();

            if (!data.allowed) {
                alert(data.message || "Maaf, antrian penuh (Maksimal 50 siswa). Silakan menunggu sambil mempelajari materi.");
                return;
            }

            panel.style.display = 'flex';
            document.getElementById('floating-chat-input').focus();
        } catch (err) {
            console.error('Queue check failed:', err);
            alert('Gagal menghubungkan ke sistem antrian. Silakan coba lagi.');
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

    let avatarIcon = role === 'bot' ? teacherPhoto : '<i class="fas fa-user"></i>';
    let bgColor = role === 'bot' ? 'var(--bg-input)' : 'var(--primary)';
    let color = role === 'bot' ? 'inherit' : 'white';
    let borderRadius = role === 'bot' ? '8px 8px 8px 4px' : '8px 8px 4px 8px';

    div.innerHTML = `
        <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;background:${role === 'bot' ? 'white' : 'var(--bg-input)'};color:${role === 'bot' ? 'var(--primary)' : 'var(--text-secondary)'};font-size:0.8rem;">
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
let lastAiExplanation = '';
let waitingForUnderstandingAnswer = false;
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
 * Tampilkan atau sembunyikan tombol Paham/Belum Paham
 */
function showPahamButtons() {
    const qr = document.getElementById('quick-replies');
    if (!qr) return;
    qr.style.display = 'flex';
    qr.innerHTML = `
        <span style="font-size:0.82rem;color:var(--text-muted);align-self:center;margin-right:0.25rem;">Apakah kamu sudah paham?</span>
        <button id="btn-belum-paham" class="btn btn-outline btn-sm" onclick="onBelumPaham()"
            style="padding:0.4rem 0.9rem;font-size:0.85rem;border-color:var(--danger);color:var(--danger);">🤔 Belum Paham</button>
        <button id="btn-paham" class="btn btn-success btn-sm" onclick="onPaham()"
            style="padding:0.4rem 0.9rem;font-size:0.85rem;">💡 Sudah Paham</button>
    `;
}

function hidePahamButtons() {
    const qr = document.getElementById('quick-replies');
    if (qr) { qr.style.display = 'none'; qr.innerHTML = ''; }
}

/**
 * Tampilkan tombol Ulangi Penjelasan / Buat Pertanyaan Baru saat skor < 75
 */
function showGagalButtons() {
    const qr = document.getElementById('quick-replies');
    if (!qr) return;
    qr.style.display = 'flex';
    qr.innerHTML = `
        <button id="btn-ulangi-penjelasan" class="btn btn-outline btn-sm" onclick="onBelumPaham()"
            style="padding:0.4rem 0.9rem;font-size:0.85rem;border-color:var(--primary);color:var(--primary);">
            <i class="fas fa-sync-alt"></i> Ulangi Penjelasan
        </button>
        <button id="btn-buat-pertanyaan" class="btn btn-primary btn-sm" onclick="onMintaPertanyaanBaru()"
            style="padding:0.4rem 0.9rem;font-size:0.85rem;">
            <i class="fas fa-question-circle"></i> Buat Pertanyaan baru
        </button>
    `;
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

/** Siswa klik "Buat Pertanyaan baru" setelah gagal */
function onMintaPertanyaanBaru() {
    hidePahamButtons();
    waitingForUnderstandingAnswer = true;
    const materials = getMaterials();
    const currMat = materials.find(m => m._id === currentMaterial || m.name === currentMaterial);
    const materialName = currMat ? currMat.name : currentMaterial;
    sendFloatingChat(`Tolong berikan SATU pertanyaan baru yang berkaitan dengan materi **${materialName}** berdasarkan penjelasanmu tadi untuk menguji pemahamanku lagi.`);
}

/**
 * Kirim jawaban uji pemahaman ke endpoint /api/chat/analyze-understanding
 * dipanggil ketika waitingForUnderstandingAnswer = true dan siswa mengirim pesan
 */
async function sendUnderstandingAnswer(studentAnswer, teacherPhoto) {
    waitingForUnderstandingAnswer = false;
    hidePahamButtons();

    const chatBox = document.getElementById('floating-chat-messages');
    // Tampilkan indikator typing
    const typing = document.createElement('div');
    typing.id = 'floating-typing-indicator';
    typing.style.cssText = 'display:flex;gap:0.75rem;align-self:flex-start;';
    typing.innerHTML = `
        <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;background:white;color:var(--primary);font-size:0.8rem;">${teacherPhoto}</div>
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
            const scoreMatch = feedbackText.match(/\[SKOR:\s*(\d+)\]/i);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

            // Hapus tag [SKOR: X] dari teks yang ditampilkan
            feedbackText = feedbackText.replace(/\[SKOR:\s*\d+\]/gi, '').trim();

            // Tunjukkan tombol Lanjut ke Tahap 2 (Sekarang selalu muncul sesuai request)
            const btnLanjut = document.getElementById('btn-lanjut-tahap2');
            if (btnLanjut) btnLanjut.style.display = 'inline-block';
            localStorage.setItem('tahap1_ready_' + currentUser.username, 'true');

            if (score >= 75) {
                feedbackText += `<br><br><div style="background:linear-gradient(135deg,#1a7a4a,#22c55e);border-radius:10px;padding:0.8rem 1rem;color:white;text-align:center;margin-top:0.5rem;">
                    <i class="fas fa-star" style="font-size:1.4rem;"></i>
                    <div style="font-size:1rem;font-weight:700;margin-top:0.3rem;">Luar Biasa! Skor Pemahaman: ${score}%</div>
                    <div style="font-size:0.82rem;opacity:0.9;margin-top:0.2rem;">Tombol <strong>Lanjut ke Tahap 2</strong> sudah terbuka di atas! 🎉</div>
                </div>`;
            } else {
                feedbackText += `<br><br><div style="background:linear-gradient(135deg,#7f1d1d,#ef4444);border-radius:10px;padding:0.8rem 1rem;color:white;text-align:center;margin-top:0.5rem;">
                    <i class="fas fa-redo" style="font-size:1.2rem;"></i>
                    <div style="font-size:0.95rem;font-weight:700;margin-top:0.3rem;">Skor Pemahaman: ${score}%</div>
                    <div style="font-size:0.82rem;opacity:0.9;margin-top:0.2rem;">Meskipun belum mencapai 75%, kamu tetap bisa lanjut ke Tahap 2. Silakan klik tombol di atas!</div>
                </div>`;
                // Tampilkan tombol bantuan jika ingin mengulang penjelasan (opsional bagi siswa)
                setTimeout(() => {
                    showGagalButtons();
                }, 500);
            }

            // Mulai hitungan mundur otomatis untuk menutup chat
            setTimeout(() => {
                startChatbotCountdown(score);
            }, 1500);

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

function startChatbotCountdown(score) {
    const chatPanel = document.getElementById('chatbot-panel');
    if (!chatPanel || chatPanel.style.display === 'none') return;

    const existing = document.getElementById('chatbot-countdown-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'chatbot-countdown-overlay';
    // Mengubah overlay menjadi kartu melayang kecil agar tidak menutupi seluruh chat/nilai
    overlay.style.cssText = 'position:absolute; top:35%; left:50%; transform:translate(-50%, -50%); width:80%; max-width:280px; background:rgba(0,0,0,0.7); backdrop-filter:blur(10px); color:white; z-index:100; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5); padding:1.5rem; text-align:center; transition:all 0.3s; border:1px solid rgba(255,255,255,0.1);';

    let seconds = 10;
    
    // Tombol batal jika skor < 75
    let cancelBtnHTML = '';
    if (score !== undefined && score < 75) {
        cancelBtnHTML = `<button id="btn-cancel-countdown" class="btn btn-sm btn-outline mt-2" style="border-color:white; color:white;">Batalkan</button>`;
    }

    overlay.innerHTML = `
        <div style="animation: scaleIn 0.3s ease;">
            <i class="fas fa-robot" style="font-size:2.5rem; color:var(--primary-light); margin-bottom:0.75rem;"></i>
            <h3 style="margin-bottom:0.3rem; font-size:1.1rem; font-weight:700;">Verifikasi Berhasil!</h3>
            <p style="opacity:0.8; margin-bottom:1rem; font-size:0.8rem;">Menutup otomatis dalam:</p>
            <div id="countdown-number" style="font-size:3.5rem; font-weight:800; color:var(--success); line-height:1; text-shadow:0 0 20px rgba(34,197,94,0.5);">${seconds}</div>
            <p style="margin-top:1rem; font-size:0.7rem; color:var(--text-secondary); font-style:italic;">Siap lanjut ke Tahap 2</p>
            ${cancelBtnHTML}
        </div>
    `;

    chatPanel.style.position = 'relative';
    chatPanel.appendChild(overlay);

    let timer;

    if (score !== undefined && score < 75) {
        document.getElementById('btn-cancel-countdown').addEventListener('click', () => {
            clearInterval(timer);
            overlay.remove();
        });
    }

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

    // Jika sedang menunggu jawaban uji pemahaman, proses khusus
    if (waitingForUnderstandingAnswer && typeof quickMsg !== 'string') {
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
        <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;background:white;color:var(--primary);font-size:0.8rem;">
            ${teacherPhoto}
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

                // Tampilkan tombol Paham/Belum Paham hanya jika:
                // 1. Tidak sedang menunggu jawaban uji pemahaman
                // 2. Pesan siswa bukan sapaan
                // 3. SEDANG MEMBAHAS MATERI (currentMaterial tidak null)
                // 4. Jawaban AI bukan pesan penolakan karena di luar konteks
                if (!waitingForUnderstandingAnswer && !isGreetingMessage(lastUserMessage) && currentMaterial) {
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

async function renderTahap2(main) {
    // Reset local cache agar selalu mengambil yang terbaru dari server berdasarkan chat terakhir
    if (typeof lastRenderedTahap === 'undefined' || lastRenderedTahap !== 'tahap2') {
        reflectionQuestions = [];
        window.lastRenderedTahap = 'tahap2';
    }

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
            <h3>📝 Tahap 2: Refleksi Belajar</h3>
            <p class="text-muted">Jawablah pertanyaan berikut dengan jujur berdasarkan apa yang telah kamu diskusikan dengan NARA-AI.</p>
        </div>
        <div class="card mt-2">
            <form id="reflection-form">
                ${reflectionQuestions.map((q, i) => `
                <div class="question-group mb-3" style="width: 100%; display: flex; flex-direction: column;">
                    <label class="d-block mb-2"><strong>${i + 1}. ${q}</strong></label>
                    <textarea 
                        class="form-input reflection-input" 
                        rows="5"
                        style="width: 100%; min-height: 120px; box-sizing: border-box; resize: vertical;"
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

            // PENTING: Dulu AI membuat 20 soal asesmen di sini, sekarang tidak. Soal akan dibuat nanti saat Guru meng-Approve.

            // Update local progress with analysis and raw reflection answers
            const progress = getProgress(currentUser.username);
            progress.tahap2Complete = true;
            progress.aiReadiness = analysisData.analysis.analysis;
            progress.isReady = analysisData.analysis.ready;
            progress.tahap2Score = analysisData.analysis.score ?? null; // Simpan nilai refleksi Tahap 2
            progress.reflectionAnswers = answers; // Save raw answers for later generation
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

window.startRemedialMandiri = async function() {
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
        progress.generatedAssessment = genData.questions;
        progress.tahap3Complete = false;
        progress.remedialStatus = 'approved';
        updateProgress(currentUser.username, progress);
        
        renderTahap3(document.getElementById('main-content'));
    } catch(err) {
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
            progress.generatedAssessment = data.questions;
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
    } catch(err) {
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

// ---- TAHAP 4: REFLEKSI 7 KEBIASAAN HEBAT ----
function renderTahap4(main) {
    const progress = getProgress(currentUser.username);
    if (!progress.tahap3Complete) {
        main.innerHTML = `<div class="card"><p class="text-center text-muted">Selesaikan Tahap 3 terlebih dahulu.</p></div>`;
        return;
    }

    if (progress.tahap4Complete) {
        const details = (progress.tahap4Details || []).map(d => `<li>${d}</li>`).join('');
        main.innerHTML = `
        <div class="card fade-in">
            <h3 class="card-title text-center mb-2">🎉 Selamat! Anda telah menyelesaikan Tahap 4</h3>
            <div class="score-display text-center my-2">
                <div class="score-circle pass mx-auto" style="width:120px;height:120px;font-size:2rem">
                    ${progress.tahap4Score}
                </div>
            </div>
            <p class="text-center"><strong>Analisis AI:</strong> ${progress.tahap4Analysis}</p>
            ${details ? `<ul class="mt-2" style="max-width:600px;margin:0 auto;text-align:left;">${details}</ul>` : ''}
            <div class="text-center mt-3">
                <button class="btn btn-primary" onclick="navigateTo('dashboard')">Kembali ke Dashboard</button>
            </div>
        </div>`;
        return;
    }

    const questions = [
        "1. Bangun Pagi: Jam berapa kamu bangun pagi hari ini dan kegiatan apa yang langsung kamu lakukan?",
        "2. Beribadah: Bagaimana kamu memastikan untuk selalu melaksanakan ibadah sesuai ajaran agamamu sebelum ke sekolah?",
        "3. Berolahraga: Olahraga atau aktivitas fisik apa yang rutin kamu lakukan minggu ini untuk menjaga kebugaran tubuh?",
        "4. Makan Sehat dan Bergizi: Jelaskan menu makanan sarapan sehatmu hari ini yang memberikan energi untuk belajar.",
        "5. Gemar Belajar: Bagaimana cara belajarmu di rumah untuk mempersiapkan materi besok setiap malam hari?",
        "6. Bermasyarakat: Ceritakan satu pengalamanmu di mana kamu saling membantu teman atau tetangga di lingkunganmu.",
        "7. Tidur Cepat: Jam berapa kamu biasanya tidur malam dan persiapan apa yang kamu lakukan sebelumnya agar tenang?"
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
                tahap4Analysis: data.analysis.analysis || "Analisis berhasil diselesaikan.",
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

