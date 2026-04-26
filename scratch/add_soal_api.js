const targetKelas = process.argv[2] || "Semua Kelas";

const questions = [
    {
        question: "Pendekatan yang menggabungkan logika dan sistematis untuk memecahkan masalah dengan cara yang efisien dan terstruktur. Ini adalah keterampilan penting yang dapat diterapkan tidak hanya dalam dunia teknologi dan komputer, tetapi juga dalam banyak aspek kehidupan lainnya, seperti pendidikan, bisnis, dan kehidupan sehari-hari. Dari pernyataan diatas merupakan pemahaman konsep ......",
        options: [
            "Algoritma",
            "Dekomposisi",
            "Berpikir Komputasional",
            "Unplugged"
        ],
        correct: 2, // C
        explanation: "Berpikir komputasional adalah pendekatan logis dan sistematis untuk memecahkan masalah yang dapat diterapkan dalam kehidupan sehari-hari.",
        type: "literasi",
        topic: "Berpikir Komputasional",
        grade: "7 SMP",
        kelas: targetKelas,
        difficulty: "LOTS"
    },
    {
        question: "Bu Mira meminta para siswa untuk mengerjakan aktivitas, yaitu mereka diminta untuk membuat algoritma manual yang menggambarkan langkah-langkah untuk mempersiapkan suatu makanan ringan, seperti sandwich. Setiap siswa diminta untuk menuliskan instruksi secara rinci untuk teman mereka mengikuti langkah-langkah tersebut. Tujuannya adalah untuk mengajarkan konsep algoritma dan dekomposisi karena para siswa harus memecah tugas besar (membuat sandwich) menjadi langkah-langkah kecil yang bisa diikuti.\n\nYang dilakukan siswa dalam aktivitas tersebut menggunakan metode...",
        options: [
            "Unplugged",
            "Plugged",
            "Abstraksi",
            "Pengenalan Pola"
        ],
        correct: 0, // A
        explanation: "Aktivitas pembelajaran informatika yang dilakukan secara manual tanpa menggunakan perangkat komputer (PC/Laptop) disebut dengan metode Unplugged.",
        type: "literasi",
        topic: "Berpikir Komputasional",
        grade: "7 SMP",
        kelas: targetKelas,
        difficulty: "MOTS"
    }
];

async function addQuestions() {
    for (const q of questions) {
        const res = await fetch('http://localhost:3000/api/question-bank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q)
        });
        if (!res.ok) {
            console.error('Failed to add question:', await res.text());
        } else {
            console.log('Added question successfully');
        }
    }
}

addQuestions();
