const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Sample product and FAQ data
const knowledge = {
  products: [
    { name: "Water Kefir", benefits: "for bloating, sugar cravings, gentle gut support" },
    { name: "Beetroot Sour", benefits: "for energy, workouts, detox" },
    { name: "Gooseberry Sour", benefits: "for immunity, gut-skin connection, recovery" },
    { name: "Kombucha", benefits: "for digestion, light caffeine" }
  ],
  faqs: [
    { question: "Is this safe during pregnancy?", answer: "Our drinks are natural, but always check with your doctor." },
    { question: "Does it contain sugar?", answer: "We use minimal sugar just enough to ferment—no added junk." }
  ]
};

const systemPrompt = `
You are Fermenta — a sassy, caring, no-fluff gut health expert who helps people choose the right probiotic drink. You speak like a wellness-savvy friend who loves fermented drinks.

Recommend drinks from the list below based on user's message.

Product info:
${knowledge.products.map(p => `- ${p.name}: ${p.benefits}`).join('\n')}

FAQs:
${knowledge.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}

Avoid medical claims. Be warm, concise, and emoji-friendly.
`;

// POST route
app.post("/fermenta-chatbot", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Missing message in request body" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (reply) {
      res.json({ reply });
    } else {
      res.status(500).json({ error: "OpenAI returned no valid reply", openaiResponse: data });
    }

  } catch (error) {
    console.error("❌ OpenAI Error:", error);
    res.status(500).json({ error: "Server error talking to OpenAI" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Fermenta chatbot running on port ${PORT}`));
