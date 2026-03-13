export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY is not set" });
    return;
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.7,
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      const text = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, text);
      res.status(500).json({ error: "Gemini API error" });
      return;
    }

    const data = await geminiRes.json();
    const candidates = data.candidates || [];
    const text =
      candidates[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

    res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
}

