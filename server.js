const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const API_KEY = process.env.ANTHROPIC_API_KEY;

app.post("/generate", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur." });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
});

app.get("/", (req, res) => res.send("Proxy Anthropic OK ✓"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy lancé sur port " + PORT));
