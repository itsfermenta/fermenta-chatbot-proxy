const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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
            content: "You are Fermenta, a cheerful gut health expert. Suggest probiotic drinks based on user needs.",
          },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      }),
    });

    const data = await response.json();

    console.log("🧠 OpenAI raw response:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({
        error: "OpenAI returned no valid reply",
        openaiResponse: data
      });
    }

    const reply = data.choices[0].message.content.trim();
    res.json({ reply });

  } catch (error) {
    console.error("❌ Error calling OpenAI:", error);
    res.status(500).json({ error: "Server error talking to OpenAI" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fermenta chatbot running on port ${PORT}`));
