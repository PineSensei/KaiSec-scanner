const { OpenAI } = require("openai");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildPrompt(results) {
  return `
You are a cybersecurity auditor for a small business platform.

Explain this scan in a friendly way:
- Summarize each tool’s findings (like Nikto, Nmap, Dirb)
- Explain risks in plain English
- Give easy, specific fix steps (e.g., "Install the plugin XYZ to add missing security headers")

Avoid technical jargon. Speak as if you're explaining this to a business owner with no IT background.

Here is the scan result:
${JSON.stringify(results, null, 2)}
`;
}

app.post("/summarize", async (req, res) => {
  const { results } = req.body;
  if (!results) return res.status(400).json({ error: "Missing results" });

  try {
    const prompt = buildPrompt(results);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    res.json({ summary: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "GPT summarization failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KaiSec summary server running on port ${PORT}`);
});
