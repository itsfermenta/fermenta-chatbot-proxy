const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/fermenta-chatbot", async (req, res) => {
  const userMessage = req.body.message;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Fermenta, a fun gut-health expert. Be friendly and suggest the right drink." },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7
    }),
  });

  const data = await response.json();
  res.json({ reply: data.choices?.[0]?.message?.content });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(Fermenta chatbot running on port ${PORT}));
