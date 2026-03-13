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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" +
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
    let text = "";
    const firstCandidate = candidates[0];
    if (firstCandidate?.content?.parts?.length) {
      text = firstCandidate.content.parts
        .map((p) => (typeof p.text === "string" ? p.text : ""))
        .join("");
    }
    text = (text || "").trim();
    if (!text) {
      console.error("Gemini empty response:", JSON.stringify(data).slice(0, 500));
      res.status(502).json({ error: "empty_response", raw: data?.candidates?.[0]?.finishReason });
      return;
    }

    res.status(200).json({ text });
  } catch (e) {
    console.error("analyze API error:", e);
    res.status(500).json({ error: "internal_error", message: e?.message });
  }
}

