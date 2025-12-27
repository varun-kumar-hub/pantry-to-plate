
async function test() {
    const key = "AIzaSyCaUiJ9lXF7aBpiySvCoqO1sKbKHuQyhLY";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Suggest a pasta recipe" }] }]
            })
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
