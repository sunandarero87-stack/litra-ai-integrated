// ============================================
// PAGES - Teacher/Admin Dashboard, Results, Management
// ============================================

function renderTeacherDashboard(main) {
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');
    const results = getAssessmentResults();
    let passed = 0, failed = 0, total = 0, readyForAssessment = 0;

    students.forEach(s => {
        const r = results[s.username];
        if (r) { total++; r.pass ? passed++ : failed++; }
        const p = getProgress(s.username);
        if (p.tahap2Complete && p.isReady) readyForAssessment++;
    });

    main.innerHTML = `
    <div style="margin-bottom:1.5rem">
        <h2 style="font-size:1.3rem;font-weight:800">Dashboard ${currentUser.role === 'admin' ? 'Administrator' : 'Guru'} 📊</h2>
        <p class="text-muted">SMP Negeri 1 Balikpapan - Informatika</p>
    </div>
    <div class="grid-4">
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-users"></i></div><div class="stat-info"><h3>${students.length}</h3><p>Total Siswa</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h3>${passed}</h3><p>Lulus Asesmen</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-robot"></i></div><div class="stat-info"><h3>${readyForAssessment}</h3><p>Rekomendasi AI</p></div></div>
        <div class="stat-card"><div class="stat-icon red"><i class="fas fa-hourglass-half"></i></div><div class="stat-info"><h3>${students.length - total}</h3><p>Belum Asesmen</p></div></div>
    </div>
    <div class="card mt-2">
        <div class="card-header"><h3 class="card-title">📋 Status Progres Siswa</h3></div>
        <div class="table-container">
            <table>
                <thead><tr><th>Nama</th><th>Kelas</th><th>Tahap</th><th>Rekomendasi AI</th><th>Status Hasil</th></tr></thead>
                <tbody>
                    ${students.map(s => {
        const p = getProgress(s.username);
        const r = results[s.username];
        const stage = p.tahap4Complete ? 'Selesai' : p.tahap3Complete ? 'Tahap 4' : p.tahap2Complete ? 'Tahap 3' : p.tahap1Complete ? 'Tahap 2' : 'Tahap 1';
        const badge = r ? (r.pass ? '<span class="badge badge-success">Lulus</span>' : '<span class="badge badge-danger">Tidak Lulus</span>') : '<span class="badge badge-warning">Proses</span>';
        const aiRec = p.tahap2Complete ? (p.isReady ? '<span class="text-success"><i class="fas fa-check-circle"></i> SIAP</span>' : '<span class="text-warning"><i class="fas fa-exclamation-triangle"></i> PERLU BIMBINGAN</span>') : '<span class="text-muted">-</span>';
        return `<tr><td>${s.name}</td><td>${s.kelas || '-'}</td><td>${stage}</td><td>${aiRec}</td><td>${badge}</td></tr>`;
    }).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada siswa terdaftar</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>`;
}


// ---- STUDENT RESULTS ----
function renderStudentResults(main) {
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');
    const results = getAssessmentResults();

    // AI Analysis summary
    let totalLit = 0, totalNum = 0, totalAll = 0, count = 0;
    students.forEach(s => {
        const r = results[s.username];
        if (r) { totalLit += (r.literasi / r.litTotal) * 100; totalNum += (r.numerasi / r.numTotal) * 100; totalAll += r.pct; count++; }
    });
    const avgLit = count ? Math.round(totalLit / count) : 0;
    const avgNum = count ? Math.round(totalNum / count) : 0;
    const avgAll = count ? Math.round(totalAll / count) : 0;

    main.innerHTML = `
    <div class="analysis-grid">
        <div class="analysis-card">
            <h4>📖 Rata-rata Literasi</h4>
            <div class="analysis-value ${avgLit >= 70 ? 'high' : avgLit >= 50 ? 'medium' : 'low'}">${avgLit}%</div>
            <p class="text-muted" style="font-size:0.8rem">AI Analysis</p>
        </div>
        <div class="analysis-card">
            <h4>🔢 Rata-rata Numerasi</h4>
            <div class="analysis-value ${avgNum >= 70 ? 'high' : avgNum >= 50 ? 'medium' : 'low'}">${avgNum}%</div>
            <p class="text-muted" style="font-size:0.8rem">AI Analysis</p>
        </div>
        <div class="analysis-card">
            <h4>📊 Rata-rata Keseluruhan</h4>
            <div class="analysis-value ${avgAll >= 70 ? 'high' : avgAll >= 50 ? 'medium' : 'low'}">${avgAll}%</div>
            <p class="text-muted" style="font-size:0.8rem">AI Analysis</p>
        </div>
    </div>
    <div class="card mt-2">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <h3 class="card-title">⚠️ Laporan Siswa Melakukan Pelanggaran</h3>
            <button class="btn btn-success btn-sm" onclick="downloadViolationsExcel()"><i class="fas fa-file-excel"></i> Download Excel</button>
        </div>
        <div class="table-container">
            <table>
                <thead><tr><th>Nama</th><th>Kelas</th><th>Jumlah Pelanggaran</th><th>Nilai Siswa</th></tr></thead>
                <tbody>
                    ${students.filter(s => results[s.username] && results[s.username].violations > 0).map(s => {
        const r = results[s.username];
        const exactScore = ((r.score / r.total) * 100).toFixed(1);
        return `<tr><td>${s.name}</td><td>${s.kelas || '-'}</td><td style="color:var(--danger);font-weight:bold">${r.violations}</td><td>${exactScore}</td></tr>`;
    }).join('') || '<tr><td colspan="4" class="text-center text-muted">Belum ada siswa yang melakukan pelanggaran</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>
    <div class="card mt-2">
        <div class="card-header"><h3 class="card-title">Hasil Penilaian Per Siswa</h3></div>
        <div class="table-container">
            <table>
                <thead><tr><th>Nama</th><th>Kelas</th><th>Literasi</th><th>Numerasi</th><th>Total</th><th>Status</th><th>Tanggal</th></tr></thead>
                <tbody>
                    ${students.map(s => {
        const r = results[s.username];
        if (!r) return `<tr><td>${s.name}</td><td>${s.kelas || '-'}</td><td colspan="5" class="text-muted">Belum mengerjakan asesmen</td></tr>`;
        return `<tr><td>${s.name}</td><td>${s.kelas || '-'}</td><td>${r.literasi}/${r.litTotal}</td><td>${r.numerasi}/${r.numTotal}</td><td><strong>${r.pct}%</strong></td><td>${r.pass ? '<span class="badge badge-success">Lulus</span>' : '<span class="badge badge-danger">Tidak Lulus</span>'}</td><td>${new Date(r.date).toLocaleDateString('id-ID')}</td></tr>`;
    }).join('') || '<tr><td colspan="7" class="text-center text-muted">Belum ada data</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>`;
}

function downloadViolationsExcel() {
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');
    const results = getAssessmentResults();
    const violators = students.filter(s => results[s.username] && results[s.username].violations > 0);

    if (violators.length === 0) {
        alert('Tidak ada data pelanggaran untuk di-download.');
        return;
    }

    let tableHTML = '<table><thead><tr><th>Nama Siswa</th><th>Kelas</th><th>Jumlah Pelanggaran</th><th>Nilai Siswa</th></tr></thead><tbody>';
    violators.forEach(s => {
        const r = results[s.username];
        const exactScore = ((r.score / r.total) * 100).toFixed(1);
        // Using comma for decimal to match typical local excel parsing expectations if possible, or keeping original string.
        tableHTML += `<tr><td>${s.name}</td><td>${s.kelas || '-'}</td><td>${r.violations}</td><td>${exactScore.replace('.', ',')}</td></tr>`;
    });
    tableHTML += '</tbody></table>';

    const blob = new Blob(['\ufeff' + tableHTML], { type: 'application/vnd.ms-excel;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Pelanggaran_Asesmen_${new Date().getTime()}.xls`;
    link.click();
}

// ---- MATERIALS MANAGEMENT ----
function renderMaterials(main) {
    const materials = getMaterials();
    main.innerHTML = `
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">📚 Materi Pembelajaran</h3>
        </div>
        <div class="upload-zone" onclick="document.getElementById('material-upload').click()">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Klik untuk upload materi (PDF, DOC, DOCX)</p>
            <p class="text-muted" style="font-size:0.8rem">Siswa akan membaca materi ini di Tahap 1</p>
            <input type="file" id="material-upload" accept=".pdf,.doc,.docx" style="display:none" onchange="handleMaterialUpload(event)">
        </div>
        <div class="material-list" id="material-list">
            ${materials.map((m) => `
                <div class="material-item">
                    <i class="fas ${m.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-word'}"></i>
                    <span>${m.name}</span>
                    <small class="text-muted">${new Date(m.date).toLocaleDateString('id-ID')}</small>
                    <button class="btn btn-sm btn-danger" onclick="deleteMaterial('${m._id}')"><i class="fas fa-trash"></i></button>
                </div>`).join('') || '<p class="text-muted text-center mt-2">Belum ada materi diupload</p>'}
        </div>
    </div>`;
}

function handleMaterialUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) { alert('Format file tidak didukung. Gunakan PDF, DOC, atau DOCX.'); return; }

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const payload = {
                name: file.name,
                type: ext,
                date: new Date().toISOString(),
                size: file.size,
                contentDataUrl: e.target.result
            };
            const res = await fetch('/api/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                await syncData();
                alert('✅ Materi berhasil diupload!');
                renderMaterials(document.getElementById('main-content'));
            } else {
                alert('Gagal upload materi ke server.');
            }
        } catch (err) {
            console.error(err);
            alert('Server error.');
        }
    };
    reader.readAsDataURL(file);
}

async function deleteMaterial(id) {
    if (!confirm('Hapus materi ini?')) return;
    try {
        const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await syncData();
            renderMaterials(document.getElementById('main-content'));
        } else {
            alert('Gagal menghapus materi.');
        }
    } catch (err) {
        console.error(err);
        alert('Server error.');
    }
}

// ---- ASSESSMENT MANAGEMENT ----
function renderAssessmentMgmt(main) {
    const settings = getAssessmentSettings();
    const approvals = getApprovals();
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');

    main.innerHTML = `
    <div class="grid-2">
        <div class="card">
            <div class="card-header"><h3 class="card-title">⏱️ Pengaturan Waktu</h3></div>
            <div class="form-group">
                <label>Durasi Asesmen (menit)</label>
                <input type="number" id="assessment-duration" value="${settings.duration}" min="10" max="180">
            </div>
            <button class="btn btn-primary" onclick="saveAssessmentDuration()"><i class="fas fa-save"></i> Simpan</button>
        </div>
        <div class="card">
            <div class="card-header"><h3 class="card-title">📋 Info Asesmen</h3></div>
            <p><strong>Jumlah Soal:</strong> 20 soal</p>
            <p class="mt-1"><strong>Tipe:</strong> Literasi (10) + Numerasi (10)</p>
            <p class="mt-1"><strong>KKM:</strong> 70%</p>
            <p class="mt-1"><strong>Format:</strong> TKA</p>
        </div>
    </div>
    <div class="card mt-2">
        <div class="card-header"><h3 class="card-title">✅ Persetujuan Siswa untuk Asesmen</h3></div>
        <div class="table-container">
            <table>
                <thead><tr><th>Nama</th><th>Kelas</th><th>Progres</th><th>Analisis AI (Kesiapan)</th><th>Aksi Approval</th></tr></thead>
                <tbody>
                    ${students.map(s => {
        const p = getProgress(s.username);
        const approved = approvals[s.username];
        const hasReflection = p.tahap2Complete;
        const aiAnalysis = p.aiReadiness || 'Belum ada refleksi';
        const readyColor = p.isReady ? 'var(--success)' : hasReflection ? 'var(--warning)' : 'var(--text-muted)';

        return `<tr>
                            <td>${s.name}</td><td>${s.kelas || '-'}</td>
                            <td>${hasReflection ? '<span class="badge badge-success">Refleksi Selesai</span>' : '<span class="badge badge-warning">Belum Refleksi</span>'}</td>
                            <td style="max-width:300px">
                                <div style="color:${readyColor}; font-weight:bold; margin-bottom:4px">
                                    ${p.isReady ? '✅ Direkomendasikan' : hasReflection ? '⚠️ Perlu Penguatan' : '⏳ Menunggu'}
                                </div>
                                <small class="text-muted d-block" style="line-height:1.2">${aiAnalysis}</small>
                            </td>
                            <td>
                                ${approved ? `<div style="display:flex; flex-direction:column; gap:0.5rem"><span class="badge badge-success">Disetujui</span> <button class="btn btn-sm btn-warning" onclick="approveStudent('${s.username}', this)" style="font-size:0.75rem"><i class="fas fa-sync"></i> Generate Soal</button></div>` :
                hasReflection ? `<button class="btn btn-sm btn-success" onclick="approveStudent('${s.username}', this)"><i class="fas fa-magic"></i> Generate Soal</button>` :
                    '<span class="text-muted">Menunggu Refleksi</span>'}
                            </td>
                        </tr>`;
    }).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada siswa</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>`;

}

function saveAssessmentDuration() {
    const dur = parseInt(document.getElementById('assessment-duration').value);
    if (dur < 10 || dur > 180) { alert('Durasi harus antara 10-180 menit!'); return; }
    saveAssessmentSettings({ duration: dur });
    alert('✅ Durasi asesmen berhasil disimpan!');
}

async function approveStudent(username, btnElement) {
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generate Soal...';
    }

    try {
        const progress = getProgress(username);
        const reflectionAnswers = progress.reflectionAnswers || [];

        // Langsung generate dari database
        const genRes = await fetch('/api/assessment/generate-from-bank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        if (!genRes.ok) {
            const errBody = await genRes.json();
            throw new Error(errBody.error || "Gagal mengambil soal dari Bank Soal");
        }
        const genData = await genRes.json();

        // Buka Modal untuk Review Guru
        showAssessmentReviewModal(username, genData.questions);

    } catch (err) {
        console.error(err);
        alert('Gagal mengambil/membuat pertanyaan dari AI!');
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = 'Approve';
        }
    }
}

function showAssessmentReviewModal(username, originalQuestions) {
    // Pastikan array soal berjumlah sesuai (kalau kurang dari 20, kita tetap tampilkan apa adanya)

    // Simpan ke memory temporary agar mudah dibaca di submit form
    window.tempReviewQuestions = [...originalQuestions];

    const questionsHTML = originalQuestions.map((q, index) => `
        <div class="review-question-card" style="border:1px solid var(--border-color); padding:1rem; border-radius:8px; margin-bottom:1rem; background:var(--bg-input);">
            <div style="font-weight:bold; margin-bottom:0.5rem">Soal ${index + 1}</div>
            
            <label>Teks Pertanyaan:</label>
            <textarea id="rev-q-${index}-text" style="width:100%; height:80px; margin-bottom:0.5rem">${q.question || ''}</textarea>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.5rem">
                <div>
                    <label>A.</label>
                    <input type="text" id="rev-q-${index}-opt0" value="${q.options && q.options[0] ? q.options[0].replace(/"/g, '&quot;') : ''}">
                </div>
                <div>
                    <label>B.</label>
                    <input type="text" id="rev-q-${index}-opt1" value="${q.options && q.options[1] ? q.options[1].replace(/"/g, '&quot;') : ''}">
                </div>
                <div>
                    <label>C.</label>
                    <input type="text" id="rev-q-${index}-opt2" value="${q.options && q.options[2] ? q.options[2].replace(/"/g, '&quot;') : ''}">
                </div>
                <div>
                    <label>D.</label>
                    <input type="text" id="rev-q-${index}-opt3" value="${q.options && q.options[3] ? q.options[3].replace(/"/g, '&quot;') : ''}">
                </div>
            </div>
            
            <div style="display:flex; gap:1rem;">
                <div style="flex:1">
                    <label>Kunci Jawaban Benar:</label>
                    <select id="rev-q-${index}-correct" class="form-control">
                        <option value="0" ${q.correct === 0 ? 'selected' : ''}>A</option>
                        <option value="1" ${q.correct === 1 ? 'selected' : ''}>B</option>
                        <option value="2" ${q.correct === 2 ? 'selected' : ''}>C</option>
                        <option value="3" ${q.correct === 3 ? 'selected' : ''}>D</option>
                    </select>
                </div>
                <div style="flex:1">
                    <label>Tipe Soal:</label>
                    <select id="rev-q-${index}-type" class="form-control">
                        <option value="literasi" ${q.type === 'literasi' ? 'selected' : ''}>Literasi</option>
                        <option value="numerasi" ${q.type === 'numerasi' ? 'selected' : ''}>Numerasi</option>
                    </select>
                </div>
            </div>
            
            <label style="margin-top:0.5rem; display:block">Penjelasan (Opsional):</label>
            <textarea id="rev-q-${index}-explanation" style="width:100%; height:40px;">${q.explanation || ''}</textarea>
        </div>
    `).join('');

    document.getElementById('modal-container').innerHTML = `
    <div class="modal-overlay" style="z-index:9999" onclick="if(event.target===this) { if(confirm('Yakin ingin membatalkan review? Pertanyaan akan hilang.')) this.remove(); }">
        <div class="modal" style="width:90%; max-width:800px; max-height:90vh; overflow-y:auto">
            <div class="modal-header">
                <h2>Review Asesmen AI (Siswa: ${username})</h2>
                <button class="modal-close" onclick="if(confirm('Batalkan review?')) this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <p class="text-muted" style="margin-bottom:1rem">Berikut 20 soal buatan AI berdasarkan chat siswa. Anda dapat mengedit redaksi kalimat, kunci jawaban, dan pilihan ganda sebelum dikirimkan ke siswa.</p>
            
            <div id="review-questions-container">
                ${questionsHTML}
            </div>
            
            <div class="modal-actions" style="margin-top:1.5rem; justify-content:space-between">
                <button class="btn btn-outline" onclick="if(confirm('Batalkan review?')) this.closest('.modal-overlay').remove()">Batal</button>
                <button class="btn btn-primary" onclick="submitAssessmentReview('${username}')"><i class="fas fa-check-circle"></i> Simpan & Approve Siswa</button>
            </div>
        </div>
    </div>`;
}

async function submitAssessmentReview(username) {
    if (!confirm("Apakah Anda yakin soal ini sudah benar dan siap dikerjakan siswa?")) return;

    const finalQuestions = [];
    const qCount = window.tempReviewQuestions.length;

    for (let i = 0; i < qCount; i++) {
        finalQuestions.push({
            question: document.getElementById(`rev-q-${i}-text`).value,
            options: [
                document.getElementById(`rev-q-${i}-opt0`).value,
                document.getElementById(`rev-q-${i}-opt1`).value,
                document.getElementById(`rev-q-${i}-opt2`).value,
                document.getElementById(`rev-q-${i}-opt3`).value
            ],
            correct: parseInt(document.getElementById(`rev-q-${i}-correct`).value),
            type: document.getElementById(`rev-q-${i}-type`).value,
            explanation: document.getElementById(`rev-q-${i}-explanation`).value
        });
    }

    // 1. Simpan soal matang ke progress siswa
    const progress = getProgress(username);
    progress.generatedAssessment = finalQuestions;
    updateProgress(username, progress);

    // 2. Tandai sebagai Approved
    await saveApprovalForUser(username, { date: new Date().toISOString(), approvedBy: currentUser.username });

    document.querySelector('.modal-overlay').remove();
    renderAssessmentMgmt(document.getElementById('main-content'));
    alert(`Berhasil! Asesmen telah dikunci dan Tahap 3 terbuka untuk ${username}`);
}

// ---- BANK SOAL MANAGEMENT ----
let _bankSoalCache = [];

async function renderBankSoal(main) {
    main.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Memuat Bank Soal...</p></div>';

    try {
        const res = await fetch('/api/question-bank');
        const data = await res.json();
        _bankSoalCache = data.questions || [];
    } catch (err) {
        console.error(err);
        _bankSoalCache = [];
    }

    main.innerHTML = `
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">📚 Bank Soal</h3>
        </div>
        <div class="tabs">
            <button class="tab-button active" onclick="initBankSoalTab('list')">Daftar Soal (${_bankSoalCache.length})</button>
            <button class="tab-button" onclick="initBankSoalTab('upload')">Tambah / Upload Soal</button>
        </div>
        <div id="bank-soal-list-tab" class="tab-content active">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Tipe</th>
                            <th style="width:50%">Pertanyaan</th>
                            <th>Jawaban Benar</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${_bankSoalCache.map((q, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><span class="badge ${q.type === 'literasi' ? 'badge-info' : 'badge-warning'}">${q.type === 'literasi' ? 'Literasi' : 'Numerasi'}</span></td>
                                <td>${q.question.substring(0, 150)}${q.question.length > 150 ? '...' : ''}</td>
                                <td><strong>${String.fromCharCode(65 + q.correct)}</strong></td>
                                <td>
                                    <button class="btn btn-sm btn-danger" onclick="deleteBankSoal('${q._id}')"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada soal di bank soal.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
        <div id="bank-soal-upload-tab" class="tab-content">
            <div class="grid-2">
                <div>
                    <h4>📥 Upload Massal (Excel)</h4>
                    <p class="text-muted" style="font-size:0.9rem; margin-bottom:1rem;">Gunakan format Excel standar untuk mengupload ratusan soal sekaligus.</p>
                    <div class="upload-zone" onclick="document.getElementById('bank-soal-upload').click()">
                        <i class="fas fa-file-excel" style="color: #217346"></i>
                        <p>Klik untuk memilih file Excel (.xlsx)</p>
                        <input type="file" id="bank-soal-upload" accept=".xlsx" style="display:none" onchange="handleBankSoalUpload(event)">
                    </div>
                    <button class="btn btn-primary mt-2 w-100" onclick="downloadBankSoalTemplate()"><i class="fas fa-download"></i> Download Template Excel</button>
                </div>
                <div>
                    <h4>➕ Tambah Manual (1 Soal)</h4>
                    <form id="form-manual-soal" onsubmit="handleManualSoal(event)" style="display:flex; flex-direction:column; gap:0.8rem">
                        <div class="form-group"><label>Tipe Soal</label><select id="ms-type"><option value="literasi">Literasi</option><option value="numerasi">Numerasi</option></select></div>
                        <div class="form-group"><label>Pertanyaan / Stimulus</label><textarea id="ms-q" required rows="3" placeholder="Masukkan cerita/soal..."></textarea></div>
                        <div class="form-group"><label>Opsi A</label><input type="text" id="ms-a" required></div>
                        <div class="form-group"><label>Opsi B</label><input type="text" id="ms-b" required></div>
                        <div class="form-group"><label>Opsi C</label><input type="text" id="ms-c" required></div>
                        <div class="form-group"><label>Opsi D</label><input type="text" id="ms-d" required></div>
                        <div class="form-group"><label>Kunci Jawaban</label><select id="ms-correct"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select></div>
                        <div class="form-group"><label>Pembahasan</label><textarea id="ms-exp" required rows="2"></textarea></div>
                        <button type="submit" class="btn btn-success w-100"><i class="fas fa-save"></i> Simpan Soal</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

function initBankSoalTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const btn = document.querySelector(`.tab-button[onclick="initBankSoalTab('${tabName}')"]`);
    if (btn) btn.classList.add('active');

    document.getElementById(`bank-soal-${tabName}-tab`).classList.add('active');
}

function downloadBankSoalTemplate() {
    window.location.href = '/api/question-bank/template';
}

async function handleBankSoalUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
        alert('Format file harus .xlsx!');
        event.target.value = '';
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Mengupload dan memproses file Excel, mohon tunggu...</p></div>';

    try {
        const res = await fetch('/api/question-bank/upload', {
            method: 'POST',
            body: formData // Multer will parse this multipart/form-data
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message || 'Soal berhasil diimpor!');
            renderBankSoal(document.getElementById('main-content'));
        } else {
            alert(data.error || 'Gagal upload soal dari Excel.');
            renderBankSoal(document.getElementById('main-content'));
        }
    } catch (err) {
        alert('Server error saat upload excel.');
        renderBankSoal(document.getElementById('main-content'));
    }
}

async function handleManualSoal(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'Menyimpan...';

    const payload = {
        question: document.getElementById('ms-q').value,
        options: [
            document.getElementById('ms-a').value,
            document.getElementById('ms-b').value,
            document.getElementById('ms-c').value,
            document.getElementById('ms-d').value
        ],
        correct: parseInt(document.getElementById('ms-correct').value),
        explanation: document.getElementById('ms-exp').value,
        type: document.getElementById('ms-type').value,
        topic: 'Analisis Data',
        grade: '7 SMP',
        difficulty: 'HOTS'
    };

    try {
        const res = await fetch('/api/question-bank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Soal manual berhasil ditambahkan!');
            renderBankSoal(document.getElementById('main-content'));
        } else {
            const data = await res.json();
            alert(data.error || 'Gagal menambahkan soal.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Simpan Soal';
        }
    } catch (err) {
        alert('Server error.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Simpan Soal';
    }
}

async function deleteBankSoal(id) {
    if (!confirm('Hapus soal ini dari Bank Soal?')) return;
    try {
        const res = await fetch(`/api/question-bank/${id}`, { method: 'DELETE' });
        if (res.ok) {
            renderBankSoal(document.getElementById('main-content'));
        } else {
            alert('Gagal menghapus soal.');
        }
    } catch (err) {
        console.error(err);
        alert('Server error.');
    }
}

// ---- STUDENT ACCOUNT MANAGEMENT ----
function renderStudentAccounts(main) {
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');

    main.innerHTML = `
        <div class="flex justify-between items-center mb-2" style="flex-wrap:wrap;gap:0.5rem">
        <h3>Akun Siswa (${students.length})</h3>
        <div class="flex gap-1">
            <button class="btn btn-primary btn-sm" onclick="showAddStudentModal()"><i class="fas fa-plus"></i> Tambah Siswa</button>
            <button class="btn btn-success btn-sm" onclick="downloadExcelTemplate()"><i class="fas fa-download"></i> Template Excel</button>
            <button class="btn btn-warning btn-sm" onclick="document.getElementById('excel-upload').click()"><i class="fas fa-upload"></i> Upload Excel</button>
            <input type="file" id="excel-upload" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleExcelUpload(event)">
        </div>
    </div>
    <div class="card">
        <div class="table-container">
            <table>
                <thead><tr><th>Username</th><th>Nama</th><th>Kelas</th><th>Dibuat</th><th>Aksi</th></tr></thead>
                <tbody>
                    ${students.map(s => `<tr>
                        <td>${s.username}</td><td>${s.name}</td><td>${s.kelas || '-'}</td>
                        <td>${new Date(s.createdAt).toLocaleDateString('id-ID')}</td>
                        <td>
                            ${currentUser.role === 'admin' ? `<button class="btn btn-sm btn-danger" onclick="deleteUser('${s.username}')"><i class="fas fa-trash"></i></button>` : '<span class="text-muted">-</span>'}
                        </td>
                    </tr>`).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada siswa</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>
    <div id="modal-container"></div>`;
}

function showAddStudentModal() {
    document.getElementById('modal-container').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
    <div class="modal">
        <div class="modal-header"><h2>Tambah Siswa Baru</h2><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button></div>
        <div class="form-group"><label>Username</label><input type="text" id="new-student-username" placeholder="contoh: siswa001"></div>
        <div class="form-group"><label>Nama Lengkap</label><input type="text" id="new-student-name" placeholder="Nama lengkap siswa"></div>
        <div class="form-group"><label>Kelas</label><select id="new-student-kelas"><option value="7.6">7.6</option><option value="7.7">7.7</option><option value="7.8">7.8</option><option value="7.9">7.9</option><option value="7.10">7.10</option><option value="7.11">7.11</option></select></div>
        <div class="form-group"><label>Password Awal</label><input type="text" id="new-student-password" value="siswa123" placeholder="Password awal"></div>
        <div class="modal-actions">
            <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Batal</button>
            <button class="btn btn-primary" onclick="addStudentAccount()">Simpan</button>
        </div>
    </div>
    </div>`;
}

async function addStudentAccount() {
    const username = document.getElementById('new-student-username').value.trim();
    const name = document.getElementById('new-student-name').value.trim();
    const kelas = document.getElementById('new-student-kelas').value;
    const password = document.getElementById('new-student-password').value;

    if (!username || !name) { alert('Username dan nama wajib diisi!'); return; }

    try {
        const payload = { username, password: password || 'siswa123', name, role: 'siswa', kelas, mustChangePassword: true };
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            alert('Gagal menambah siswa. Username mungkin sudah ada.');
            return;
        }

        await syncUsers();
        document.querySelector('.modal-overlay').remove();
        renderStudentAccounts(document.getElementById('main-content'));
        alert('✅ Akun siswa berhasil ditambahkan!');
    } catch (err) {
        alert('Terjadi kesalahan server.');
    }
}

async function deleteUser(username) {
    if (currentUser.role !== 'admin') { alert('Hanya admin yang dapat menghapus akun!'); return; }
    if (!confirm(`Hapus akun ${username} ? `)) return;

    try {
        const res = await fetch(`/api/users/${username}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();

        await syncUsers();
        renderStudentAccounts(document.getElementById('main-content'));
    } catch (err) {
        alert('Gagal menghapus akun.');
    }
}

function downloadExcelTemplate() {
    // Generate CSV template
    const csv = 'username,nama,kelas,password\nsiswa001,Nama Siswa 1,7A,siswa123\nsiswa002,Nama Siswa 2,7B,siswa123';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_akun_siswa.csv';
    link.click();
}

function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function (e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { alert('File kosong atau format salah!'); return; }

        const newUsers = [];
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map(p => p.trim());
            if (parts.length >= 3) {
                const [username, name, kelas, password] = parts;
                if (username && name) {
                    newUsers.push({ username, password: password || 'siswa123', name, role: 'siswa', kelas: kelas || '7A', mustChangePassword: true });
                }
            }
        }

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUsers)
            });
            if (res.ok) {
                await syncUsers();
                alert(`✅ Sinkronisasi akun Excel selesai!`);
                renderStudentAccounts(document.getElementById('main-content'));
            } else {
                alert('Gagal upload siswa dari Excel.');
            }
        } catch (err) {
            alert('Server error sat upload excel.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}



// ---- PROFILE ----
function renderProfile(main) {
    main.innerHTML = `
    <div class="profile-card card">
        <div class="profile-photo-section">
            <div class="profile-photo" id="profile-photo-display">
                ${currentUser.photo ? `<img src="${currentUser.photo}" alt="Foto">` : '<i class="fas fa-user"></i>'}
                <div class="profile-photo-overlay" onclick="document.getElementById('photo-upload').click()">
                    <i class="fas fa-camera"></i> Ganti Foto
                </div>
            </div>
            <input type="file" id="photo-upload" accept="image/*" style="display:none" onchange="handlePhotoUpload(event)">
            <h2>${currentUser.name}</h2>
            <span class="badge badge-primary">${currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'guru' ? 'Guru' : 'Siswa'}</span>
            ${currentUser.kelas ? `<span class="badge badge-info ml-1">Kelas ${currentUser.kelas}</span>` : ''}
        </div>
        <div class="form-group"><label>Username</label><input type="text" value="${currentUser.username}" disabled></div>
        <div class="form-group"><label>Nama Lengkap</label><input type="text" id="profile-name" value="${currentUser.name}"></div>
        ${currentUser.role === 'siswa' ? `<div class="form-group"><label>Kelas</label><input type="text" value="${currentUser.kelas || '-'}" disabled></div>` : ''}
    <div style="border-top:1px solid var(--border-color);margin:1.5rem 0;padding-top:1.5rem">
            <h3 style="font-size:1rem;margin-bottom:1rem">🔑 Ganti Password</h3>
            <div class="form-group"><label>Password Lama</label><input type="password" id="profile-old-pwd" placeholder="Masukkan password lama"></div>
            <div class="form-group"><label>Password Baru</label><input type="password" id="profile-new-pwd" placeholder="Min. 6 karakter"></div>
        </div >
        <div class="flex gap-1">
            <button class="btn btn-primary" onclick="saveProfile()"><i class="fas fa-save"></i> Simpan Profil</button>
            <button class="btn btn-success" onclick="changeProfilePassword()"><i class="fas fa-key"></i> Ganti Password</button>
        </div>
        <div id="profile-msg" class="mt-2"></div>
    </div > `;
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 2MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const photoData = e.target.result;
        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username, name: currentUser.name, photo: photoData })
            });

            if (res.ok) {
                const data = await res.json();
                currentUser = data.user;
                await syncUsers();
                updateSidebar();
                updateTopbar();
                renderProfile(document.getElementById('main-content'));
            } else {
                alert('Gagal menyimpan foto ke server.');
            }
        } catch (err) {
            alert('Server Error menyimpan foto.');
        }
    };
    reader.readAsDataURL(file);
}

async function saveProfile() {
    const name = document.getElementById('profile-name').value.trim();
    if (!name) { alert('Nama tidak boleh kosong!'); return; }

    try {
        const res = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, name: name, photo: currentUser.photo })
        });

        if (res.ok) {
            const data = await res.json();
            currentUser = data.user;
            await syncUsers();
            updateSidebar();
            document.getElementById('profile-msg').innerHTML = '<div class="success-msg">✅ Profil berhasil disimpan!</div>';
        } else {
            alert('Gagal menyimpan profil.');
        }
    } catch (err) {
        alert('Server Error menyimpan profil.');
    }
}

async function changeProfilePassword() {
    const oldPwd = document.getElementById('profile-old-pwd').value;
    const newPwd = document.getElementById('profile-new-pwd').value;
    if (!oldPwd || !newPwd) { alert('Isi password lama dan baru!'); return; }
    if (oldPwd !== currentUser.password) { alert('Password lama salah!'); return; }
    if (newPwd.length < 6) { alert('Password baru minimal 6 karakter!'); return; }

    try {
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, newPassword: newPwd })
        });
        if (res.ok) {
            const data = await res.json();
            currentUser = data.user;
            await syncUsers();
            document.getElementById('profile-msg').innerHTML = '<div class="success-msg">✅ Password berhasil diganti!</div>';
            document.getElementById('profile-old-pwd').value = '';
            document.getElementById('profile-new-pwd').value = '';
        } else {
            alert('Gagal ganti password di server.');
        }
    } catch (err) {
        alert('Server error ganti password.');
    }
}
