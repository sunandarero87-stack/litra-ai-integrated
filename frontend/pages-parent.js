/**
 * PAGES-PARENT.JS
 * Dashboard khusus orang tua untuk memonitoring progres belajar anak.
 * Dirancang dengan antarmuka bersih, informatif, dan premium.
 */

function renderParentDashboard(container) {
    const progress = getStudentProgress();
    const results = getAssessmentResults();
    const myResult = results[currentUser.username] || progress.assessmentResult || { score: 0, total: 10, literasi: 0, numerasi: 0 };
    const scorePct = myResult.pct !== undefined ? myResult.pct : Math.round((myResult.score / myResult.total) * 100);

    // Hitung progress keseluruhan (Sederhana: 25% per tahap yang selesai)
    let overallProgress = 0;
    if (progress.tahap1Complete) overallProgress += 25;
    if (progress.tahap2Complete) overallProgress += 25;
    if (progress.tahap3Complete) overallProgress += 25;
    if (progress.tahap4Complete) overallProgress += 25;

    container.innerHTML = `
        <div class="dashboard-parent" style="max-width: 1000px; margin: 0 auto; animation: fadeIn 0.5s ease;">
            
            <!-- Header Monitoring -->
            <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem; background: linear-gradient(135deg, var(--bg-card), rgba(26, 115, 232, 0.1)); border: 1px solid var(--primary-light);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Monitor Belajar Anak</h2>
                        <p style="color: var(--text-secondary); font-size: 1rem;">Memantau progres <strong>${currentUser.name}</strong> - Kelas ${currentUser.kelas || '-'}</p>
                    </div>
                    <button class="btn btn-primary" onclick="downloadParentReportPDF()" style="padding: 0.8rem 1.5rem; border-radius: 50px;">
                        <i class="fas fa-file-pdf"></i> Unduh Laporan PDF
                    </button>
                </div>

                <div style="margin-top: 2rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-weight: 700; font-size: 0.9rem;">Progres Keseluruhan Program</span>
                        <span style="font-weight: 800; color: var(--primary-light);">${overallProgress}%</span>
                    </div>
                    <div class="progress-bar" style="height: 12px; background: rgba(255,255,255,0.1);">
                        <div class="progress-fill" style="width: ${overallProgress}%; background: var(--gradient-success);"></div>
                    </div>
                </div>
            </div>

            <!-- Grid Tahapan -->
            <div class="grid-2" style="gap: 1.5rem;">
                
                <!-- Tahap 1 Card -->
                <div class="card" style="border-left: 4px solid var(--primary);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(26, 115, 232, 0.2); display: flex; align-items: center; justify-content: center; color: var(--primary-light);">
                            <i class="fas fa-book-open"></i>
                        </div>
                        <span class="badge ${progress.tahap1Complete ? 'badge-success' : 'badge-warning'}">
                            ${progress.tahap1Complete ? 'Selesai' : 'Sedang Berjalan'}
                        </span>
                    </div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Tahap 1: Eksplorasi</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.75rem;">Anak Anda telah membaca materi dan berdiskusi interaktif dengan NARA-AI.</p>
                    
                    ${progress.tahap1Score !== undefined ? `
                        <div style="display: flex; align-items: center; gap: 0.8rem; background: rgba(0,0,0,0.2); padding: 0.5rem 0.8rem; border-radius: 8px;">
                            <div style="flex: 1;">
                                <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.2rem;">Skor Pemahaman</div>
                                <div class="progress-bar" style="height: 6px;">
                                    <div class="progress-fill" style="width: ${progress.tahap1Score}%; background: ${progress.tahap1Score >= 80 ? 'var(--gradient-success)' : (progress.tahap1Score >= 50 ? 'var(--gradient-accent)' : 'var(--gradient-danger)')};"></div>
                                </div>
                            </div>
                            <div style="font-size: 1.1rem; font-weight: 800; color: ${progress.tahap1Score >= 80 ? 'var(--success)' : (progress.tahap1Score >= 50 ? 'var(--accent)' : 'var(--danger)')};">${progress.tahap1Score}%</div>
                        </div>
                    ` : ''}
                </div>

                <!-- Tahap 2 Card -->
                <div class="card" style="border-left: 4px solid var(--secondary);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(0, 188, 212, 0.2); display: flex; align-items: center; justify-content: center; color: var(--secondary);">
                            <i class="fas fa-brain"></i>
                        </div>
                        <span class="badge ${progress.tahap2Complete ? 'badge-success' : 'badge-outline'}">
                            ${progress.tahap2Complete ? 'Selesai' : 'Belum Dimulai'}
                        </span>
                    </div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Tahap 2: Refleksi AI</h3>
                    <div style="background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 8px; font-size: 0.8rem; font-style: italic; border: 1px dashed var(--border-color);">
                        "${progress.aiReadiness || 'Menunggu hasil analisis refleksi...'}"
                    </div>
                </div>

                <!-- Tahap 3 Card -->
                <div class="card" style="border-left: 4px solid var(--success);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(76, 175, 80, 0.2); display: flex; align-items: center; justify-content: center; color: var(--success);">
                            <i class="fas fa-poll"></i>
                        </div>
                        <span class="badge ${progress.tahap3Complete ? 'badge-success' : 'badge-outline'}">
                            ${progress.tahap3Complete ? 'Selesai' : 'Belum Dimulai'}
                        </span>
                    </div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Tahap 3: Asesmen HOTS</h3>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="flex: 1;">
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Skor Literasi & Numerasi</div>
                            <div class="progress-bar" style="height: 8px;">
                                <div class="progress-fill" style="width: ${scorePct}%; background: ${scorePct >= 75 ? 'var(--gradient-success)' : 'var(--gradient-danger)'};"></div>
                            </div>
                        </div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: ${scorePct >= 75 ? 'var(--success)' : 'var(--danger)'};">${scorePct}</div>
                    </div>
                </div>

                <!-- Tahap 4 Card -->
                <div class="card" style="border-left: 4px solid var(--accent);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(255, 213, 79, 0.2); display: flex; align-items: center; justify-content: center; color: var(--accent);">
                            <i class="fas fa-heart"></i>
                        </div>
                        <span class="badge ${progress.tahap4Complete ? 'badge-success' : 'badge-outline'}">
                            ${progress.tahap4Complete ? 'Selesai' : 'Belum Dimulai'}
                        </span>
                    </div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Tahap 4: Karakter</h3>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
                        Analisis karakter berdasarkan 7 Kebiasaan Hebat.
                        ${progress.tahap4Score ? `<br><strong style="color:var(--accent);">Skor Karakter: ${progress.tahap4Score}%</strong>` : ''}
                    </p>
                </div>
            </div>

            <!-- AI Feedback Section -->
            <div class="glass-card" style="margin-top: 2rem; padding: 1.5rem; border-top: 3px solid var(--primary);">
                <h3 style="font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-robot" style="color: var(--primary-light);"></i> Rekomendasi AI untuk Orang Tua
                </h3>
                <div style="background: rgba(0,0,0,0.2); padding: 1.25rem; border-radius: 12px; font-size: 0.9rem; line-height: 1.6; color: var(--text-primary);">
                    ${progress.tahap4Analysis || 'Data belum cukup untuk memberikan rekomendasi lengkap. Pastikan anak Anda menyelesaikan seluruh tahapan belajar.'}
                </div>
                ${progress.tahap4Details ? `
                    <ul style="margin-top: 1rem; padding-left: 1.5rem; color: var(--text-secondary); font-size: 0.85rem;">
                        ${progress.tahap4Details.slice(0, 3).map(d => `<li style="margin-bottom: 0.5rem;">${d}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>

        </div>
    `;
}

function downloadParentReportPDF() {
    // Memanfaatkan fungsi download yang sudah ada namun dipanggil dari konteks Parent
    if (typeof downloadProgressReportPDF === 'function') {
        downloadProgressReportPDF();
    } else {
        alert('Modul PDF belum dimuat. Mohon tunggu sebentar.');
    }
}
