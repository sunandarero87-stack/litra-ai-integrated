function cleanJson(text) {
    if (!text) return "";
    let str = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match) return match[1].trim();

    const startObj = str.indexOf('{');
    const startArr = str.indexOf('[');
    if (startObj !== -1 && (startArr === -1 || startObj < startArr)) {
        const endObj = str.lastIndexOf('}');
        if (endObj !== -1) return str.substring(startObj, endObj + 1);
    } else if (startArr !== -1) {
        const endArr = str.lastIndexOf(']');
        if (endArr !== -1) return str.substring(startArr, endArr + 1);
    }
    return str.replace(/```json/gi, "").replace(/```/g, "").trim();
}

console.log(cleanJson('Berikut pertanyaannya:\n\n```json\n["A", "B"]\n```\n\nSemoga membantu.'));
console.log(cleanJson('Ini hasil\n[  "Z"  ]\n'));
console.log(cleanJson('Ini hasil\n{  "a": "b"  }\n'));
console.log(cleanJson('<think>Hmmm</think>["Q1", "Q2"]'));
