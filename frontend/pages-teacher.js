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

    const classes = [...new Set(students.map(s => s.kelas || 'Tanpa Kelas'))];

    main.innerHTML = `
    <div style="margin-bottom:1.5rem">
        <h2 style="font-size:1.3rem;font-weight:800">Dashboard Laporan ${currentUser.role === 'admin' ? 'Administrator' : 'Guru'} <i class="fas fa-chart-line"></i></h2>
        <p class="text-muted">SMP Negeri 1 Balikpapan - Informatika</p>
    </div>
    <div class="grid-4">
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-users"></i></div><div class="stat-info"><h3>${students.length}</h3><p>Total Siswa</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h3>${passed}</h3><p>Lulus Asesmen</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-robot"></i></div><div class="stat-info"><h3>${readyForAssessment}</h3><p>Rekomendasi AI</p></div></div>
        <div class="stat-card"><div class="stat-icon red"><i class="fas fa-hourglass-half"></i></div><div class="stat-info"><h3>${students.length - total}</h3><p>Belum Asesmen</p></div></div>
    </div>

    <!-- Chart Section -->
    <div class="mt-2">
        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="card-title"><i class="fas fa-chart-pie"></i> Tingkat Pencapaian Literasi & Numerasi</h3>
                <select id="chart-class-filter" class="form-control" style="width:auto; margin-bottom:0; padding:0.2rem 0.5rem;" onchange="initDashboardCharts()">
                    <option value="all">Semua Kelas</option>
                    ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <div class="grid-2" style="align-items:center;">
                <div style="height: 350px; display: flex; justify-content: center; padding: 1rem;">
                    <canvas id="chart-attainment"></canvas>
                </div>
                <div style="padding: 2rem;">
                    <h4 class="text-muted mb-1">Keterangan:</h4>
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem;">
                        <div style="width:15px; height:15px; background:#4caf50; border-radius:3px;"></div>
                        <span><strong>Lulus:</strong> Siswa yang telah mencapai skor target pada asesmen Literasi & Numerasi.</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <div style="width:15px; height:15px; background:#f44336; border-radius:3px;"></div>
                        <span><strong>Perlu Penguatan:</strong> Siswa yang belum mencapai skor target atau belum menyelesaikan asesmen.</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card mt-2">
        <div class="card-header">
            <h3 class="card-title"><i class="fas fa-journal-whills"></i> Ringkasan Jurnal Harian</h3>
        </div>
        <div id="journal-summary-content">
            <!-- Populated by JS -->
        </div>
    </div>

    <div class="card mt-2">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div style="display:flex; align-items:center; gap:1rem;">
                <h3 class="card-title" style="margin-bottom:0;">📋 Status Progres Siswa</h3>
                <select id="progress-class-filter" class="form-control" style="width:auto; margin-bottom:0; padding:0.2rem 0.5rem;" onchange="filterDashboardProgress()">
                    <option value="all">Semua Kelas</option>
                    ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <button class="btn btn-warning btn-sm" onclick="resetSelectedProgress()" id="btn-reset-progress" style="display:none;"><i class="fas fa-undo"></i> Reset Pembelajaran (<span id="count-reset-selected">0</span>)</button>
        </div>
        <div class="table-container">
            <table>
                <thead><tr>
                    <th><input type="checkbox" id="check-all-progress" onchange="toggleAllProgress(this)"></th>
                    <th>Nama</th><th>Kelas</th><th>Tahap</th><th>Rekomendasi AI</th><th>Status Hasil</th>
                </tr></thead>
                <tbody>
                    ${students.map(s => {
        const p = getProgress(s.username);
        const r = results[s.username];
        const stage = p.tahap4Complete ? 'Selesai' : p.tahap3Complete ? 'Tahap 4' : p.tahap2Complete ? 'Tahap 3' : p.tahap1Complete ? 'Tahap 2' : 'Tahap 1';
        const badge = r ? (r.pass ? '<span class="badge badge-success">Lulus</span>' : '<span class="badge badge-danger">Tidak Lulus</span>') : '<span class="badge badge-warning">Proses</span>';
        const aiRec = p.tahap2Complete ? (p.isReady ? '<span class="text-success"><i class="fas fa-check-circle"></i> SIAP</span>' : '<span class="text-warning"><i class="fas fa-exclamation-triangle"></i> PERLU BIMBINGAN</span>') : '<span class="text-muted">-</span>';
        return `<tr>
                    <td><input type="checkbox" class="check-progress" value="${s.username}" onchange="updateResetBtn()"></td>
                    <td>${s.name}</td><td>${s.kelas || '-'}</td><td>${stage}</td><td>${aiRec}</td><td>${badge}</td>
                </tr>`;
    }).join('') || '<tr><td colspan="6" class="text-center text-muted">Belum ada siswa terdaftar</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>`;

    // Initialize Charts after rendering
    setTimeout(() => {
        initDashboardCharts();
        renderJournalSummary();
    }, 100);
}

function filterDashboardProgress() {
    const classFilter = document.getElementById('progress-class-filter').value.toLowerCase();
    const rows = document.querySelectorAll('.card:last-child table tbody tr');

    rows.forEach(row => {
        const studentClass = row.cells[2].innerText.toLowerCase();
        if (classFilter === 'all' || studentClass === classFilter) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// ---- RESET PROGRESS FUNCTIONS ----
function toggleAllProgress(source) {
    const checkboxes = document.querySelectorAll('.check-progress');
    checkboxes.forEach(cb => cb.checked = source.checked);
    updateResetBtn();
}

function updateResetBtn() {
    const checkedBoxes = document.querySelectorAll('.check-progress:checked');
    const btn = document.getElementById('btn-reset-progress');
    const countSpan = document.getElementById('count-reset-selected');

    if (checkedBoxes.length > 0) {
        btn.style.display = 'inline-block';
        countSpan.innerText = checkedBoxes.length;
    } else {
        btn.style.display = 'none';
        document.getElementById('check-all-progress').checked = false;
    }
}

async function resetSelectedProgress() {
    const checkedBoxes = document.querySelectorAll('.check-progress:checked');
    const usernames = Array.from(checkedBoxes).map(cb => cb.value);

    if (usernames.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin mereset pembelajaran untuk ${usernames.length} siswa terpilih? Mereka akan kembali ke Tahap 1 dan semua nilai (refleksi, asesmen) akan dihapus!`)) return;

    const btn = document.getElementById('btn-reset-progress');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mereset...';

    try {
        const res = await fetch('/api/progress/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames })
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message || 'Mereset pembelajaran berhasil.');
            await syncData(); // Sync progress from backend
            renderTeacherDashboard(document.getElementById('main-content'));
        } else {
            alert(data.error || 'Terjadi kesalahan saat mereset.');
        }
    } catch (err) {
        console.error('Error resetting progress:', err);
        alert('Server error saat mereset pembelajaran.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
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

    const progressData = getStudentProgress();

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
            <div>
                <h3 class="card-title">Hasil Penilaian Per Siswa</h3>
                <p class="text-muted" style="font-size:0.85rem; margin-top:0.2rem"><em><i class="fas fa-robot text-primary"></i> Semua Nilai Dianalisis AI</em></p>
            </div>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                <select id="results-class-filter" class="form-control" style="margin-bottom:0; width:auto; padding:0.4rem;" onchange="filterResultsByClass()">
                    <option value="all">Semua Kelas</option>
                    ${[...new Set(students.map(s => s.kelas || 'Tanpa Kelas'))].map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <input type="text" id="search-student-results" class="form-control" style="margin-bottom:0; width:180px; padding:0.4rem;" placeholder="Cari Nama..." onkeyup="filterResultsByClass()">
                <button id="btn-simulate-data" class="btn btn-warning btn-sm" onclick="triggerDataSimulation()" style="display:none;"><i class="fas fa-magic"></i> Simulasi Data</button>
                <button class="btn btn-danger btn-sm" onclick="triggerResetStage2()"><i class="fas fa-redo"></i> Reset Tahap 2</button>
                <button class="btn btn-warning btn-sm" id="btn-reset-stage3" style="display:none;" onclick="resetStage3Selected()"><i class="fas fa-undo"></i> Reset Tahap 3 (<span id="count-reset-stage3">0</span>)</button>
                <button class="btn btn-outline btn-sm" onclick="exportAllStagesToExcel()"><i class="fas fa-file-excel"></i> Excel</button>
            </div>
        </div>
        <div class="table-container">
            <table id="table-student-results">
                <thead>
                    <tr>
                        <th><input type="checkbox" id="check-all-results" onchange="toggleAllResults(this)"></th>
                        <th onclick="sortTable('table-student-results', 1)" style="cursor:pointer" title="Klik untuk mengurutkan">Nama Siswa <i class="fas fa-sort text-muted"></i></th>
                        <th onclick="sortTable('table-student-results', 2)" style="cursor:pointer" title="Klik untuk mengurutkan">Kelas <i class="fas fa-sort text-muted"></i></th>
                        <th onclick="sortTable('table-student-results', 3)" style="cursor:pointer; color:var(--info)" title="Klik untuk mengurutkan">Nilai Refleksi <br><small>(Tahap 2)</small> <i class="fas fa-sort text-muted"></i></th>
                        <th onclick="sortTable('table-student-results', 4)" style="cursor:pointer; color:var(--success)" title="Klik untuk mengurutkan">Nilai Asesmen <br><small>(Tahap 3)</small> <i class="fas fa-sort text-muted"></i></th>
                        <th onclick="sortTable('table-student-results', 5)" style="cursor:pointer; color:var(--primary)" title="Klik untuk mengurutkan">Nilai 7 Kebiasaan <br><small>(Tahap 4)</small> <i class="fas fa-sort text-muted"></i></th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(s => {
        const r = results[s.username];
        const p = progressData[s.username] || {};

        // ---- Tahap 2: Nilai Refleksi ----
        let tahap2Display = '<span class="text-muted" style="font-size:0.8rem">Belum Refleksi</span>';
        if (p.tahap2Score !== undefined && p.tahap2Score !== null) {
            const sc2 = parseFloat(p.tahap2Score);
            const sc2Str = sc2.toFixed(1);
            const color2 = sc2 >= 70 ? 'var(--success)' : sc2 >= 50 ? 'var(--warning)' : 'var(--danger)';
            tahap2Display = `<strong style="color:${color2}">${sc2Str}</strong><br><small class="text-muted">/ 100</small>`;
        } else if (p.tahap2Complete) {
            tahap2Display = '<span class="badge badge-warning">Selesai (skor lama)</span>';
        }

        // ---- Tahap 3: Nilai Asesmen ----
        let assessmentDisplay = '<span class="text-muted" style="font-size:0.8rem">Belum Asesmen</span>';
        if (r) {
            const sc3 = ((r.score / r.total) * 100);
            const sc3Str = sc3.toFixed(1);
            const color3 = sc3 >= 70 ? 'var(--success)' : sc3 >= 50 ? 'var(--warning)' : 'var(--danger)';
            assessmentDisplay = `<strong style="color:${color3}">${sc3Str}</strong><br><small class="text-muted">/ 100 &bull; ${r.pass ? '✅ Lulus' : '❌ Tidak Lulus'}</small>`;
        }

        // ---- Tahap 4: Nilai 7 Kebiasaan ----
        let tahap4Display = '<span class="text-muted" style="font-size:0.8rem">Belum</span>';
        if (p.tahap4Score !== undefined && p.tahap4Score !== null) {
            const sc4 = parseFloat(p.tahap4Score);
            const color4 = sc4 >= 70 ? 'var(--success)' : sc4 >= 50 ? 'var(--warning)' : 'var(--danger)';
            tahap4Display = `<strong style="color:${color4}">${sc4.toFixed(1)}</strong><br><small class="text-muted">/ 100</small>`;
        }

        return `<tr>
            <td><input type="checkbox" class="check-result" value="${s.username}" onchange="updateResultsResetBtn()"></td>
            <td>${s.name}</td>
            <td>${s.kelas || '-'}</td>
            <td>${tahap2Display}</td>
            <td>${assessmentDisplay}</td>
            <td>${tahap4Display}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="6" class="text-center text-muted">Belum ada data</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>`;
}

function filterResultsByClass() {
    const classFilter = document.getElementById('results-class-filter').value.toLowerCase();
    const searchFilter = document.getElementById('search-student-results').value.toLowerCase();
    const rows = document.querySelectorAll('#table-student-results tbody tr');

    rows.forEach(row => {
        if (row.cells.length < 3) return;
        // index 0 = checkbox, 1 = nama, 2 = kelas
        const studentName = row.cells[1].innerText.toLowerCase();
        const studentClass = row.cells[2].innerText.toLowerCase();
        
        const matchClass = (classFilter === 'all' || studentClass === classFilter);
        const matchSearch = studentName.includes(searchFilter);

        if (matchClass && matchSearch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function toggleAllResults(source) {
    const checkboxes = document.querySelectorAll('.check-result');
    checkboxes.forEach(cb => cb.checked = source.checked);
    updateResultsResetBtn();
}

function updateResultsResetBtn() {
    const checkedBoxes = document.querySelectorAll('.check-result:checked');
    const btn = document.getElementById('btn-reset-stage3');
    const countSpan = document.getElementById('count-reset-stage3');
    if (checkedBoxes.length > 0) {
        btn.style.display = 'inline-block';
        countSpan.innerText = checkedBoxes.length;
    } else {
        btn.style.display = 'none';
        const checkAll = document.getElementById('check-all-results');
        if (checkAll) checkAll.checked = false;
    }
}

async function resetStage3Selected() {
    const checkedBoxes = document.querySelectorAll('.check-result:checked');
    const usernames = Array.from(checkedBoxes).map(cb => cb.value);
    if (usernames.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin mereset Tahap 3 (Asesmen) untuk ${usernames.length} siswa terpilih?\nNilai asesmen dan persetujuan akan dihapus, siswa dapat mengikuti asesmen ulang.`)) return;

    const btn = document.getElementById('btn-reset-stage3');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mereset...';

    try {
        const res = await fetch('/api/progress/reset-stage3', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames })
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.message || 'Berhasil mereset Tahap 3.');
            await syncData();
            renderStudentResults(document.getElementById('main-content'));
        } else {
            alert(data.error || 'Terjadi kesalahan saat mereset.');
        }
    } catch (err) {
        console.error('Error resetting stage 3:', err);
        alert('Server error saat mereset Tahap 3.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}


// ---- EXPORT FUNCTIONS ----
function exportAllStagesToExcel() {
    const users = getUsers().filter(u => u.role === 'siswa');
    const progresses = getStudentProgress();
    const results = getAssessmentResults();

    // Table Header
    let tableHTML = '<table><thead><tr>' +
        '<th>Nama Siswa</th><th>Kelas</th>' +
        '<th style="background-color:#E2EFDA">Nilai Refleksi (Tahap 2)</th>' +
        '<th style="background-color:#E2EFDA">Pertanyaan Refleksi</th>' +
        '<th style="background-color:#E2EFDA">Jawaban Refleksi</th>' +
        '<th style="background-color:#FFF2CC">Total Nilai Asesmen (Tahap 3)</th>' +
        '<th style="background-color:#FFF2CC">Literasi (Benar/Total)</th>' +
        '<th style="background-color:#FFF2CC">Numerasi (Benar/Total)</th>' +
        '<th style="background-color:#FFF2CC">Status Asesmen</th>' +
        '<th style="background-color:#D9E1F2">Nilai 7 Kebiasaan (Tahap 4)</th>' +
        '<th style="background-color:#D9E1F2">Analisis Karakter AI</th>' +
        '<th style="background-color:#D9E1F2">Detail Evaluasi Kebiasaan</th>' +
        '</tr></thead><tbody>';

    let hasData = false;

    users.forEach(s => {
        const p = progresses[s.username] || {};
        const r = results[s.username];

        // Prepare Tahap 2 Data (multiple rows if multiple answers, but we'll try to flatten or pick first)
        let t2Score = p.tahap2Score ? parseFloat(p.tahap2Score).toFixed(2).replace('.', ',') : '-';
        let t2Questions = [];
        let t2Answers = [];
        if (p.reflectionAnswers && p.reflectionAnswers.length > 0) {
            hasData = true;
            p.reflectionAnswers.forEach(ans => {
                t2Questions.push(ans.question);
                t2Answers.push(ans.answer);
            });
        }

        // Prepare Tahap 3 Data
        let t3Score = '-', t3Lit = '-', t3Num = '-', t3Status = '-';
        if (r) {
            hasData = true;
            t3Score = ((r.score / r.total) * 100).toFixed(2).replace('.', ',');
            t3Lit = `${r.literasi}/${r.litTotal}`;
            t3Num = `${r.numerasi}/${r.numTotal}`;
            t3Status = r.pass ? 'Lulus' : 'Tidak Lulus';
        }

        // Prepare Tahap 4 Data
        let t4Score = p.tahap4Score ? parseFloat(p.tahap4Score).toFixed(2).replace('.', ',') : '-';
        let t4Summary = p.tahap4Analysis && p.tahap4Analysis.summary ? p.tahap4Analysis.summary : '-';
        let t4DetailsList = [];
        if (p.tahap4Complete && p.tahap4Details && p.tahap4Details.length > 0) {
            hasData = true;
            p.tahap4Details.forEach(det => {
                t4DetailsList.push(`[${det.habit}] Jwb: ${det.answer} | AI: ${det.feedback}`);
            });
        }

        // Find max rows needed for this student (based on reflection text arrays usually longest)
        let rowCount = Math.max(1, t2Questions.length, t4DetailsList.length);

        for (let i = 0; i < rowCount; i++) {
            const isFirst = i === 0;
            tableHTML += `<tr>
                <td>${isFirst ? s.name : ''}</td>
                <td>${isFirst ? (s.kelas || '-') : ''}</td>
                <td>${isFirst ? t2Score : ''}</td>
                <td>${t2Questions[i] || ''}</td>
                <td>${t2Answers[i] || ''}</td>
                <td>${isFirst ? t3Score : ''}</td>
                <td>${isFirst ? t3Lit : ''}</td>
                <td>${isFirst ? t3Num : ''}</td>
                <td>${isFirst ? t3Status : ''}</td>
                <td>${isFirst ? t4Score : ''}</td>
                <td>${isFirst ? t4Summary : ''}</td>
                <td>${t4DetailsList[i] || ''}</td>
            </tr>`;
        }
    });

    tableHTML += '</tbody></table>';

    if (!hasData) return alert('Belum ada data progres siswa untuk di-download.');
    downloadExcelFile(tableHTML, 'Laporan_Keseluruhan_Siswa');
}

function downloadExcelFile(tableHTML, filePrefix) {
    const blob = new Blob(['\ufeff' + tableHTML], { type: 'application/vnd.ms-excel;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filePrefix}_${new Date().getTime()}.xls`;
    link.click();
}

// ---- MATERIALS MANAGEMENT ----
function renderMaterials(main) {
    const materials = getMaterials();
    main.innerHTML = `
    <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <h3 class="card-title">📚 Materi Pembelajaran</h3>
            <select id="material-class-filter" class="form-control" style="width:auto; margin-bottom:0;" onchange="filterMaterialsByClass()">
                <option value="all">Semua Kelas</option>
                ${[...new Set(getUsers().filter(u => u.role === 'siswa').map(s => s.kelas || 'Tanpa Kelas'))].map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
        </div>
        
        <div style="padding:1.5rem; border-bottom:1px solid var(--border-color); background:var(--bg-input);">
            <h4 style="margin-bottom:1rem">📤 Upload Materi Baru</h4>
            <div class="form-group mb-2">
                <label>Target Kelas</label>
                <select id="material-target-kelas" class="form-control">
                    <option value="Semua Kelas">Semua Kelas</option>
                    ${[...new Set(getUsers().filter(u => u.role === 'siswa').map(s => s.kelas || 'Tanpa Kelas'))].map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <div class="upload-zone" onclick="document.getElementById('material-upload').click()">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Klik untuk upload materi (PDF, DOC, DOCX)</p>
                <p class="text-muted" style="font-size:0.8rem">Siswa kelas terpilih akan membaca materi ini di Tahap 1</p>
                <input type="file" id="material-upload" accept=".pdf,.doc,.docx" style="display:none" onchange="handleMaterialUpload(event)">
            </div>
        </div>

        <div class="material-list" id="material-list" style="padding:1rem">
            ${materials.map((m) => `
                <div class="material-item" data-kelas="${m.kelas || 'Semua Kelas'}">
                    <i class="fas ${m.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-word'}"></i>
                    <div style="flex:1">
                        <div style="font-weight:600">${m.name}</div>
                        <div style="font-size:0.75rem" class="text-muted">
                             Kelas: <span class="badge badge-info" style="font-size:0.65rem">${m.kelas || 'Semua Kelas'}</span> • 
                            ${new Date(m.date).toLocaleDateString('id-ID')}
                        </div>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="deleteMaterial('${m._id}')"><i class="fas fa-trash"></i></button>
                </div>`).join('') || '<p class="text-muted text-center mt-2">Belum ada materi diupload</p>'}
        </div>
    </div>`;
}

function filterMaterialsByClass() {
    const classFilter = document.getElementById('material-class-filter').value.toLowerCase();
    const items = document.querySelectorAll('.material-item');
    items.forEach(item => {
        const itemClass = item.dataset.kelas.toLowerCase();
        if (classFilter === 'all' || itemClass === classFilter) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
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
                contentDataUrl: e.target.result,
                kelas: document.getElementById('material-target-kelas').value
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
    const classes = [...new Set(students.map(s => s.kelas || 'Tanpa Kelas'))];

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
            <div class="card-header"><h3 class="card-title">📋 Info Asesmen & Pengaturan</h3></div>
            <div class="form-group mt-1">
                <label>Jumlah Soal Asesmen (Default: 50)</label>
                <input type="number" id="assessment-amount" value="${settings.questionAmount || 50}" min="5" max="100">
            </div>
            <button class="btn btn-primary btn-sm mt-1" onclick="saveAssessmentQuestionAmount()">
                <i class="fas fa-save"></i> Simpan Jumlah Soal
            </button>
            <p class="mt-1"><strong>Tipe:</strong> Proporsional Literasi & Numerasi</p>
            <p class="mt-1"><strong>KKM:</strong> 70%</p>
        </div>
    </div>
    <div class="card mt-2">
        <div class="card-header"><h3 class="card-title"><i class="fas fa-clock"></i> Penjadwalan Tahap 1 (Materi Pembelajaran)</h3></div>
        <p class="text-muted" style="font-size:0.9rem; margin-bottom:1rem; padding:0 1rem;">Atur waktu akses Tahap 1 untuk setiap kelas. Siswa tidak akan bisa masuk ke Tahap 1 di luar jam yang ditentukan.</p>
        <div class="table-container">
            <table id="table-class-schedules">
                <thead>
                    <tr>
                        <th>Kelas</th>
                        <th>Jam Mulai</th>
                        <th>Jam Selesai</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="schedule-body">
                    ${classes.map(c => {
                        const schedule = (settings.classSchedules || {})[c] || { start: '00:00', end: '23:59', active: false };
                        return `
                        <tr>
                            <td><strong>${c}</strong></td>
                            <td><input type="time" id="start-${c}" class="form-control" style="margin-bottom:0" value="${schedule.start}"></td>
                            <td><input type="time" id="end-${c}" class="form-control" style="margin-bottom:0" value="${schedule.end}"></td>
                            <td>
                                <select id="active-${c}" class="form-control" style="margin-bottom:0">
                                    <option value="true" ${schedule.active ? 'selected' : ''}>Aktif (Dibatasi)</option>
                                    <option value="false" ${!schedule.active ? 'selected' : ''}>Tidak Aktif (Bebas)</option>
                                </select>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="saveSchedule('${c}')"><i class="fas fa-save"></i> Simpan</button>
                            </td>
                        </tr>`;
                    }).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada kelas terdaftar</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>
    <div class="card mt-2">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div style="display:flex; align-items:center; gap:1rem;">
                <h3 class="card-title" style="margin-bottom:0;">✅ Persetujuan Siswa untuk Asesmen</h3>
                <select id="approval-class-filter" class="form-control" style="width:auto; margin-bottom:0; padding:0.2rem 0.5rem;" onchange="filterAssessmentApproval()">
                    <option value="all">Semua Kelas</option>
                    ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                <input type="text" id="search-assessment-approval" class="form-control" style="margin-bottom:0; width:200px; padding:0.4rem;" placeholder="Cari Siswa..." onkeyup="filterAssessmentApproval()">
                <button class="btn btn-success btn-sm" onclick="approveSelectedStudents()" id="btn-approve-bulk" style="display:none;"><i class="fas fa-check-double"></i> Setujui Masal (<span id="count-approve-selected">0</span>)</button>
            </div>
        </div>
        <div class="table-container">
            <table id="table-assessment-approval">
                <thead><tr>
                    <th><input type="checkbox" id="check-all-approvals" onchange="toggleAllApprovals(this)"></th>
                    <th onclick="sortTable('table-assessment-approval', 1)" style="cursor:pointer" title="Klik untuk mengurutkan">Nama <i class="fas fa-sort text-muted"></i></th>
                    <th onclick="sortTable('table-assessment-approval', 2)" style="cursor:pointer" title="Klik untuk mengurutkan">Kelas <i class="fas fa-sort text-muted"></i></th>
                    <th onclick="sortTable('table-assessment-approval', 3)" style="cursor:pointer" title="Klik untuk mengurutkan">Progres <i class="fas fa-sort text-muted"></i></th>
                    <th onclick="sortTable('table-assessment-approval', 4)" style="cursor:pointer" title="Klik untuk mengurutkan">Analisis AI (Kesiapan) <i class="fas fa-sort text-muted"></i></th>
                    <th>Aksi Approval</th>
                </tr></thead>
                <tbody>
                    ${students.map(s => {
        const p = getProgress(s.username);
        const approved = approvals[s.username];
        const hasReflection = p.tahap2Complete;
        const aiAnalysis = p.aiReadiness || 'Belum ada refleksi';
        const readyColor = p.isReady ? 'var(--success)' : hasReflection ? 'var(--warning)' : 'var(--text-muted)';

        return `<tr>
                            <td><input type="checkbox" class="check-approval" value="${s.username}" onchange="updateApprovalBtn()" ${!hasReflection ? 'disabled' : ''}></td>
                            <td>${s.name}</td><td>${s.kelas || '-'}</td>
                            <td>${hasReflection ? '<span class="badge badge-success">Refleksi Selesai</span>' : '<span class="badge badge-warning">Belum Refleksi</span>'}</td>
                            <td style="max-width:300px">
                                <div style="color:${readyColor}; font-weight:bold; margin-bottom:4px">
                                    ${p.isReady ? '✅ Direkomendasikan' : hasReflection ? '⚠️ Perlu Penguatan' : '⏳ Menunggu'}
                                </div>
                                <small class="text-muted d-block" style="line-height:1.2">${aiAnalysis}</small>
                            </td>
                            <td>
                                ${approved ? `<div style="display:flex; flex-direction:column; gap:0.5rem"><span class="badge badge-success">Disetujui</span> <button class="btn btn-sm btn-warning" onclick="approveStudent('${s.username}', this)" style="font-size:0.75rem"><i class="fas fa-plus-circle"></i> Setuju Ulang</button></div>` :
                hasReflection ? `<button class="btn btn-sm btn-success" onclick="approveStudent('${s.username}', this)"><i class="fas fa-plus-circle"></i> Setuju</button>` :
                    '<span class="text-muted">Menunggu Refleksi</span>'}
                            </td>
                        </tr>`;
    }).join('') || '<tr><td colspan="6" class="text-center text-muted">Belum ada siswa</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>`;
}

async function saveSchedule(kelas) {
    const start = document.getElementById(`start-${kelas}`).value;
    const end = document.getElementById(`end-${kelas}`).value;
    const active = document.getElementById(`active-${kelas}`).value === 'true';

    const settings = getAssessmentSettings();
    const schedules = settings.classSchedules || {};
    schedules[kelas] = { start, end, active };

    try {
        saveAssessmentSettings({ ...settings, classSchedules: schedules });
        alert(`✅ Jadwal kelas ${kelas} berhasil diperbarui!`);
    } catch (err) {
        alert('Gagal menyimpan jadwal.');
    }
}

function saveAssessmentDuration() {
    const dur = parseInt(document.getElementById('assessment-duration').value);
    if (dur < 10 || dur > 180) { alert('Durasi harus antara 10-180 menit!'); return; }
    saveAssessmentSettings({ ...getAssessmentSettings(), duration: dur });
    alert('✅ Durasi asesmen berhasil disimpan!');
}

function saveAssessmentQuestionAmount() {
    const amt = parseInt(document.getElementById('assessment-amount').value);
    if (amt < 5 || amt > 100) { alert('Jumlah soal harus antara 5-100!'); return; }
    saveAssessmentSettings({ ...getAssessmentSettings(), questionAmount: amt });
    alert(`✅ Jumlah soal asesmen disimpan: ${amt} soal!`);
}

function filterAssessmentApproval() {
    const classFilter = document.getElementById('approval-class-filter').value.toLowerCase();
    const searchFilter = document.getElementById('search-assessment-approval').value.toLowerCase();
    const rows = document.querySelectorAll('#table-assessment-approval tbody tr');

    rows.forEach(row => {
        if (row.cells.length < 3) return;
        const studentName = row.cells[1].innerText.toLowerCase();
        const studentClass = row.cells[2].innerText.toLowerCase();
        
        const matchClass = (classFilter === 'all' || studentClass === classFilter);
        const matchSearch = studentName.includes(searchFilter);

        if (matchClass && matchSearch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function toggleAllApprovals(source) {
    const checkboxes = document.querySelectorAll('.check-approval:not(:disabled)');
    checkboxes.forEach(cb => {
        const row = cb.closest('tr');
        if (row.style.display !== 'none') {
            cb.checked = source.checked;
        }
    });
    updateApprovalBtn();
}

function updateApprovalBtn() {
    const checkedBoxes = document.querySelectorAll('.check-approval:checked');
    const btn = document.getElementById('btn-approve-bulk');
    const countSpan = document.getElementById('count-approve-selected');

    if (checkedBoxes.length > 0) {
        btn.style.display = 'inline-block';
        countSpan.innerText = checkedBoxes.length;
    } else {
        btn.style.display = 'none';
        const checkAll = document.getElementById('check-all-approvals');
        if (checkAll) checkAll.checked = false;
    }
}

async function approveSelectedStudents() {
    const checkedBoxes = document.querySelectorAll('.check-approval:checked');
    const usernames = Array.from(checkedBoxes).map(cb => cb.value);

    if (usernames.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menyetujui asesmen untuk ${usernames.length} siswa terpilih?`)) return;

    const btn = document.getElementById('btn-approve-bulk');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    const amountInput = document.getElementById('assessment-amount');
    const amount = amountInput ? parseInt(amountInput.value) || 50 : 50;

    let successCount = 0;
    let failCount = 0;

    for (const username of usernames) {
        try {
            const progress = getProgress(username);
            const genRes = await fetch('/api/assessment/generate-from-bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, amount })
            });

            if (!genRes.ok) throw new Error("Gagal generate");
            
            const genData = await genRes.json();
            progress.generatedAssessment = genData.questions;
            updateProgress(username, progress);
            await saveApprovalForUser(username, { date: new Date().toISOString(), approvedBy: currentUser.username });
            successCount++;
        } catch (err) {
            console.error(`Gagal menyetujui ${username}:`, err);
            failCount++;
        }
    }

    alert(`Proses Selesai!\nBerhasil: ${successCount}\nGagal: ${failCount}`);
    renderAssessmentMgmt(document.getElementById('main-content'));
}


async function approveStudent(username, btnElement) {
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyiapkan...';
    }

    const amountInput = document.getElementById('assessment-amount');
    const amount = amountInput ? parseInt(amountInput.value) || 50 : 50;

    try {
        const progress = getProgress(username);

        // Langsung generate dari database
        const genRes = await fetch('/api/assessment/generate-from-bank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, amount })
        });

        if (!genRes.ok) {
            const errBody = await genRes.json();
            throw new Error(errBody.error || "Gagal mengambil soal dari Bank Soal");
        }
        const genData = await genRes.json();

        // Langsung setujui dan tambahkan soal
        progress.generatedAssessment = genData.questions;
        updateProgress(username, progress);

        // Tandai sebagai Approved
        await saveApprovalForUser(username, { date: new Date().toISOString(), approvedBy: currentUser.username });

        renderAssessmentMgmt(document.getElementById('main-content'));
        alert(`Berhasil! Asesmen sebanyak ${genData.questions.length} soal telah ditambahkan untuk ${username}`);

    } catch (err) {
        console.error(err);
        alert(err.message || 'Gagal menyiapkan soal dari Bank Soal!');
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = 'Setuju';
        }
    }
}

function showAssessmentReviewModal(username, originalQuestions) {
    // Pastikan array soal berjumlah sesuai (kalau kurang dari 10, kita tetap tampilkan apa adanya)

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
            <p class="text-muted" style="margin-bottom:1rem">Berikut <strong>${originalQuestions.length} soal</strong> yang dipilih dari Bank Soal. Anda dapat mengedit redaksi kalimat, kunci jawaban, dan pilihan ganda sebelum dikirimkan ke siswa.</p>
            
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

    let materials = [];
    try {
        const [res, resMat] = await Promise.all([
            fetch('/api/question-bank'),
            fetch('/api/materials')
        ]);
        const data = await res.json();
        const dataMat = await resMat.json();
        _bankSoalCache = data.questions || [];
        materials = dataMat.materials || [];
    } catch (err) {
        console.error(err);
        _bankSoalCache = [];
    }

    main.innerHTML = `
    <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <h3 class="card-title" style="margin-bottom:0;">📚 Bank Soal</h3>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                <select id="bank-soal-class-filter" class="form-control" style="margin-bottom:0; width:auto; padding:0.4rem;" onchange="filterBankSoalTable()">
                    <option value="all">Semua Kelas</option>
                    ${[...new Set(getUsers().filter(u => u.role === 'siswa').map(s => s.kelas || 'Tanpa Kelas'))].map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <input type="text" id="search-bank-soal" class="form-control" style="margin-bottom:0; width:250px; padding:0.4rem;" placeholder="Cari Pertanyaan/Tipe..." onkeyup="filterBankSoalTable()">
            </div>
        </div>
        <div class="tabs">
            <button class="tab-button active" onclick="initBankSoalTab('list')">Daftar Soal (${_bankSoalCache.length})</button>
            <button class="tab-button" onclick="initBankSoalTab('upload')">Tambah / Upload Soal</button>
        </div>
        <div id="bank-soal-list-tab" class="tab-content active">
            <div style="margin-bottom: 0.5rem; display: flex; justify-content: flex-end;">
                <button class="btn btn-danger btn-sm" id="btn-bulk-delete-soal" style="display:none;" onclick="bulkDeleteBankSoal()"><i class="fas fa-trash"></i> Hapus Terpilih (<span id="count-selected-soal">0</span>)</button>
            </div>
            <div class="table-container">
                <table id="table-bank-soal">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="check-all-bank-soal" onchange="toggleAllBankSoal(this)"></th>
                            <th>No.</th>
                            <th>Tipe</th>
                            <th style="width:50%">Pertanyaan</th>
                            <th>Kelas</th>
                            <th>Jawaban Benar</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${_bankSoalCache.map((q, index) => `
                            <tr>
                                <td><input type="checkbox" class="check-bank-soal" value="${q._id}" onchange="updateBankSoalDeleteBtn()"></td>
                                <td>${index + 1}</td>
                                <td><span class="badge ${q.type === 'literasi' ? 'badge-info' : 'badge-warning'}">${q.type === 'literasi' ? 'Literasi' : 'Numerasi'}</span></td>
                                <td>${q.question.substring(0, 150)}${q.question.length > 150 ? '...' : ''}</td>
                                <td><span class="badge badge-info">${q.kelas || 'Semua Kelas'}</span></td>
                                <td><strong>${String.fromCharCode(65 + q.correct)}</strong></td>
                                <td>
                                    <div class="flex gap-1">
                                        <button class="btn btn-sm btn-outline" onclick="editBankSoal('${q._id}')"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteBankSoal('${q._id}')"><i class="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="7" class="text-center text-muted">Belum ada soal di bank soal.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
        <div id="bank-soal-upload-tab" class="tab-content">
            <div class="grid-2">
                <div>
                    <h4>📥 Upload Massal (Excel)</h4>
                    <p class="text-muted" style="font-size:0.9rem; margin-bottom:1rem;">Gunakan format Excel standar untuk mengupload ratusan soal sekaligus.</p>
                    <div class="form-group mb-2">
                        <label><i class="fas fa-school"></i> Tujuan Kelas (Excel)</label>
                        <select id="excel-upload-kelas" class="form-control">
                            <option value="Semua Kelas">Semua Kelas</option>
                            ${[...new Set(getUsers().filter(u => u.role === 'siswa').map(s => s.kelas || 'Tanpa Kelas'))].map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                        <small class="text-muted">Soal yang diupload akan ditetapkan untuk kelas ini. Kolom "Kelas" di Excel (jika ada) akan diabaikan dan diganti dengan pilihan di atas.</small>
                    </div>
                    <div class="upload-zone" onclick="document.getElementById('bank-soal-upload').click()">
                        <i class="fas fa-file-excel" style="color: #217346"></i>
                        <p>Klik untuk memilih file Excel (.xlsx)</p>
                        <input type="file" id="bank-soal-upload" accept=".xlsx" style="display:none" onchange="handleBankSoalUpload(event)">
                    </div>
                    <button class="btn btn-primary mt-2 w-100" onclick="downloadBankSoalTemplate()"><i class="fas fa-download"></i> Download Template Excel</button>
                    
                    <hr style="margin: 1rem 0;">

                    <h4>📝 Upload dari Microsoft Word</h4>
                    <p class="text-muted" style="font-size:0.9rem; margin-bottom:1rem;">Upload soal berformat .docx dengan penomoran standar dan abjad untuk pilihan ganda.</p>
                    <div class="form-group mb-2">
                        <label><i class="fas fa-school"></i> Tujuan Kelas (Word)</label>
                        <select id="word-upload-kelas" class="form-control">
                            <option value="Semua Kelas">Semua Kelas</option>
                            ${[...new Set(getUsers().filter(u => u.role === 'siswa').map(s => s.kelas || 'Tanpa Kelas'))].map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                        <small class="text-muted">Semua soal dari file Word ini akan ditetapkan untuk kelas yang dipilih.</small>
                    </div>
                    <div class="upload-zone" onclick="document.getElementById('bank-soal-word-upload').click()">
                        <i class="fas fa-file-word" style="color: #2b579a; font-size: 2rem;"></i>
                        <p>Klik untuk memilih file Word (.docx)</p>
                        <input type="file" id="bank-soal-word-upload" accept=".docx" style="display:none" onchange="handleBankSoalWordUpload(event)">
                    </div>
                    <button class="btn btn-secondary mt-2 w-100" onclick="window.location.href='/api/question-bank/template-word'"><i class="fas fa-download"></i> Download Template Word</button>

                    <hr style="margin: 2rem 0;">
                    
                    <h4>🤖 Buat Soal Otomatis (AI)</h4>
                    <p class="text-muted" style="font-size:0.9rem; margin-bottom:1rem;">Nara-AI akan mencoba membuat soal secara otomatis berdasarkan Tujuan Pembelajaran yang Anda berikan.</p>
                    <div class="form-group mb-2">
                        <label>Jumlah Soal (Maks: 100)</label>
                        <input type="number" id="ai-question-amount" class="form-control" min="1" max="100" value="10">
                    </div>
                    <div class="form-group mb-2">
                            <label>Pilih Tipe Soal</label>
                            <select id="ai-indicator-type" class="form-control" onchange="const type = this.value; document.getElementById('group-literasi-indicator').style.display = type === 'literasi' ? 'block' : 'none'; document.getElementById('group-numerasi-indicator').style.display = type === 'numerasi' ? 'block' : 'none';">
                                <option value="literasi">Literasi</option>
                                <option value="numerasi">Numerasi</option>
                            </select>
                        </div>
                        <div class="form-group mb-2" id="group-literasi-indicator">
                            <label>Indikator Literasi</label>
                            <select id="ai-literasi-indicator" class="form-control">
                                <option value="Level Kognitif">Level Kognitif</option>
                                <option value="Menemukan Informasi">Menemukan Informasi</option>
                                <option value="Intepretasi dan integrasi">Intepretasi dan integrasi</option>
                                <option value="Evaluasi dan Refleksi">Evaluasi dan Refleksi</option>
                            </select>
                        </div>
                        <div class="form-group mb-2" id="group-numerasi-indicator" style="display:none;">
                            <label>Indikator Numerasi</label>
                            <select id="ai-numerasi-indicator" class="form-control">
                                <option value="Bilangan">Bilangan</option>
                                <option value="Geometri dan Pengukuran">Geometri dan Pengukuran</option>
                                <option value="Aljabar">Aljabar</option>
                                <option value="Data dan Ketidakpastian">Data dan Ketidakpastian</option>
                            </select>
                        </div>
                    <div class="form-group mb-2">
                        <label>Untuk Kelas</label>
                        <select id="ai-kelas" class="form-control">
                            <option value="Semua Kelas">Semua Kelas</option>
                            ${[...new Set(getUsers().filter(u => u.role === 'siswa').map(s => s.kelas || 'Tanpa Kelas'))].map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Jumlah Tujuan Pembelajaran (Maks: 10)</label>
                        <input type="number" id="ai-objective-count" min="1" max="10" value="1" onchange="renderObjectiveInputs()" oninput="renderObjectiveInputs()">
                    </div>
                    <div id="ai-objectives-container" style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem;">
                        <input type="text" class="form-control ai-objective-input" placeholder="Tujuan Pembelajaran 1..." required>
                    </div>
                    <button class="btn btn-success w-100" id="btn-generate-ai" onclick="generateBankSoalAI()"><i class="fas fa-magic"></i> Buat Soal Otomatis</button>

                    <hr style="margin: 2rem 0;">
                    
                    <h4>📄 Buat Soal dari Materi</h4>
                    <p class="text-muted" style="font-size:0.9rem; margin-bottom:1rem;">Nara-AI akan membaca materi yang telah Anda upload dan membuat soal berdasarkan isi materi tersebut.</p>
                    <div class="form-group mb-2">
                        <label>Jumlah Soal (Maks: 100)</label>
                        <input type="number" id="ai-material-amount" class="form-control" min="1" max="100" value="10">
                    </div>
                    <div class="form-group mb-2">
                        <label>Untuk Kelas</label>
                        <select id="ai-material-kelas" class="form-control">
                            <option value="Semua Kelas">Semua Kelas</option>
                            ${[...new Set(getUsers().filter(u => u.role === 'siswa').map(s => s.kelas || 'Tanpa Kelas'))].map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group mb-2">
                        <label>Pilih Materi</label>
                        <select id="ai-material-id" class="form-control">
                            <option value="">-- Pilih Materi --</option>
                            ${materials.map(m => `<option value="${m._id}">${m.name}</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn btn-primary w-100" id="btn-generate-material" onclick="generateBankSoalFromMaterial()"><i class="fas fa-file-alt"></i> Buat Soal dari Materi</button>

                </div>
                <div>
                    <h4>➕ Tambah Manual (1 Soal)</h4>
                    <form id="form-manual-soal" onsubmit="handleManualSoal(event)" style="display:flex; flex-direction:column; gap:0.8rem">
                        <div class="form-group"><label>Tipe Soal</label><select id="ms-type"><option value="literasi">Literasi</option><option value="numerasi">Numerasi</option></select></div>
                        <div class="form-group">
                            <label>Pertanyaan / Stimulus (Bisa Paste Gambar di sini)</label>
                            <textarea id="ms-q" required rows="4" placeholder="Masukkan cerita/soal... Tip: Paste gambar langsung ke sini!" onpaste="handlePasteImage(event, 'ms-image-preview', 'manual')"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Gambar Soal (Opsional)</label>
                            <input type="file" id="ms-image-input" accept="image/*" onchange="previewManualImage(this)" class="form-control">
                            <div id="ms-image-preview" class="mt-1"></div>
                        </div>
                        <div class="form-group"><label>Opsi A</label><input type="text" id="ms-a" required></div>
                        <div class="form-group"><label>Opsi B</label><input type="text" id="ms-b" required></div>
                        <div class="form-group"><label>Opsi C</label><input type="text" id="ms-c" required></div>
                        <div class="form-group"><label>Opsi D</label><input type="text" id="ms-d" required></div>
                        <div class="form-group"><label>Kunci Jawaban</label><select id="ms-correct"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select></div>
                        <div class="form-group"><label>Pembahasan</label><textarea id="ms-exp" required rows="2"></textarea></div>
                        <div class="form-group"><label>Untuk Kelas</label>
                            <select id="ms-kelas" class="form-control">
                                <option value="Semua Kelas">Semua Kelas</option>
                                ${[...new Set(getUsers().filter(u => u.role === 'siswa').map(s => s.kelas || 'Tanpa Kelas'))].map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <button type="submit" class="btn btn-success w-100"><i class="fas fa-save"></i> Simpan Soal</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

function renderObjectiveInputs() {
    const countInput = document.getElementById('ai-objective-count');
    let count = parseInt(countInput.value) || 1;
    if (count > 10) { count = 10; countInput.value = 10; }
    if (count < 1) { count = 1; countInput.value = 1; }

    const container = document.getElementById('ai-objectives-container');
    let html = '';
    for (let i = 1; i <= count; i++) {
        html += `<input type="text" class="form-control ai-objective-input" placeholder="Tujuan Pembelajaran ${i}..." required>`;
    }
    container.innerHTML = html;
}

async function generateBankSoalAI() {
    const inputs = document.querySelectorAll('.ai-objective-input');
    const objectives = [];
    inputs.forEach(inp => {
        if (inp.value.trim() !== '') objectives.push(inp.value.trim());
    });

    if (objectives.length === 0) {
        alert('Harap isi minimal 1 Tujuan Pembelajaran.');
        return;
    }

    const indicatorType = document.getElementById('ai-indicator-type') ? document.getElementById('ai-indicator-type').value : null;
    const indicatorValue = indicatorType === 'literasi' ? document.getElementById('ai-literasi-indicator').value : (indicatorType === 'numerasi' ? document.getElementById('ai-numerasi-indicator').value : null);
    const kelas = document.getElementById('ai-kelas') ? document.getElementById('ai-kelas').value : 'Semua Kelas';

    const btn = document.getElementById('btn-generate-ai');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sedang Membuat Soal... (Bisa memakan waktu 1-2 menit)';

    try {
        const res = await fetch('/api/question-bank/generate-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ objectives: objectives, amount: parseInt(document.getElementById('ai-question-amount').value) || 10, indicatorType: indicatorType, indicatorValue: indicatorValue, kelas: kelas })
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message || 'Soal otomatis berhasil dibuat!');

            // Auto download excel
            if (data.excelData) {
                try {
                    const byteCharacters = atob(data.excelData);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'Soal_AI_Generated.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } catch (e) {
                    console.error("Gagal mendownload otomatis Excel:", e);
                }
            }

            renderBankSoal(document.getElementById('main-content'));
        } else {
            alert(data.error || 'Gagal membuat soal dari AI.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-magic"></i> Buat Soal Otomatis';
        }
    } catch (err) {
        console.error('Error in generateBankSoalAI:', err);
        alert('Server error saat membuat soal menggunakan AI.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> Buat Soal Otomatis';
    }
}

async function generateBankSoalFromMaterial() {
    const materialId = document.getElementById('ai-material-id').value;
    if (!materialId) {
        alert('Harap pilih materi terlebih dahulu.');
        return;
    }

    const indicatorType = document.getElementById('ai-indicator-type') ? document.getElementById('ai-indicator-type').value : null;
    const indicatorValue = indicatorType === 'literasi' ? document.getElementById('ai-literasi-indicator').value : (indicatorType === 'numerasi' ? document.getElementById('ai-numerasi-indicator').value : null);
    const kelas = document.getElementById('ai-material-kelas') ? document.getElementById('ai-material-kelas').value : 'Semua Kelas';

    const btn = document.getElementById('btn-generate-material');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sedang Membaca Materi & Membuat Soal... (1-2 menit)';

    try {
        const res = await fetch('/api/question-bank/generate-from-material', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ materialId, amount: parseInt(document.getElementById('ai-material-amount').value) || 10, indicatorType, indicatorValue, kelas })
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message || 'Soal berhasil dibuat dari materi!');

            if (data.excelData) {
                try {
                    const byteCharacters = atob(data.excelData);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'Soal_Materi_Generated.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } catch (e) {
                    console.error("Gagal mendownload otomatis Excel:", e);
                }
            }

            renderBankSoal(document.getElementById('main-content'));
        } else {
            alert(data.error || 'Gagal membuat soal dari materi.');
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    } catch (err) {
        console.error('Error in generateBankSoalFromMaterial:', err);
        alert('Server error saat membuat soal dari materi.');
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
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

    const kelasEl = document.getElementById('excel-upload-kelas');
    const kelas = kelasEl ? kelasEl.value : 'Semua Kelas';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('kelas', kelas);

    const main = document.getElementById('main-content');
    main.innerHTML = `<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Mengupload dan memproses file Excel untuk kelas <strong>${kelas}</strong>, mohon tunggu...</p></div>`;

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

async function handleBankSoalWordUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
        alert('Format file harus .docx!');
        event.target.value = '';
        return;
    }

    const kelasEl = document.getElementById('word-upload-kelas');
    const kelas = kelasEl ? kelasEl.value : 'Semua Kelas';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('kelas', kelas);

    const main = document.getElementById('main-content');
    main.innerHTML = `<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Memproses file Word (.docx) untuk kelas <strong>${kelas}</strong>, mohon tunggu...</p></div>`;

    try {
        const res = await fetch('/api/question-bank/upload-word', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (res.ok) {
            alert(`Soal berhasil diimpor untuk kelas ${kelas}! Total: ${data.count} soal.`);
            renderBankSoal(document.getElementById('main-content'));
        } else {
            alert(data.error || 'Gagal upload soal dari Word.');
            renderBankSoal(document.getElementById('main-content'));
        }
    } catch (err) {
        alert('Server error saat upload word.');
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
        kelas: document.getElementById('ms-kelas') ? document.getElementById('ms-kelas').value : 'Semua Kelas',
        topic: 'Analisis Data',
        grade: '7 SMP',
        difficulty: 'HOTS',
        image: window.tempManualImage || null
    };

    try {
        const res = await fetch('/api/question-bank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Soal manual berhasil ditambahkan!');
            window.tempManualImage = null; // Reset image cache
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

function filterBankSoalTable() {
    const classFilter = document.getElementById('bank-soal-class-filter').value.toLowerCase();
    const searchFilter = document.getElementById('search-bank-soal').value.toLowerCase();
    const rows = document.querySelectorAll('#table-bank-soal tbody tr');

    rows.forEach(row => {
        if (row.cells.length < 5) return; // Skip empty message rows
        const rowClass = row.cells[4].innerText.toLowerCase();
        let matchClass = (classFilter === 'all' || rowClass === classFilter || rowClass === 'semua kelas');

        let matchSearch = false;
        for (let j = 0; j < row.cells.length; j++) {
            if (row.cells[j].innerText.toLowerCase().includes(searchFilter)) {
                matchSearch = true;
                break;
            }
        }

        if (matchClass && matchSearch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function toggleAllBankSoal(source) {
    const checkboxes = document.querySelectorAll('.check-bank-soal');
    checkboxes.forEach(cb => cb.checked = source.checked);
    updateBankSoalDeleteBtn();
}

function updateBankSoalDeleteBtn() {
    const checkedBoxes = document.querySelectorAll('.check-bank-soal:checked');
    const btn = document.getElementById('btn-bulk-delete-soal');
    const countSpan = document.getElementById('count-selected-soal');

    if (checkedBoxes.length > 0) {
        btn.style.display = 'inline-block';
        countSpan.innerText = checkedBoxes.length;
    } else {
        btn.style.display = 'none';
        const checkAll = document.getElementById('check-all-bank-soal');
        if (checkAll) checkAll.checked = false;
    }
}

async function bulkDeleteBankSoal() {
    const checkedBoxes = document.querySelectorAll('.check-bank-soal:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) return;
    if (!confirm(`Hapus permanen ${ids.length} soal terpilih dari Bank Soal?`)) return;

    const btn = document.getElementById('btn-bulk-delete-soal');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus...';

    try {
        const res = await fetch('/api/question-bank/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`Berhasil menghapus ${data.count} soal.`);
            renderBankSoal(document.getElementById('main-content'));
        } else {
            alert(data.error || 'Gagal menghapus soal terpilih.');
        }
    } catch (err) {
        console.error('Error bulk deleting question bank:', err);
        alert('Server error saat menghapus soal.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

let currentStudentAccountPage = 1;
const studentsPerPage = 20;

function changeStudentPage(direction) {
    currentStudentAccountPage += direction;
    renderStudentAccounts(document.getElementById('main-content'));
}

// ---- STUDENT ACCOUNT MANAGEMENT ----
function renderStudentAccounts(main) {
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');

    const totalPages = Math.ceil(students.length / studentsPerPage) || 1;
    if (currentStudentAccountPage > totalPages) currentStudentAccountPage = totalPages;
    if (currentStudentAccountPage < 1) currentStudentAccountPage = 1;

    const startIndex = (currentStudentAccountPage - 1) * studentsPerPage;
    const paginatedStudents = students.slice(startIndex, startIndex + studentsPerPage);

    main.innerHTML = `
        <div class="flex justify-between items-center mb-2" style="flex-wrap:wrap;gap:0.5rem">
        <h3>Akun Siswa (${students.length})</h3>
        <div class="flex gap-1" style="align-items:center;">
            <input type="text" id="search-student-accounts" class="form-control" style="margin-bottom:0; width:200px; padding:0.4rem;" placeholder="Cari Siswa/Kelas/Username..." onkeyup="filterTable('search-student-accounts', 'table-student-accounts')">
            ${currentUser.role === 'admin' ? `<button class="btn btn-danger btn-sm" onclick="bulkDeleteStudents()" id="btn-bulk-delete" style="display:none;"><i class="fas fa-trash"></i> Hapus Terpilih (<span id="count-selected">0</span>)</button>` : ''}
            <button class="btn btn-primary btn-sm" onclick="showAddStudentModal()"><i class="fas fa-plus"></i> Tambah Siswa</button>
            <button class="btn btn-success btn-sm" onclick="downloadExcelTemplate()"><i class="fas fa-download"></i> Template Excel</button>
            <button class="btn btn-warning btn-sm" onclick="document.getElementById('excel-upload').click()"><i class="fas fa-upload"></i> Upload Excel</button>
            <input type="file" id="excel-upload" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleExcelUpload(event)">
        </div>
    </div>
    <div class="card">
        <div class="table-container">
            <table id="table-student-accounts">
                <thead>
                    <tr>
                        ${currentUser.role === 'admin' ? `<th><input type="checkbox" id="check-all-students" onchange="toggleAllStudents(this)"></th>` : ''}
                        <th>Username</th><th>Nama</th><th>Kelas</th><th>Dibuat</th><th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedStudents.map(s => `<tr>
                        ${currentUser.role === 'admin' ? `<td><input type="checkbox" class="check-student" value="${s.username}" onchange="updateBulkDeleteBtn()"></td>` : ''}
                        <td>${s.username}</td><td>${s.name}</td><td>${s.kelas || '-'}</td>
                        <td>${new Date(s.createdAt).toLocaleDateString('id-ID')}</td>
                        <td>
                            <div class="flex gap-1">
                                <button class="btn btn-sm btn-warning" onclick="resetStudentPassword('${s.username}')" title="Reset Password"><i class="fas fa-key"></i></button>
                                ${currentUser.role === 'admin' ? `<button class="btn btn-sm btn-danger" onclick="deleteUser('${s.username}')"><i class="fas fa-trash"></i></button>` : ''}
                            </div>
                        </td>
                    </tr>`).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada siswa</td></tr>'}
                </tbody>
            </table>
        </div>
        
        <!-- Pagination Controls -->
        ${totalPages > 1 ? `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; padding: 0.5rem; flex-wrap:wrap; gap:1rem;">
            <div class="text-muted" style="font-size: 0.9rem;">
                Menampilkan ${startIndex + 1} - ${Math.min(startIndex + studentsPerPage, students.length)} dari total ${students.length} Akun
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
                <button class="btn btn-outline btn-sm" onclick="changeStudentPage(-1)" ${currentStudentAccountPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Sebelumnya
                </button>
                <div style="background:var(--bg-color); padding:0.25rem 0.75rem; border-radius:0.5rem; border:1px solid var(--border-color); font-weight:bold;">
                    Halaman ${currentStudentAccountPage} / ${totalPages}
                </div>
                <button class="btn btn-outline btn-sm" onclick="changeStudentPage(1)" ${currentStudentAccountPage === totalPages ? 'disabled' : ''}>
                    Selanjutnya <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
        ` : ''}
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

async function resetStudentPassword(username) {
    const newPassword = prompt(`Masukkan password baru untuk siswa ${username}:`, "siswa123");
    if (!newPassword) return;
    if (newPassword.length < 4) {
        alert("Password terlalu pendek! Minimal 4 karakter.");
        return;
    }

    try {
        const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, newPassword })
        });

        if (res.ok) {
            alert(`✅ Password untuk ${username} berhasil direset! Siswa akan diminta mengganti password saat login berikutnya.`);
            await syncUsers();
            renderStudentAccounts(document.getElementById('main-content'));
        } else {
            const data = await res.json();
            alert(`❌ Gagal reset password: ${data.error}`);
        }
    } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan server saat reset password.');
    }
}

function toggleAllStudents(source) {
    const checkboxes = document.querySelectorAll('.check-student');
    checkboxes.forEach(cb => cb.checked = source.checked);
    updateBulkDeleteBtn();
}

function updateBulkDeleteBtn() {
    const checkboxes = document.querySelectorAll('.check-student:checked');
    const btn = document.getElementById('btn-bulk-delete');
    const countSpan = document.getElementById('count-selected');
    if (btn && countSpan) {
        if (checkboxes.length > 0) {
            btn.style.display = 'inline-block';
            countSpan.textContent = checkboxes.length;
        } else {
            btn.style.display = 'none';
        }
    }
}

async function bulkDeleteStudents() {
    if (currentUser.role !== 'admin') { alert('Hanya admin yang dapat menghapus akun!'); return; }
    const checkboxes = document.querySelectorAll('.check-student:checked');
    const usernames = Array.from(checkboxes).map(cb => cb.value);

    if (usernames.length === 0) return;
    if (!confirm(`Hapus ${usernames.length} siswa terpilih secara permanen?`)) return;

    try {
        const res = await fetch('/api/users/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Server Error');

        await syncUsers();
        alert(data.message || 'Siswa berhasil dihapus.');
        // If current page is empty after delete, go back 1 page
        const newTotal = getUsers().filter(u => u.role === 'siswa').length;
        const totalPages = Math.ceil(newTotal / studentsPerPage) || 1;
        if (currentStudentAccountPage > totalPages) currentStudentAccountPage = totalPages;

        renderStudentAccounts(document.getElementById('main-content'));
    } catch (err) {
        alert(err.message || 'Gagal menghapus banyak akun sekaligus.');
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

async function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
        alert('Format file harus .xlsx, .xls, atau .csv!');
        event.target.value = '';
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const main = document.getElementById('main-content');
    const originalContent = main.innerHTML;
    main.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Mengupload dan memproses file Excel, mohon tunggu...</p></div>';

    try {
        const res = await fetch('/api/users/upload', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            await syncUsers();
            alert(data.message || '✅ Akun siswa berhasil diimpor!');
            renderStudentAccounts(document.getElementById('main-content'));
        } else {
            alert(data.error || 'Gagal upload siswa dari Excel.');
            main.innerHTML = originalContent; // Restore if failed or re-render
            renderStudentAccounts(document.getElementById('main-content'));
        }
    } catch (err) {
        console.error(err);
        alert('Server error saat upload excel.');
        renderStudentAccounts(document.getElementById('main-content'));
    }

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

// ---- MONITORING STATUS SISWA ----
async function renderMonitoring(main) {
    main.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Memuat status siswa...</p></div>';

    try {
        await syncUsers();
    } catch (e) {
        console.error("Gagal sync user untuk monitoring", e);
    }

    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');

    const now = Date.now();
    let onlineCount = 0;

    // threshold: 2 minutes
    const onlineThreshold = 2 * 60 * 1000;

    const studentStatus = students.map(s => {
        const lastSeenTime = s.lastSeen ? new Date(s.lastSeen).getTime() : 0;
        const isOnline = (now - lastSeenTime) <= onlineThreshold;
        if (isOnline) onlineCount++;

        let timeStr = 'Belum pernah login';
        if (lastSeenTime > 0) {
            const diffMin = Math.floor((now - lastSeenTime) / 60000);
            if (diffMin < 1) timeStr = 'Baru saja';
            else if (diffMin < 60) timeStr = `${diffMin} menit yang lalu`;
            else {
                const diffHour = Math.floor(diffMin / 60);
                if (diffHour < 24) timeStr = `${diffHour} jam yang lalu`;
                else timeStr = new Date(s.lastSeen).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            }
        }

        return { ...s, isOnline, timeStr, lastSeenTime };
    });

    // sort: online first, then by lastSeen desc
    studentStatus.sort((a, b) => {
        if (a.isOnline === b.isOnline) {
            return b.lastSeenTime - a.lastSeenTime;
        }
        return a.isOnline ? -1 : 1;
    });

    main.innerHTML = `
    <div class="flex justify-between items-center mb-2">
        <h3>Monitoring Status Siswa</h3>
    </div>
    
    <div class="tabs mb-2">
        <button class="tab-button active" onclick="switchMonitoringTab('status', this)">Status Aktif</button>
        <button class="tab-button" onclick="switchMonitoringTab('violations', this)">Laporan Kecurangan</button>
    </div>

    <div id="monitoring-status-tab" class="tab-content active">
    <div class="grid-3 mb-2">
        <div class="card stat-card" style="border-left: 4px solid var(--success)">
            <div class="stat-icon" style="background: rgba(76, 175, 80, 0.1); color: var(--success)"><i class="fas fa-user-check"></i></div>
            <div class="stat-info">
                <h4>Online / Sedang Login</h4>
                <div class="stat-value">${onlineCount} Siswa</div>
            </div>
        </div>
        <div class="card stat-card" style="border-left: 4px solid var(--text-muted)">
            <div class="stat-icon" style="background: rgba(158, 158, 158, 0.1); color: var(--text-muted)"><i class="fas fa-user-clock"></i></div>
            <div class="stat-info">
                <h4>Offline</h4>
                <div class="stat-value">${students.length - onlineCount} Siswa</div>
            </div>
        </div>
        <div class="card stat-card" style="border-left: 4px solid var(--primary-light)">
            <div class="stat-icon" style="background: rgba(79, 195, 247, 0.1); color: var(--primary-light)"><i class="fas fa-users"></i></div>
            <div class="stat-info">
                <h4>Total Siswa</h4>
                <div class="stat-value">${students.length} Siswa</div>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-bottom:none; padding-bottom:0;">
            <h3 class="card-title" style="margin-bottom: 1rem;"><i class="fas fa-desktop"></i> Status Aktivitas Terakhir</h3>
            <input type="text" id="search-monitoring" class="form-control" style="margin-bottom:1rem; width:250px; padding:0.4rem;" placeholder="Cari Siswa/Kelas..." onkeyup="filterTable('search-monitoring', 'table-monitoring')">
        </div>
        <div class="table-container">
            <table id="table-monitoring">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Nama Siswa</th>
                        <th>Kelas</th>
                        <th>Aktivitas Terakhir</th>
                    </tr>
                </thead>
                <tbody>
                    ${studentStatus.length > 0 ? studentStatus.map(s => `
                        <tr>
                            <td>
                                ${s.isOnline
            ? '<span class="badge badge-success"><i class="fas fa-circle" style="font-size:0.6rem; vertical-align:middle; margin-right:4px;"></i> Online</span>'
            : '<span class="badge" style="background:var(--bg-input);color:var(--text-muted)"><i class="far fa-circle" style="font-size:0.6rem; vertical-align:middle; margin-right:4px;"></i> Offline</span>'}
                            </td>
                            <td><strong>${s.name}</strong><br><small class="text-muted">@${s.username}</small></td>
                            <td>${s.kelas || '-'}</td>
                            <td>${s.isOnline ? '<span style="color:var(--success)">Aktif sekarang</span>' : s.timeStr}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada data siswa</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>
    </div>

    <div id="monitoring-violations-tab" class="tab-content">
        <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                <h3 class="card-title"><i class="fas fa-exclamation-triangle text-danger"></i> Daftar Pelanggaran Siswa</h3>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn btn-danger btn-sm" onclick="clearAllViolations()"><i class="fas fa-trash-alt"></i> Hapus Semua Data</button>
                    <button class="btn btn-outline btn-sm" onclick="exportViolationsToExcel()"><i class="fas fa-file-excel"></i> Download Excel</button>
                </div>
            </div>
            <div class="table-container" id="violations-table-container">
                <div class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Memuat data pelanggaran...</div>
            </div>
        </div>
    </div>
    `;
}

function switchMonitoringTab(tab, btn) {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`monitoring-${tab}-tab`).classList.add('active');
    
    if (tab === 'violations') {
        loadViolationsReport();
    }
}

async function loadViolationsReport() {
    const container = document.getElementById('violations-table-container');
    try {
        const res = await fetch('/api/violations');
        const data = await res.json();
        
        if (data.success) {
            const v = data.violations;
            container.innerHTML = `
            <table id="table-violations">
                <thead>
                    <tr>
                        <th>Waktu</th>
                        <th>Nama Siswa</th>
                        <th>Kelas</th>
                        <th>Tahap</th>
                        <th>Detail Pelanggaran</th>
                    </tr>
                </thead>
                <tbody>
                    ${v.map(r => `
                        <tr>
                            <td>${new Date(r.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                            <td><strong>${r.name || r.username}</strong></td>
                            <td>${r.kelas || '-'}</td>
                            <td><span class="badge badge-info">${r.stage || '-'}</span></td>
                            <td><span class="text-danger">${r.details}</span></td>
                        </tr>
                    `).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada laporan kecurangan.</td></tr>'}
                </tbody>
            </table>`;
        }
    } catch (err) {
        container.innerHTML = '<div class="error-msg">Gagal memuat laporan kecurangan.</div>';
    }
}

function exportViolationsToExcel() {
    const table = document.querySelector('#table-violations');
    if (!table) return;
    const html = table.outerHTML;
    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Kecurangan_Siswa_${new Date().getTime()}.xls`;
    link.click();
}

async function clearAllViolations() {
    if (!confirm('Apakah Anda yakin ingin menghapus SEMUA data pelanggaran? Tindakan ini tidak dapat dibatalkan.')) return;
    
    try {
        const res = await fetch('/api/violations/all', { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            alert('✅ Semua data pelanggaran berhasil dihapus.');
            loadViolationsReport();
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        alert('Gagal menghapus data: ' + err.message);
    }
}

async function triggerDataSimulation() {
    if (!confirm('Apakah Anda yakin ingin men-generate data simulasi? Ini akan mengubah data penilaian semua siswa agar sesuai target (82% Lulus, Rata-rata >80%).')) return;
    try {
        const res = await fetch('/api/progress/simulate', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            alert('? Berhasil! Data penilaian telah diperbarui sesuai target.');
            await syncData();
            renderStudentResults(document.getElementById('main-content'));
        } else {
            alert('Gagal: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Server error saat simulasi data.');
    }
} 


// Secret shortcut to show simulation button (Ctrl + Shift)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey) {
        const btn = document.getElementById('btn-simulate-data');
        if (btn) {
            btn.style.display = 'inline-block';
            console.log('Admin simulation mode activated.');
        }
    }
});


async function triggerResetStage2() {
    const selected = Array.from(document.querySelectorAll('.student-select:checked')).map(cb => cb.value);
    const mode = selected.length > 0 ? 'siswa yang dipilih' : 'seluruh siswa';
    
    if (!confirm(`Apakah Anda yakin ingin mereset Tahap 2 (Refleksi) untuk ${mode}? Ini akan menghapus jawaban refleksi yang sudah ada agar AI bisa membangkitkan pertanyaan baru yang lebih relevan dengan chat terbaru mereka.`)) return;
    
    try {
        const res = await fetch('/api/progress/reset-stage2', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: selected.length > 0 ? selected : null })
        });
        const data = await res.json();
        if (res.ok) {
            alert('? Berhasil mereset Tahap 2 untuk seluruh siswa!');
            await syncData();
            renderStudentResults(document.getElementById('main-content'));
        } else {
            alert('Gagal: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Server error saat mereset Tahap 2.');
    }
} 


function toggleAllResults() {
    const mainCb = document.getElementById('select-all-results');
    const cbs = document.querySelectorAll('.student-select');
    cbs.forEach(cb => cb.checked = mainCb.checked);
}

// ---- STUDENT ATTENDANCE ----
function renderStudentAttendance(main) {
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');
    const classes = [...new Set(students.map(s => s.kelas || 'Tanpa Kelas'))];
    const today = new Date().toISOString().split('T')[0];

    main.innerHTML = `
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">📅 Manajemen Absensi Siswa</h3>
        </div>
        <div class="tabs">
            <button class="tab-button active" onclick="switchAttendanceTab('input', this)">Input Absensi</button>
            <button class="tab-button" onclick="switchAttendanceTab('report', this)">Laporan & Rekap</button>
        </div>

        <!-- Tab Content: Input -->
        <div id="attendance-input-tab" class="tab-content active">
            <div class="flex justify-between items-center mb-2" style="flex-wrap:wrap; gap:1rem;">
                <div>
                    <h4 id="attendance-date-label">Presensi Hari Ini: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                    <input type="date" id="attendance-date-input" value="${today}" class="form-control" style="width:auto; display:inline-block; margin-top:0.5rem;" onchange="loadAttendanceForDate(this.value)">
                </div>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                    <select id="attendance-class-filter-input" class="form-control" style="margin-bottom:0; width:auto;" onchange="filterAttendanceInput()">
                        <option value="all">Semua Kelas</option>
                        ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <input type="text" id="search-attendance" class="form-control" style="margin-bottom:0; width:180px; padding:0.4rem;" placeholder="Cari Nama..." onkeyup="filterAttendanceInput()">
                    <button class="btn btn-success" onclick="saveAttendance()"><i class="fas fa-save"></i> Simpan Absensi</button>
                </div>
            </div>
            <div class="table-container">
                <table id="table-attendance">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Nama Siswa</th>
                            <th>Kelas</th>
                            <th style="text-align:center">Hadir</th>
                            <th style="text-align:center">Sakit</th>
                            <th style="text-align:center">Izin</th>
                            <th style="text-align:center">Alpha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map((s, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${s.name}</strong></td>
                                <td>${s.kelas || '-'}</td>
                                <td style="text-align:center">
                                    <input type="radio" name="att-${s.username}" value="hadir" checked style="width:20px; height:20px; cursor:pointer">
                                </td>
                                <td style="text-align:center">
                                    <input type="radio" name="att-${s.username}" value="sakit" style="width:20px; height:20px; cursor:pointer">
                                </td>
                                <td style="text-align:center">
                                    <input type="radio" name="att-${s.username}" value="izin" style="width:20px; height:20px; cursor:pointer">
                                </td>
                                <td style="text-align:center">
                                    <input type="radio" name="att-${s.username}" value="alpha" style="width:20px; height:20px; cursor:pointer">
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="7" class="text-center text-muted">Belum ada siswa terdaftar</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Tab Content: Report -->
        <div id="attendance-report-tab" class="tab-content">
            <div class="grid-3 mb-2" style="grid-template-columns: 1fr 1fr 1fr; gap:1rem;">
                <div class="form-group">
                    <label>Periode Laporan</label>
                    <select id="report-period" class="form-control" onchange="updateAttendanceReport()">
                        <option value="daily">Harian</option>
                        <option value="weekly">Mingguan</option>
                        <option value="monthly">Bulanan</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Pilih Tanggal Acuan</label>
                    <input type="date" id="report-date" value="${today}" class="form-control" onchange="updateAttendanceReport()">
                </div>
                <div class="form-group">
                    <label>Filter Kelas</label>
                    <select id="report-class" class="form-control" onchange="updateAttendanceReport()">
                        <option value="all">Semua Kelas</option>
                        ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div id="attendance-report-summary" class="mb-2">
                <!-- Summary cards populated by JS -->
            </div>

            <div id="attendance-report-content" class="table-container">
                <div class="text-center py-3 text-muted">Silakan pilih parameter laporan.</div>
            </div>
            
            <div class="flex justify-between mt-2">
                <button class="btn btn-outline" onclick="exportAttendanceReport()"><i class="fas fa-file-excel"></i> Download Excel</button>
                <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Cetak Laporan</button>
            </div>
        </div>
    </div>`;

    // Load current day's attendance if exists
    loadAttendanceForDate(today);
}

function switchAttendanceTab(tab, btn) {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`attendance-${tab}-tab`).classList.add('active');
    
    if (tab === 'report') {
        updateAttendanceReport();
    }
}

async function loadAttendanceForDate(date) {
    const label = document.getElementById('attendance-date-label');
    if (label) {
        const d = new Date(date);
        label.innerText = `Presensi: ${d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}`;
    }

    try {
        const res = await fetch(`/api/attendance?date=${date}`);
        const data = await res.json();
        
        if (data.success && data.records.length > 0) {
            data.records.forEach(r => {
                const radios = document.getElementsByName(`att-${r.username}`);
                radios.forEach(rd => {
                    if (rd.value === r.status) rd.checked = true;
                });
            });
        } else {
            // Reset to "hadir"
            const allRadios = document.querySelectorAll('input[type="radio"][name^="att-"]');
            allRadios.forEach(rd => {
                if (rd.value === 'hadir') rd.checked = true;
                else rd.checked = false;
            });
        }
    } catch (err) {
        console.error('Gagal memuat absensi:', err);
    }
}

function filterAttendanceInput() {
    const classFilter = document.getElementById('attendance-class-filter-input').value.toLowerCase();
    const searchFilter = document.getElementById('search-attendance').value.toLowerCase();
    const rows = document.querySelectorAll('#table-attendance tbody tr');

    rows.forEach(row => {
        const studentName = row.cells[1].innerText.toLowerCase();
        const studentClass = row.cells[2].innerText.toLowerCase();
        
        const matchClass = (classFilter === 'all' || studentClass === classFilter);
        const matchSearch = studentName.includes(searchFilter);

        if (matchClass && matchSearch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}


async function saveAttendance() {
    const date = document.getElementById('attendance-date-input').value;
    const btn = event.target.closest('button');
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');
    const records = {};

    students.forEach(s => {
        const radios = document.getElementsByName(`att-${s.username}`);
        let status = 'hadir';
        for (const r of radios) {
            if (r.checked) { status = r.value; break; }
        }
        records[s.username] = {
            status,
            name: s.name,
            kelas: s.kelas || 'Tanpa Kelas'
        };
    });

    try {
        const res = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, records })
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Absensi berhasil disimpan ke database!');
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Gagal menyimpan absensi ke server.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}

async function updateAttendanceReport() {
    const period = document.getElementById('report-period').value;
    const date = document.getElementById('report-date').value;
    const kelas = document.getElementById('report-class').value;
    const content = document.getElementById('attendance-report-content');
    const summaryDiv = document.getElementById('attendance-report-summary');

    content.innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Menghasilkan Laporan...</div>';

    try {
        const res = await fetch(`/api/attendance/summary?type=${period}&date=${date}&kelas=${kelas}`);
        const data = await res.json();

        if (data.success) {
            const s = data.summary;
            
            // Render Summary Cards
            summaryDiv.innerHTML = `
            <div class="grid-4">
                <div class="stat-card" style="padding:1rem; gap:0.5rem;"><div class="stat-icon green" style="width:32px; height:32px; font-size:0.9rem;"><i class="fas fa-check"></i></div><div class="stat-info"><h3 style="font-size:1.1rem;">${s.hadir}</h3><p style="font-size:0.7rem;">Hadir</p></div></div>
                <div class="stat-card" style="padding:1rem; gap:0.5rem;"><div class="stat-icon blue" style="width:32px; height:32px; font-size:0.9rem;"><i class="fas fa-briefcase-medical"></i></div><div class="stat-info"><h3 style="font-size:1.1rem;">${s.sakit}</h3><p style="font-size:0.7rem;">Sakit</p></div></div>
                <div class="stat-card" style="padding:1rem; gap:0.5rem;"><div class="stat-icon orange" style="width:32px; height:32px; font-size:0.9rem;"><i class="fas fa-envelope"></i></div><div class="stat-info"><h3 style="font-size:1.1rem;">${s.izin}</h3><p style="font-size:0.7rem;">Izin</p></div></div>
                <div class="stat-card" style="padding:1rem; gap:0.5rem;"><div class="stat-icon red" style="width:32px; height:32px; font-size:0.9rem;"><i class="fas fa-times"></i></div><div class="stat-info"><h3 style="font-size:1.1rem;">${s.alpha}</h3><p style="font-size:0.7rem;">Alpha</p></div></div>
            </div>`;

            // Render Table
            let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Nama Siswa</th>
                        <th>Kelas</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${s.details.map(r => `
                        <tr>
                            <td>${new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</td>
                            <td><strong>${r.name || r.username}</strong></td>
                            <td>${r.kelas || '-'}</td>
                            <td><span class="badge badge-${r.status === 'hadir' ? 'success' : r.status === 'sakit' ? 'info' : r.status === 'izin' ? 'warning' : 'danger'}">${r.status.toUpperCase()}</span></td>
                        </tr>
                    `).join('') || '<tr><td colspan="4" class="text-center text-muted">Tidak ada data absensi untuk periode ini.</td></tr>'}
                </tbody>
            </table>`;
            content.innerHTML = tableHtml;
        }
    } catch (err) {
        console.error(err);
        content.innerHTML = '<div class="error-msg">Gagal memuat laporan absensi.</div>';
    }
}

function exportAttendanceReport() {
    const table = document.querySelector('#attendance-report-content table');
    if (!table) return;
    const html = table.outerHTML;
    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Absensi_${new Date().getTime()}.xls`;
    link.click();
}

// ---- TEACHER JOURNAL ----
function renderTeacherJournal(main) {
    const journals = JSON.parse(localStorage.getItem('teacher_journals') || '[]');
    
    main.innerHTML = `
    <div class="grid-2">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-edit"></i> Input Jurnal Harian</h3>
            </div>
            <form id="form-journal" onsubmit="handleJournalSubmit(event)">
                <div class="form-group">
                    <label>Tanggal</label>
                    <input type="date" id="journal-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>Mata Pelajaran</label>
                    <input type="text" id="journal-subject" placeholder="Contoh: Informatika" required>
                </div>
                <div class="form-group">
                    <label>Kelas</label>
                    <input type="text" id="journal-class" placeholder="Contoh: VII-A" required>
                </div>
                <div class="form-group">
                    <label>Materi / Kegiatan</label>
                    <textarea id="journal-activity" rows="4" placeholder="Deskripsikan kegiatan pembelajaran hari ini..." required></textarea>
                </div>
                <div class="form-group">
                    <label>Hambatan / Catatan (Opsional)</label>
                    <textarea id="journal-notes" rows="2" placeholder="Catatan khusus jika ada..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100"><i class="fas fa-paper-plane"></i> Simpan ke Jurnal</button>
            </form>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-history"></i> Riwayat Jurnal</h3>
            </div>
            <div class="table-container">
                <table id="table-journal">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Kelas</th>
                            <th>Materi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${journals.sort((a,b) => new Date(b.date) - new Date(a.date)).map(j => `
                            <tr>
                                <td>${new Date(j.date).toLocaleDateString('id-ID')}</td>
                                <td>${j.class}</td>
                                <td>
                                    <strong>${j.subject}</strong><br>
                                    <small class="text-muted">${j.activity.substring(0, 50)}${j.activity.length > 50 ? '...' : ''}</small>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="3" class="text-center text-muted">Belum ada riwayat jurnal</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

function handleJournalSubmit(e) {
    e.preventDefault();
    const date = document.getElementById('journal-date').value;
    const subject = document.getElementById('journal-subject').value;
    const className = document.getElementById('journal-class').value;
    const activity = document.getElementById('journal-activity').value;
    const notes = document.getElementById('journal-notes').value;

    const newEntry = {
        id: Date.now(),
        date,
        subject,
        class: className,
        activity,
        notes,
        teacher: currentUser.username
    };

    const journals = JSON.parse(localStorage.getItem('teacher_journals') || '[]');
    journals.push(newEntry);
    localStorage.setItem('teacher_journals', JSON.stringify(journals));

    alert('✅ Jurnal harian berhasil disimpan!');
    renderTeacherJournal(document.getElementById('main-content'));
}

function initDashboardCharts() {
    const classFilter = document.getElementById('chart-class-filter') ? document.getElementById('chart-class-filter').value : 'all';
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');
    const results = getAssessmentResults();
    
    let lulus = 0;
    let perluPenguatan = 0;

    students.forEach(s => {
        if (classFilter !== 'all' && (s.kelas || 'Tanpa Kelas') !== classFilter) return;
        
        const r = results[s.username];
        if (r && r.pass) {
            lulus++;
        } else {
            perluPenguatan++;
        }
    });

    const currentTotal = lulus + perluPenguatan || 1;
    const lulusPct = Math.round((lulus / currentTotal) * 100);
    const penguatanPct = 100 - lulusPct;

    const ctx = document.getElementById('chart-attainment').getContext('2d');
    
    if (window.attainmentChart) window.attainmentChart.destroy();

    window.attainmentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [`Lulus (${lulusPct}%)`, `Perlu Penguatan (${penguatanPct}%)`],
            datasets: [{
                data: [lulus, perluPenguatan],
                backgroundColor: ['#4caf50', '#f44336'],
                hoverOffset: 15,
                borderWidth: 2,
                borderColor: 'var(--bg-card)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'bottom', 
                    labels: { 
                        color: '#e8eaf6',
                        padding: 20,
                        font: { size: 14, weight: '600' }
                    } 
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = context.raw;
                            const pct = Math.round((val / total) * 100);
                            return ` ${context.label.split(' ')[0]}: ${val} Siswa (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateAttendanceChart() {
    const ctxAtt = document.getElementById('chart-attendance');
    if (!ctxAtt) return;

    const classFilter = document.getElementById('attendance-class-filter').value;
    const attendanceData = JSON.parse(localStorage.getItem('student_attendance') || '{}');
    const today = new Date().toISOString().split('T')[0];
    const todayData = attendanceData[today] || {};

    let hadir = 0, sakit = 0, izin = 0, alpha = 0;

    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');

    students.forEach(s => {
        if (classFilter !== 'all' && (s.kelas || 'Tanpa Kelas') !== classFilter) return;
        
        const record = todayData[s.username];
        if (record) {
            if (record.status === 'hadir') hadir++;
            else if (record.status === 'sakit') sakit++;
            else if (record.status === 'izin') izin++;
            else if (record.status === 'alpha') alpha++;
        } else {
            alpha++; // Default alpha if no record
        }
    });

    if (window.myAttChart) window.myAttChart.destroy();

    window.myAttChart = new Chart(ctxAtt, {
        type: 'doughnut',
        data: {
            labels: ['Hadir', 'Sakit', 'Izin', 'Alpha'],
            datasets: [{
                data: [hadir, sakit, izin, alpha],
                backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#e8eaf6' } }
            }
        }
    });
}

function renderJournalSummary() {
    const journals = JSON.parse(localStorage.getItem('teacher_journals') || '[]');
    const container = document.getElementById('journal-summary-content');
    if (!container) return;
    
    if (journals.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Belum ada jurnal yang tercatat.</p>';
        return;
    }

    // Get last 3 journals
    const latest = journals.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    
    container.innerHTML = `
        <div class="grid-3">
            ${latest.map(j => `
                <div style="background:var(--bg-input); padding:1rem; border-radius:var(--radius-sm); border-left:4px solid var(--primary);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem">
                        <small class="badge badge-info">${new Date(j.date).toLocaleDateString('id-ID')}</small>
                        <small class="text-muted">${j.class}</small>
                    </div>
                    <strong style="display:block; margin-bottom:0.3rem">${j.subject}</strong>
                    <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4">${j.activity.substring(0, 80)}${j.activity.length > 80 ? '...' : ''}</p>
                </div>
            `).join('')}
        </div>
        <div style="text-align:right; margin-top:1rem;">
            <button class="btn btn-outline btn-sm" onclick="navigateTo('teacher-journal')">Lihat Semua Jurnal <i class="fas fa-arrow-right"></i></button>
        </div>
    `;
}

// ---- BANK SOAL PER KELAS ----
async function renderBankSoalKelas(main) {
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');
    const classes = ['Semua Kelas', ...new Set(students.map(s => s.kelas || 'Tanpa Kelas'))];

    main.innerHTML = `
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">📂 Bank Soal Per Kelas</h3>
        </div>
        <div class="tabs">
            ${classes.map((c, i) => `<button class="tab-button ${i === 0 ? 'active' : ''}" onclick="filterBankSoalByKelas('${c}', this)">${c}</button>`).join('')}
        </div>
        <div id="bank-soal-kelas-content">
            <div class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Memuat Soal...</div>
        </div>
    </div>`;

    // Load initial class
    filterBankSoalByKelas(classes[0]);
}

async function filterBankSoalByKelas(kelas, btn) {
    if (btn) {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    const content = document.getElementById('bank-soal-kelas-content');
    content.innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Memuat Soal...</div>';

    try {
        const res = await fetch(`/api/question-bank?kelas=${encodeURIComponent(kelas)}`);
        const data = await res.json();
        const questions = data.questions || [];

        content.innerHTML = `
        <div style="margin-bottom: 0.5rem; display: flex; justify-content: flex-end;">
            <button class="btn btn-danger btn-sm" id="btn-bulk-delete-soal-kelas" style="display:none;" onclick="bulkDeleteBankSoalKelas('${kelas}')"><i class="fas fa-trash"></i> Hapus Terpilih (<span id="count-selected-soal-kelas">0</span>)</button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" id="check-all-bank-soal-kelas" onchange="toggleAllBankSoalKelas(this)"></th>
                        <th>No.</th><th>Tipe</th><th>Pertanyaan</th><th>Jawaban</th><th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${questions.map((q, i) => `
                        <tr>
                            <td><input type="checkbox" class="check-bank-soal-kelas" value="${q._id}" onchange="updateBankSoalKelasDeleteBtn()"></td>
                            <td>${i + 1}</td>
                            <td><span class="badge ${q.type === 'literasi' ? 'badge-info' : 'badge-warning'}">${q.type}</span></td>
                            <td>
                                ${q.image ? `<img src="${q.image}" style="height:30px; border-radius:4px; margin-right:5px; cursor:pointer;" onclick="viewFullImage('${q.image}')">` : ''}
                                ${q.question.substring(0, 80)}...
                            </td>
                            <td>${String.fromCharCode(65 + q.correct)}</td>
                            <td>
                                <div class="flex gap-1">
                                    <button class="btn btn-sm btn-outline" onclick="editBankSoal('${q._id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteBankSoal('${q._id}')"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>`).join('') || '<tr><td colspan="6" class="text-center text-muted">Belum ada soal untuk kelas ini</td></tr>'}
                </tbody>
            </table>
        </div>`;
    } catch (err) {
        content.innerHTML = '<div class="error-msg">Gagal memuat data soal.</div>';
    }
}

function toggleAllBankSoalKelas(source) {
    const checkboxes = document.querySelectorAll('.check-bank-soal-kelas');
    checkboxes.forEach(cb => cb.checked = source.checked);
    updateBankSoalKelasDeleteBtn();
}

function updateBankSoalKelasDeleteBtn() {
    const checkedBoxes = document.querySelectorAll('.check-bank-soal-kelas:checked');
    const btn = document.getElementById('btn-bulk-delete-soal-kelas');
    const countSpan = document.getElementById('count-selected-soal-kelas');

    if (checkedBoxes.length > 0) {
        btn.style.display = 'inline-block';
        countSpan.innerText = checkedBoxes.length;
    } else {
        btn.style.display = 'none';
        const checkAll = document.getElementById('check-all-bank-soal-kelas');
        if (checkAll) checkAll.checked = false;
    }
}

async function bulkDeleteBankSoalKelas(kelas) {
    const checkedBoxes = document.querySelectorAll('.check-bank-soal-kelas:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) return;
    if (!confirm(`Hapus permanen ${ids.length} soal terpilih dari Bank Soal?`)) return;

    const btn = document.getElementById('btn-bulk-delete-soal-kelas');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus...';

    try {
        const res = await fetch('/api/question-bank/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });

        const data = await res.json();
        if (res.ok) {
            alert(`Berhasil menghapus ${data.count} soal.`);
            const activeTab = Array.from(document.querySelectorAll('.tab-button')).find(btn => btn.classList.contains('active') && btn.innerText === kelas);
            filterBankSoalByKelas(kelas, activeTab);
        } else {
            alert(data.error || 'Gagal menghapus soal terpilih.');
        }
    } catch (err) {
        console.error('Error bulk deleting question bank:', err);
        alert('Server error saat menghapus soal.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

// ---- KISI-KISI SOAL ----
function renderKisiKisiSoal(main) {
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');
    const classes = ['Semua Kelas', ...new Set(students.map(s => s.kelas || 'Tanpa Kelas'))];

    main.innerHTML = `
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">📝 Pembuatan Kisi-kisi Soal</h3>
        </div>
        <div class="form-group">
            <label>Pilih Kelas</label>
            <select id="kisi-kelas-selector" class="form-control" style="max-width:300px" onchange="generateKisiKisiView(this.value)">
                <option value="">-- Pilih Kelas --</option>
                ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
        </div>
        <div id="kisi-kisi-content">
            <p class="text-muted text-center py-3">Pilih kelas untuk melihat kisi-kisi soal yang tersedia.</p>
        </div>
    </div>`;
}

async function generateKisiKisiView(kelas) {
    if (!kelas) return;
    const content = document.getElementById('kisi-kisi-content');
    content.innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Menganalisis Bank Soal...</div>';

    try {
        const res = await fetch(`/api/question-bank?kelas=${encodeURIComponent(kelas)}`);
        const data = await res.json();
        const questions = data.questions || [];

        if (questions.length === 0) {
            content.innerHTML = '<div class="text-center py-3 text-muted">Tidak ada soal ditemukan untuk kelas ini di Bank Soal.</div>';
            return;
        }

        // Aggregate by topic/type
        const stats = { literasi: 0, numerasi: 0, total: questions.length, topics: {} };
        questions.forEach(q => {
            stats[q.type]++;
            const topic = q.topic || 'Umum';
            if (!stats.topics[topic]) stats.topics[topic] = { count: 0, types: { literasi: 0, numerasi: 0 } };
            stats.topics[topic].count++;
            stats.topics[topic].types[q.type]++;
        });

        content.innerHTML = `
        <div class="alert alert-info mt-2" style="background:rgba(26,115,232,0.1); border-left:4px solid var(--primary); padding:1rem; border-radius:8px;">
            <h4 style="color:var(--primary); margin-bottom:0.5rem">Ringkasan Kisi-kisi: ${kelas}</h4>
            <div class="grid-3">
                <div class="stat-mini"><strong>Total Soal:</strong> ${stats.total}</div>
                <div class="stat-mini"><strong>Literasi:</strong> ${stats.literasi}</div>
                <div class="stat-mini"><strong>Numerasi:</strong> ${stats.numerasi}</div>
            </div>
        </div>
        
        <div class="table-container mt-2">
            <table>
                <thead>
                    <tr>
                        <th>Materi/Topik</th>
                        <th>Literasi</th>
                        <th>Numerasi</th>
                        <th>Total Soal</th>
                        <th>Distribusi (%)</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(stats.topics).map(topic => {
            const t = stats.topics[topic];
            const pct = ((t.count / stats.total) * 100).toFixed(1);
            return `
                        <tr>
                            <td><strong>${topic}</strong></td>
                            <td>${t.types.literasi}</td>
                            <td>${t.types.numerasi}</td>
                            <td>${t.count}</td>
                            <td>
                                <div class="progress-bar" style="height:6px; width:80px">
                                    <div class="progress-fill" style="width:${pct}%"></div>
                                </div>
                                <small>${pct}%</small>
                            </td>
                        </tr>`;
        }).join('')}
                </tbody>
            </table>
        </div>
        <div class="flex justify-between mt-2">
            <button class="btn btn-outline" onclick="exportKisiToExcel('${kelas}')"><i class="fas fa-file-excel"></i> Download Kisi-kisi (Excel)</button>
            <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Cetak Laporan</button>
        </div>`;
    } catch (err) {
        content.innerHTML = '<div class="error-msg">Gagal memproses kisi-kisi.</div>';
    }
}

function exportKisiToExcel(kelas) {
    const table = document.querySelector('#kisi-kisi-content table');
    if (!table) return;
    const html = table.outerHTML;
    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Kisi-kisi_Soal_${kelas}_${new Date().getTime()}.xls`;
    link.click();
}

async function editBankSoal(id) {
    try {
        const res = await fetch(`/api/question-bank/${id}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        const q = data.question;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'edit-soal-modal';
        
        const students = getUsers().filter(u => u.role === 'siswa');
        const classes = [...new Set(students.map(s => s.kelas || 'Tanpa Kelas'))];

        modal.innerHTML = `
        <div class="modal" style="max-width:600px">
            <div class="modal-header">
                <h2><i class="fas fa-edit"></i> Edit Soal</h2>
                <button class="modal-close" onclick="document.getElementById('edit-soal-modal').remove()"><i class="fas fa-times"></i></button>
            </div>
            <form id="form-edit-soal" onsubmit="handleUpdateSoal(event, '${id}')">
                <div class="form-group">
                    <label>Pertanyaan (Bisa Paste Gambar)</label>
                    <textarea id="edit-ms-q" class="form-control" rows="3" required onpaste="handlePasteImage(event, 'edit-ms-image-preview', 'edit')">${q.question}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Opsi A</label><input type="text" id="edit-ms-a" value="${q.options[0]}" required></div>
                    <div class="form-group"><label>Opsi B</label><input type="text" id="edit-ms-b" value="${q.options[1]}" required></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Opsi C</label><input type="text" id="edit-ms-c" value="${q.options[2]}" required></div>
                    <div class="form-group"><label>Opsi D</label><input type="text" id="edit-ms-d" value="${q.options[3]}" required></div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Kunci Jawaban</label>
                        <select id="edit-ms-correct" class="form-control">
                            <option value="0" ${q.correct === 0 ? 'selected' : ''}>A</option>
                            <option value="1" ${q.correct === 1 ? 'selected' : ''}>B</option>
                            <option value="2" ${q.correct === 2 ? 'selected' : ''}>C</option>
                            <option value="3" ${q.correct === 3 ? 'selected' : ''}>D</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipe Soal</label>
                        <select id="edit-ms-type" class="form-control">
                            <option value="literasi" ${q.type === 'literasi' ? 'selected' : ''}>Literasi</option>
                            <option value="numerasi" ${q.type === 'numerasi' ? 'selected' : ''}>Numerasi</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Pembahasan</label>
                    <textarea id="edit-ms-exp" class="form-control" rows="2" required>${q.explanation}</textarea>
                </div>
                <div class="form-group">
                    <label>Gambar Soal (Opsional)</label>
                    <input type="file" id="edit-ms-image-input" accept="image/*" onchange="previewEditImage(this)" class="form-control">
                    <div id="edit-ms-image-preview" class="mt-1">
                        ${q.image ? `<div style="position:relative; display:inline-block;">
                            <img src="${q.image}" style="max-height:150px; border-radius:8px; border:1px solid var(--border-color);">
                            <button type="button" class="btn btn-sm btn-danger" style="position:absolute; top:-10px; right:-10px; border-radius:50%; width:24px; height:24px; padding:0;" onclick="removeManualImage('edit-ms-image-preview', 'edit')">×</button>
                        </div>` : ''}
                    </div>
                </div>
                <div class="form-group">
                    <label>Untuk Kelas</label>
                    <select id="edit-ms-kelas" class="form-control">
                        <option value="Semua Kelas" ${q.kelas === 'Semua Kelas' ? 'selected' : ''}>Semua Kelas</option>
                        ${classes.map(c => `<option value="${c}" ${q.kelas === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="document.getElementById('edit-soal-modal').remove()">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                </div>
            </form>
        </div>`;
        document.body.appendChild(modal);
    } catch (err) {
        alert('Gagal mengambil data soal: ' + err.message);
    }
}

async function handleUpdateSoal(e, id) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    const payload = {
        question: document.getElementById('edit-ms-q').value,
        options: [
            document.getElementById('edit-ms-a').value,
            document.getElementById('edit-ms-b').value,
            document.getElementById('edit-ms-c').value,
            document.getElementById('edit-ms-d').value
        ],
        correct: parseInt(document.getElementById('edit-ms-correct').value),
        type: document.getElementById('edit-ms-type').value,
        explanation: document.getElementById('edit-ms-exp').value,
        kelas: document.getElementById('edit-ms-kelas').value,
        image: window.tempEditImage || (document.querySelector('#edit-ms-image-preview img') ? document.querySelector('#edit-ms-image-preview img').src : null)
    };

    try {
        const res = await fetch(`/api/question-bank/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Soal berhasil diperbarui!');
            document.getElementById('edit-soal-modal').remove();
            
            // Refresh current view
            const activeTab = document.querySelector('.tabs .tab-button.active');
            if (activeTab) {
                filterBankSoalByKelas(activeTab.innerText, activeTab);
            } else {
                renderBankSoal(document.getElementById('main-content'));
            }
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        alert('Gagal memperbarui soal: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = 'Simpan Perubahan';
    }
}

window.tempEditImage = null;
function previewEditImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        window.tempEditImage = e.target.result;
        const preview = document.getElementById('edit-ms-image-preview');
        preview.innerHTML = `
            <div style="position:relative; display:inline-block;">
                <img src="${e.target.result}" style="max-height:150px; border-radius:8px; border:1px solid var(--border-color);">
                <button type="button" class="btn btn-sm btn-danger" style="position:absolute; top:-10px; right:-10px; border-radius:50%; width:24px; height:24px; padding:0;" onclick="removeEditImage()">×</button>
            </div>`;
    };
    reader.readAsDataURL(file);
}

function removeEditImage() {
    window.tempEditImage = null;
    document.getElementById('edit-ms-image-preview').innerHTML = '';
    const input = document.getElementById('edit-ms-image-input');
    if (input) input.value = '';
}

function viewFullImage(src) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
        <div class="modal" style="max-width:90vw; background:transparent; box-shadow:none;">
            <img src="${src}" style="width:100%; border-radius:8px;">
            <button class="btn btn-outline mt-1" style="color:white; border-color:white;" onclick="this.closest('.modal-overlay').remove()">Tutup</button>
        </div>`;
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
}

// ---- IMAGE HELPERS FOR MANUAL ENTRY ----
window.tempManualImage = null;
function previewManualImage(input) {
    const file = input.files[0];
    if (!file) return;
    processImageFile(file, 'ms-image-preview', 'manual');
}

function handlePasteImage(e, previewId, mode) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            processImageFile(file, previewId, mode);
        }
    }
}

function processImageFile(file, previewId, mode) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        if (mode === 'manual') window.tempManualImage = base64;
        else window.tempEditImage = base64;

        const preview = document.getElementById(previewId);
        preview.innerHTML = `
            <div style="position:relative; display:inline-block;">
                <img src="${base64}" style="max-height:150px; border-radius:8px; border:1px solid var(--border-color);">
                <button type="button" class="btn btn-sm btn-danger" style="position:absolute; top:-10px; right:-10px; border-radius:50%; width:24px; height:24px; padding:0;" onclick="removeManualImage('${previewId}', '${mode}')">×</button>
            </div>`;
    };
    reader.readAsDataURL(file);
}

function removeManualImage(previewId, mode) {
    if (mode === 'manual') {
        window.tempManualImage = null;
        const input = document.getElementById('ms-image-input');
        if (input) input.value = '';
    } else {
        window.tempEditImage = null;
        const input = document.getElementById('edit-ms-image-input');
        if (input) input.value = '';
    }
    document.getElementById(previewId).innerHTML = '';
}


// ---- DATA PELANGGARAN KHUSUS ----
async function renderViolationData(main) {
    const users = getUsers();
    const students = users.filter(u => u.role === 'siswa');
    const classes = [...new Set(students.map(s => s.kelas || 'Tanpa Kelas'))];

    main.innerHTML = `
    <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <h3 class="card-title"><i class="fas fa-exclamation-triangle text-danger"></i> Data Pelanggaran Siswa</h3>
            <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-danger btn-sm" onclick="clearAllViolations()"><i class="fas fa-trash-alt"></i> Hapus Semua</button>
                <button class="btn btn-outline btn-sm" onclick="exportViolationsToExcel()"><i class="fas fa-file-excel"></i> Excel</button>
            </div>
        </div>
        <div class="form-group mt-2" style="max-width:300px">
            <label>Filter Kelas</label>
            <select id="violation-class-filter" class="form-control" onchange="loadViolationData(this.value)">
                <option value="all">Semua Kelas</option>
                ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
        </div>
        <div class="table-container mt-2" id="violation-data-container">
            <div class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Memuat data...</div>
        </div>
    </div>`;

    loadViolationData('all');
}

async function loadViolationData(kelas) {
    const container = document.getElementById('violation-data-container');
    try {
        const res = await fetch('/api/violations');
        const data = await res.json();
        
        if (data.success) {
            let v = data.violations;
            if (kelas !== 'all') {
                v = v.filter(r => (r.kelas || 'Tanpa Kelas') === kelas);
            }

            container.innerHTML = `
            <table id="table-violations">
                <thead>
                    <tr>
                        <th>Waktu</th>
                        <th>Nama Siswa</th>
                        <th>Kelas</th>
                        <th>Tahap</th>
                        <th>Detail Pelanggaran</th>
                    </tr>
                </thead>
                <tbody>
                    ${v.map(r => `
                        <tr>
                            <td>${new Date(r.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                            <td><strong>${r.name || r.username}</strong></td>
                            <td>${r.kelas || '-'}</td>
                            <td><span class="badge badge-info">${r.stage || '-'}</span></td>
                            <td><span class="text-danger">${r.details}</span></td>
                        </tr>
                    `).join('') || '<tr><td colspan="5" class="text-center text-muted">Tidak ada data pelanggaran ditemukan.</td></tr>'}
                </tbody>
            </table>`;
        }
    } catch (err) {
        container.innerHTML = '<div class="error-msg">Gagal memuat data pelanggaran.</div>';
    }
}