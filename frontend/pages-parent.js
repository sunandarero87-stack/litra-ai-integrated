/**
 * PAGES-PARENT.JS
 * Dashboard khusus orang tua untuk memonitoring progres belajar anak.
 * Dirancang dengan antarmuka bersih, informatif, dan premium.
 */

function renderParentDashboard(container) {
    // Gunakan linkedStudent jika role adalah orang_tua, jika tidak fallback ke username sendiri (legacy)
    const studentUsername = currentUser.role === 'orang_tua' ? currentUser.linkedStudent : currentUser.username;

    const progress = getProgress(studentUsername);
    const results = getAssessmentResults();
    const myResult = results[studentUsername] || progress.assessmentResult || { score: 0, total: 10, literasi: 0, numerasi: 0 };
    const scorePct = myResult.pct !== undefined ? myResult.pct : (myResult.total > 0 ? Math.round((myResult.score / myResult.total) * 100) : 0);

    // Hitung progress keseluruhan (25% per tahap yang selesai)
    let overallProgress = 0;
    if (progress.tahap1Complete) overallProgress += 25;
    if (progress.tahap2Complete) overallProgress += 25;
    if (progress.tahap3Complete) overallProgress += 25;
    if (progress.tahap4Complete) overallProgress += 25;

    // Gunakan info siswa dari user object jika tersedia (untuk akun ortu terpisah)
    const displayName = currentUser.role === 'orang_tua' ? (currentUser.studentName || studentUsername) : currentUser.name;
    const displayKelas = currentUser.role === 'orang_tua' ? (currentUser.studentKelas || '-') : (currentUser.kelas || '-');

    // Memproses teks analisis AI untuk menghindari [object Object]
    let t4AnalysisText = progress.tahap4Analysis;
    if (typeof t4AnalysisText === 'object' && t4AnalysisText !== null) {
        t4AnalysisText = t4AnalysisText.analysis || '';
    }

    let aiReadinessText = progress.aiReadiness;
    if (typeof aiReadinessText === 'string' && aiReadinessText.startsWith('{')) {
        try {
            const parsed = JSON.parse(aiReadinessText);
            aiReadinessText = parsed.analysis ? (parsed.analysis.umum || parsed.analysis.isi || JSON.stringify(parsed.analysis)) : aiReadinessText;
        } catch(e) {}
    } else if (typeof aiReadinessText === 'object' && aiReadinessText !== null) {
        aiReadinessText = aiReadinessText.analysis ? (aiReadinessText.analysis.umum || aiReadinessText.analysis.isi || JSON.stringify(aiReadinessText.analysis)) : JSON.stringify(aiReadinessText);
    }

    // Menyusun Rekomendasi Komprehensif (Mewakili Tahap 1 - 4)
    let parentRecommendationText = '';
    let parentDetails = [];
    
    if (overallProgress === 100) {
        parentRecommendationText = `<strong>Rangkuman Pembelajaran (Tahap 1-4):</strong> Anak Anda telah menyelesaikan seluruh rangkaian pembelajaran NARA-AI dengan sangat baik. Pada Tahap 3 (Asesmen), ia meraih skor <strong>${scorePct}%</strong>. Selain itu, pada Tahap 4 (Karakter), ia menunjukkan perkembangan positif (Skor: <strong>${progress.tahap4Score || 0}%</strong>).`;
        parentDetails = [
            "Ajak anak berdiskusi ringan mengenai materi yang telah dipelajarinya untuk melatih daya ingat dan komunikasi.",
            "Berikan apresiasi atas pencapaian skor dan kemandiriannya agar motivasi belajarnya terus meningkat.",
            "Dampingi anak dalam mengaplikasikan 7 Kebiasaan Hebat dalam kegiatan sehari-hari di rumah."
        ];
    } else if (progress.tahap3Complete) {
        parentRecommendationText = `<strong>Progres Saat Ini (Tahap 3 Selesai):</strong> Anak Anda telah melewati asesmen utama (Tahap 3) dengan skor <strong>${scorePct}%</strong>. Saat ini ia sedang atau akan memasuki Tahap 4 (Pembentukan Karakter). Berikan motivasi agar ia dapat merefleksikan 7 Kebiasaan Hebat dengan baik.`;
        parentDetails = [
            `Evaluasi bersama hasil asesmen ${scorePct}% yang didapat, fokus pada perbaikan pemahaman logika dan konsep dasar.`,
            "Ingatkan anak untuk selalu teliti dan tidak terburu-buru saat menjawab pertanyaan evaluasi.",
            "Berikan semangat untuk menyelesaikan Tahap 4 agar seluruh rangkaian pembelajaran tuntas."
        ];
    } else if (progress.tahap2Complete) {
        parentRecommendationText = `<strong>Progres Saat Ini (Tahap 2 Selesai):</strong> Anak Anda telah menyelesaikan refleksi mandiri (Tahap 2) dan bersiap menghadapi asesmen utama (Tahap 3). Pastikan ia mengulang materi yang sulit sebelum mengerjakan soal evaluasi.`;
        parentDetails = [
            "Pantau persiapan anak sebelum menghadapi asesmen utama.",
            "Pastikan anak mendapat istirahat yang cukup agar fokus saat mengerjakan soal.",
            "Bantu ingatkan konsep-konsep kunci yang ada pada materi pembelajaran."
        ];
    } else if (progress.tahap1Complete) {
        parentRecommendationText = `<strong>Progres Saat Ini (Tahap 1 Selesai):</strong> Anak Anda telah menyelesaikan eksplorasi materi (Tahap 1). Langkah selanjutnya adalah refleksi pemahaman (Tahap 2). Berikan dorongan agar ia berani mengungkapkan pemahamannya.`;
        parentDetails = [
            "Tanyakan poin menarik yang baru ia pelajari dari materi tersebut.",
            "Berikan dorongan untuk selalu bertanya kepada guru atau AI jika ada yang belum dimengerti.",
            "Latih anak untuk merangkum pelajaran dengan kata-katanya sendiri."
        ];
    } else {
        parentRecommendationText = `Sistem NARA-AI sedang mengumpulkan data aktivitas belajar anak Anda. Rekomendasi personal akan muncul secara otomatis seiring dengan kemajuan belajar anak dari Tahap 1 hingga Tahap 4.`;
        parentDetails = [];
    }

    // Tambahkan catatan khusus AI Tahap 4 jika sudah ada (mewakili hasil asesmen karakter)
    if (t4AnalysisText && typeof t4AnalysisText === 'string' && t4AnalysisText.trim() !== '') {
        parentRecommendationText += `<br><br><span style="color: var(--accent);"><strong>Catatan Khusus Karakter (Tahap 4):</strong></span><br><em style="color: var(--text-secondary);">"${t4AnalysisText}"</em>`;
        if (progress.tahap4Details && Array.isArray(progress.tahap4Details)) {
            // Kita bisa juga memasukkan rincian saran dari AI tahap 4 jika sudah lengkap
            parentDetails = progress.tahap4Details;
        }
    }

    // Fallback for legacy data missing Literasi & Numerasi breakdown
    let litScore = progress.tahap1LiterasiScore || 0;
    let numScore = progress.tahap1NumerasiScore || 0;
    if (litScore === 0 && numScore === 0 && progress.tahap1Score > 0) {
        litScore = progress.tahap1Score;
    }

    container.innerHTML = `
        <div class="dashboard-parent" style="max-width: 1100px; margin: 0 auto; animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
            
            <!-- Header Monitoring -->
            <div class="glass-card" style="padding: 2.5rem; margin-bottom: 2rem; background: linear-gradient(135deg, rgba(26, 115, 232, 0.15) 0%, rgba(5, 12, 24, 0.4) 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); backdrop-filter: blur(10px);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                            <div style="width: 50px; height: 50px; border-radius: 15px; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(26, 115, 232, 0.3);">
                                <i class="fas fa-shield-alt" style="color: white; font-size: 1.5rem;"></i>
                            </div>
                            <div>
                                <h2 style="font-size: 2rem; font-weight: 800; margin: 0; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Monitor Belajar Anak</h2>
                                <p style="color: var(--text-secondary); font-size: 1.1rem; margin: 0;">Pendampingan Belajar Digital untuk <strong>${displayName}</strong></p>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <div style="text-align: right; margin-right: 1rem; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 1.5rem;">
                            <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Kelas Aktif</div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-light);">${displayKelas}</div>
                        </div>
                        <button class="btn btn-primary" onclick="downloadParentReportPDF()" style="padding: 0.8rem 1.8rem; border-radius: 14px; font-weight: 700; box-shadow: 0 10px 20px rgba(26, 115, 232, 0.2); transition: all 0.3s ease;">
                            <i class="fas fa-file-pdf" style="margin-right: 8px;"></i> Laporan Progres
                        </button>
                    </div>
                </div>

                <div style="margin-top: 2.5rem; background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; align-items: center;">
                        <span style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">Target Kurikulum Semester Ini</span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.8rem; font-weight: 900; color: var(--success); text-shadow: 0 0 20px rgba(34,197,94,0.3);">${overallProgress}%</span>
                            <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">Tercapai</span>
                        </div>
                    </div>
                    <div class="progress-bar" style="height: 14px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                        <div class="progress-fill" style="width: ${overallProgress}%; background: linear-gradient(90deg, #10b981, #34d399); box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); border-radius: 10px;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.75rem;">
                        <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fas fa-info-circle"></i> Berdasarkan penyelesaian 4 tahapan NARA-AI</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">Tahap Aktif: ${progress.tahap || 1}</span>
                    </div>
                </div>
            </div>

            <!-- Grid Tahapan -->
            <div class="grid-2" style="gap: 1.5rem;">
                
                <!-- Tahap 1 Card - DITINGKATKAN -->
                <div class="card" style="border: 1px solid rgba(26, 115, 232, 0.2); background: linear-gradient(145deg, var(--bg-card), rgba(26, 115, 232, 0.05)); position: relative; overflow: hidden; padding: 1.8rem;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(26, 115, 232, 0.05); border-radius: 50%; filter: blur(30px);"></div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; align-items: center;">
                        <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(26, 115, 232, 0.15); display: flex; align-items: center; justify-content: center; color: var(--primary-light); font-size: 1.4rem;">
                            <i class="fas fa-book-reader"></i>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end;">
                            <span class="badge ${progress.tahap1Complete ? 'badge-success' : 'badge-warning'}" style="padding: 0.4rem 1rem; border-radius: 20px; font-weight: 700; font-size: 0.75rem;">
                                ${progress.tahap1Complete ? '<i class="fas fa-check-circle"></i> Selesai' : '<i class="fas fa-clock"></i> Sedang Berjalan'}
                            </span>
                        </div>
                    </div>

                    <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.5rem; color: white;">Tahap 1: Eksplorasi Materi</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
                        Anak Anda berdiskusi secara interaktif dengan NARA-AI untuk membedah isi modul pembelajaran.
                    </p>
                    
                    <div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 1.2rem; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Rata-Rata Literasi & Numerasi</span>
                            <span style="font-size: 1.4rem; font-weight: 900; color: ${progress.tahap1Score >= 80 ? 'var(--success)' : (progress.tahap1Score >= 50 ? 'var(--accent)' : (progress.tahap1Score !== undefined ? 'var(--danger)' : 'var(--text-muted)'))};">
                                ${progress.tahap1Score !== undefined ? progress.tahap1Score + '%' : '--'}
                            </span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.8rem; display: flex; gap: 10px;">
                            <span style="background: rgba(26, 115, 232, 0.1); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(26, 115, 232, 0.2);">Literasi: <strong>${litScore}%</strong></span>
                            <span style="background: rgba(0, 188, 212, 0.1); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(0, 188, 212, 0.2);">Numerasi: <strong>${numScore}%</strong></span>
                        </div>
                        <div class="progress-bar" style="height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                            <div class="progress-fill" style="width: ${progress.tahap1Score || 0}%; background: ${progress.tahap1Score >= 80 ? 'var(--gradient-success)' : (progress.tahap1Score >= 50 ? 'var(--gradient-accent)' : 'var(--gradient-danger)')}; border-radius: 5px; box-shadow: 0 0 10px ${progress.tahap1Score >= 80 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};"></div>
                        </div>
                        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.8rem; line-height: 1.4;">
                            ${progress.tahap1Score >= 80 ? '✨ Pemahaman anak sangat baik terhadap materi ini.' :
            (progress.tahap1Score >= 50 ? '💡 Anak sudah memahami dasar materi, namun perlu pengayaan.' :
                (progress.tahap1Score !== undefined ? '⚠️ Perlu bimbingan lebih lanjut untuk mengulang materi.' : 'Menunggu anak menyelesaikan sesi diskusi.'))}
                        </p>
                    </div>
                </div>

                <!-- Tahap 2 Card -->
                <div class="card" style="border-left: 4px solid var(--secondary); background: linear-gradient(145deg, var(--bg-card), rgba(0, 188, 212, 0.03)); padding: 1.8rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                        <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(0, 188, 212, 0.15); display: flex; align-items: center; justify-content: center; color: var(--secondary); font-size: 1.4rem;">
                            <i class="fas fa-brain"></i>
                        </div>
                        <span class="badge ${progress.tahap2Complete ? 'badge-success' : 'badge-outline'}" style="padding: 0.4rem 1rem; border-radius: 20px;">
                            ${progress.tahap2Complete ? 'Selesai' : 'Belum Dimulai'}
                        </span>
                    </div>
                    <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.8rem; color: white;">Tahap 2: Refleksi AI</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">Analisis kesiapan belajar berdasarkan refleksi esai mandiri anak.</p>
                    <div style="background: rgba(0, 188, 212, 0.05); padding: 1rem; border-radius: 12px; font-size: 0.85rem; font-style: italic; border: 1px dashed rgba(0, 188, 212, 0.3); color: var(--secondary); line-height: 1.5;">
                        <i class="fas fa-quote-left" style="opacity: 0.5; margin-right: 5px;"></i>
                        ${aiReadinessText || 'Menunggu hasil analisis refleksi anak untuk memberikan diagnosa kesiapan...'}
                    </div>
                </div>

                <!-- Tahap 3 Card -->
                <div class="card" style="border-left: 4px solid var(--success); background: linear-gradient(145deg, var(--bg-card), rgba(76, 175, 80, 0.03)); padding: 1.8rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                        <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(76, 175, 80, 0.15); display: flex; align-items: center; justify-content: center; color: var(--success); font-size: 1.4rem;">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <span class="badge ${progress.tahap3Complete ? 'badge-success' : 'badge-outline'}" style="padding: 0.4rem 1rem; border-radius: 20px;">
                            ${progress.tahap3Complete ? 'Selesai' : 'Belum Dimulai'}
                        </span>
                    </div>
                    <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.5rem; color: white;">Tahap 3: Asesmen HOTS</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.2rem;">Uji kompetensi Literasi & Numerasi tingkat tinggi (HOTS).</p>
                    
                    <div style="display: flex; align-items: center; gap: 1.5rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 16px;">
                        <div style="position: relative; width: 60px; height: 60px;">
                            <svg viewBox="0 0 36 36" style="width: 60px; height: 60px; transform: rotate(-90deg);">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${scorePct >= 75 ? 'var(--success)' : 'var(--danger)'}" stroke-width="3" stroke-dasharray="${scorePct}, 100" />
                            </svg>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.9rem; font-weight: 900; color: white;">${scorePct}</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.2rem;">Skor Penilaian</div>
                            <div style="font-size: 1.1rem; font-weight: 700; color: ${scorePct >= 75 ? 'var(--success)' : 'var(--danger)'};">
                                ${scorePct >= 75 ? 'Melebihi KKM' : (progress.tahap3Complete ? 'Di bawah KKM' : 'Menunggu Ujian')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tahap 4 Card -->
                <div class="card" style="border-left: 4px solid var(--accent); background: linear-gradient(145deg, var(--bg-card), rgba(255, 213, 79, 0.03)); padding: 1.8rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                        <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(255, 213, 79, 0.15); display: flex; align-items: center; justify-content: center; color: var(--accent); font-size: 1.4rem;">
                            <i class="fas fa-medal"></i>
                        </div>
                        <span class="badge ${progress.tahap4Complete ? 'badge-success' : 'badge-outline'}" style="padding: 0.4rem 1rem; border-radius: 20px;">
                            ${progress.tahap4Complete ? 'Selesai' : 'Belum Dimulai'}
                        </span>
                    </div>
                    <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.5rem; color: white;">Tahap 4: Pembentukan Karakter</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">Analisis 7 Kebiasaan Hebat Anak Indonesia.</p>
                    ${progress.tahap4Score ? `
                        <div style="display:flex; align-items:center; gap:0.5rem; color:var(--accent); font-weight:800; background:rgba(255,213,79,0.1); padding:0.6rem 1rem; border-radius:10px; width:fit-content;">
                            <i class="fas fa-star"></i> Skor Karakter: ${progress.tahap4Score}%
                        </div>
                    ` : '<div style="color:var(--text-muted); font-size:0.8rem; font-style:italic;">Belum ada data karakter...</div>'}
                </div>
            </div>

            <!-- AI Feedback Section -->
            <div class="glass-card" style="margin-top: 2rem; padding: 2rem; border-top: 4px solid var(--primary); border-radius: 24px;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white;">
                        <i class="fas fa-robot"></i>
                    </div>
                    <h3 style="font-size: 1.3rem; font-weight: 800; margin: 0; color: white;">Rekomendasi AI untuk Orang Tua</h3>
                </div>
                
                <div style="background: rgba(0,0,0,0.3); padding: 1.8rem; border-radius: 18px; font-size: 1rem; line-height: 1.7; color: var(--text-primary); border: 1px solid rgba(255,255,255,0.05); box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);">
                    <i class="fas fa-lightbulb" style="color: var(--accent); margin-right: 10px;"></i>
                    ${parentRecommendationText}
                </div>
                
                ${parentDetails && parentDetails.length > 0 ? `
                    <div style="margin-top: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        ${parentDetails.slice(0, 3).map(d => `
                            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border-left: 3px solid var(--primary-light); font-size: 0.85rem; color: var(--text-secondary);">
                                ${d}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- Footer Info -->
            <div style="text-align: center; margin-top: 3rem; color: var(--text-muted); font-size: 0.85rem;">
                <p>© 2026 NARA-AI Pak Nandar • Sistem Monitoring Orang Tua Terintegrasi</p>
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
