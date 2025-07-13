const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
require("dotenv").config();
const knowledge = require("./knowledge.json");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/fermenta-chatbot", async (req, res) => {
  try {
    const message = req.body.message;
    const email = req.body.email || "unknown";

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemPrompt = `
You are Fermenta — a sassy, caring, no-fluff gut health expert who helps people choose the right probiotic drink. You speak like a wellness-savvy friend who loves fermented drinks.

Recommend drinks from the list below based on user's message.

Product info:
${knowledge.products.map(p => `- ${p.name}: ${p.benefits}`).join("\n")}

FAQs:
${knowledge.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

Avoid medical claims. Be warm, concise, and emoji-friendly.
`;

    const userPrompt = User: ${message};

    // Optional: Simple logic to enhance accuracy for common keywords
    let recommendation = "";
    if (/bloat|digest|digestion/i.test(message)) {
      recommendation = "For digestion and bloating, drinks like Water Kefir and Kanji (Beetroot Sour) are especially effective.\n";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt + (recommendation ? "\n" + recommendation : "") }
      ]
    });

    const reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a reply.";

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "OpenAI returned no reply" });
  }
});

app.get("/", (req, res) => {
  res.send("Fermenta chatbot is running.");
});

app.listen(PORT, () => {
  console.log(Fermenta chatbot running on port ${PORT});
});
