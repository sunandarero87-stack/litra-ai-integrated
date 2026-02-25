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
        const stage = p.tahap3Complete ? 'Selesai' : p.tahap2Complete ? 'Tahap 3' : p.tahap1Complete ? 'Tahap 2' : 'Tahap 1';
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
    <div class="card">
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
            ${materials.map((m, i) => `
                <div class="material-item">
                    <i class="fas ${m.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-word'}"></i>
                    <span>${m.name}</span>
                    <small class="text-muted">${new Date(m.date).toLocaleDateString('id-ID')}</small>
                    <button class="btn btn-sm btn-danger" onclick="deleteMaterial(${i})"><i class="fas fa-trash"></i></button>
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
    reader.onload = function (e) {
        const materials = getMaterials();
        materials.push({ name: file.name, type: ext, date: new Date().toISOString(), size: file.size, contentDataUrl: e.target.result });
        saveMaterials(materials);
        alert('✅ Materi berhasil diupload!');
        renderMaterials(document.getElementById('main-content'));
    };
    reader.readAsDataURL(file);
}

function deleteMaterial(idx) {
    if (!confirm('Hapus materi ini?')) return;
    const materials = getMaterials();
    materials.splice(idx, 1);
    saveMaterials(materials);
    renderMaterials(document.getElementById('main-content'));
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
            <p><strong>Jumlah Soal:</strong> 50 soal</p>
            <p class="mt-1"><strong>Tipe:</strong> Literasi (25) + Numerasi (25)</p>
            <p class="mt-1"><strong>KKM:</strong> 70%</p>
            <p class="mt-1"><strong>Format:</strong> ANBK SMP</p>
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
                                ${approved ? '<span class="badge badge-success">Disetujui</span>' :
                hasReflection ? `<button class="btn btn-sm btn-success" onclick="approveStudent('${s.username}')">Approve</button>` :
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

async function approveStudent(username) {
    await saveApprovalForUser(username, { date: new Date().toISOString(), approvedBy: currentUser.username });
    renderAssessmentMgmt(document.getElementById('main-content'));
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
    if (!confirm(`Hapus akun ${username}?`)) return;

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
        </div>
        <div class="flex gap-1">
            <button class="btn btn-primary" onclick="saveProfile()"><i class="fas fa-save"></i> Simpan Profil</button>
            <button class="btn btn-success" onclick="changeProfilePassword()"><i class="fas fa-key"></i> Ganti Password</button>
        </div>
        <div id="profile-msg" class="mt-2"></div>
    </div>`;
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
