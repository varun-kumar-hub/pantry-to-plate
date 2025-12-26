
async function listModels() {
    // using the key provided by the user in Step 1884
    const key = "AIzaSyAuU9jo76NY-nx7e4p4SeWa26T6TLTVcqk";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Error status:", response.status);
            console.log(await response.text());
            return;
        }

        const data = await response.json();
        console.log("Available Models:");
        // Filter for gemini models
        const models = data.models
            .filter(m => m.name.includes('gemini'))
            .map(m => m.name);

        console.log(JSON.stringify(models, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
