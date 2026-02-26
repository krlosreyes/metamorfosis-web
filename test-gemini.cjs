async function test() {
    const key = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const model = 'imagen-3.0-generate-001';
    const primaryPrompt = 'A conceptual metaphor representing: fast minimalist 3D isometric style';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${key}`;
    console.log("Calling " + url.replace(key, "HIDDEN_KEY"));
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            instances: [{ prompt: primaryPrompt }],
            parameters: { sampleCount: 1 }
        })
    });

    console.log("Status:", res.status, res.statusText);
    const text = await res.text();
    console.log("Response Body (first 100 chars):", text.substring(0, 100));
}
test();
