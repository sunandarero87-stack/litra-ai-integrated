const fs = require('fs');
const path = 'c:/Users/user/Documents/Absen Februari/frontend/pages-student.js';
let content = fs.readFileSync(path, 'utf8');

const target = '<div class="question-text" style="white-space:pre-line">${q.question}</div>';
const replacement = '${q.image ? `<div class="question-image mt-2" style="text-align:center;"><img src="${q.image}" style="max-width:100%; max-height:250px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1); border:1px solid var(--border-color);"></div>` : ""}\n            <div class="question-text ${q.image ? "mt-1" : ""}" style="white-space:pre-line">${q.question}</div>';

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully updated pages-student.js');
} else {
    console.log('Target not found');
    // Try a more flexible match
    const regex = /<div class="question-text" style="white-space:pre-line">\$\{q\.question\}<\/div>/;
    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(path, content);
        console.log('Successfully updated pages-student.js via regex');
    } else {
        console.log('Regex also failed');
    }
}
