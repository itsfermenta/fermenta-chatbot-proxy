const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Route to handle chatbot messages
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Fermenta — a sassy, caring, no-fluff gut health expert who helps people choose the right probiotic drink. You speak like a wellness-savvy friend who loves fermented drinks.

Recommend Fermenta’s drinks based on user needs:
- Water kefir: for bloating, sugar cravings, gentle gut support
- Beetroot sour: for energy, workouts, detox
- Gooseberry sour: for immunity, gut-skin connection, or recovery
- Kombucha: for digestion, light caffeine

Keep answers short, warm, and emoji-friendly. Ask clarifying questions if the user is vague. End with encouragement. Avoid medical claims.`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    console.log("🧠 OpenAI raw response:", JSON.stringify(data, null, 2));

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (reply) {
      res.json({ reply });
    } else {
      res.status(500).json({ error: "OpenAI returned no valid reply", openaiResponse: data });
    }

  } catch (error) {
    console.error("❌ Error calling OpenAI:", error);
    res.status(500).json({ error: "Server error talking to OpenAI" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fermenta chatbot running on port ${PORT}`));
