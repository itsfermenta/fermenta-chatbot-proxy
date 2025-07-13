const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Sample product and FAQ data
const knowledge = {
  products: [
    {
      name: "Beetroot Sour",
      benefits: "Boosts energy, supports workouts, may help detoxification, and is rich in antioxidants"
    },
    {
      name: "Water Kefir",
      benefits: "Gentle on the gut, supports digestion, helps reduce bloating and sugar cravings"
    },
    {
      name: "Gooseberry Sour",
      benefits: "Strengthens immunity, supports skin health, and helps gut-skin balance"
    },
    {
      name: "Kombucha",
      benefits: "Aids digestion, provides a gentle caffeine kick, and refreshes naturally"
    }
  ],
  faqs: [
    {
      question: "Is your kombucha caffeine-free?",
      answer: "It has a small amount of caffeine from the tea base — perfect for a gentle lift 🌿"
    },
    {
      question: "Can kids drink water kefir?",
      answer: "Yes! Water kefir is low in sugar and caffeine-free, making it a great option for all ages 🧃"
    },
    {
      question: "Does beetroot sour taste sweet?",
      answer: "It’s earthy with a subtle tang — not sugary, but super refreshing 💪"
    }
  ]
};

const systemPrompt = `
You are Fermenta — a fun, caring, no-fluff gut health expert who helps people choose the right probiotic drink. You speak like a wellness-savvy friend who loves fermented drinks.

Note: "Beetroot sour" & "aamla sour" are also known as "beetroot kanji" or "beetroot kaanji" and "aamla kanji" or "aamla kaanji" - they are the same fermented drinks made from beetroot and spices and aamla and spices respectively.
Note: "Beetroot sour" is also similar to "Beetroot Kvass"

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
