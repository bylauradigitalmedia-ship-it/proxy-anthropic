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

  const { compte, sujet, format, objectif, ton, details } = req.body;

  if (!sujet || !compte) {
    return res.status(400).json({ error: "Paramètres manquants." });
  }

  const prompt = `Tu es un expert en community management Instagram francophone, parfaitement au courant des tendances et de l'algorithme Instagram en 2026.

MISSION EN 2 ÉTAPES :

ÉTAPE 1 — Fais une recherche web sur :
- Les tendances Instagram actuelles en juillet 2026 pour le secteur : ${compte}
- Les formats qui performent le mieux en ce moment sur Instagram
- Les mises à jour récentes de l'algorithme Instagram 2026

ÉTAPE 2 — En t'appuyant sur ces tendances trouvées, génère un post Instagram complet avec ces paramètres :
Activité / compte : ${compte}
Sujet : ${sujet}
Format : ${format}
Objectif : ${objectif}
Ton : ${ton}
${details ? "Détails : " + details : ""}

Réponds UNIQUEMENT avec un objet JSON valide, sans backticks, sans texte avant ou après :
{
  "tendances_trouvees": "Résumé en 2-3 phrases des tendances actuelles trouvées pour ce secteur",
  "hook": "Première phrase accrocheuse max 15 mots qui stoppe le scroll, basée sur les tendances actuelles",
  "legende": "Légende complète avec emojis, sauts de ligne, CTA final. 150-300 mots. Intègre les codes actuels d'Instagram.",
  "structure_carrousel": "Si format carrousel : liste des slides numérotées avec titre accrocheur. Sinon : null",
  "hashtags": ["hashtag1","hashtag2","hashtag3","hashtag4","hashtag5","hashtag6","hashtag7","hashtag8","hashtag9","hashtag10","hashtag11","hashtag12","hashtag13","hashtag14","hashtag15"],
  "conseil_visuel": "Conseil visuel Canva adapté aux tendances visuelles actuelles d'Instagram",
  "meilleur_moment": "Meilleur moment de publication en 2026 pour ce type de contenu et ce secteur",
  "algo_tips": "2-3 conseils spécifiques pour maximiser la portée avec l'algorithme Instagram actuel"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search"
          }
        ],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (data.type === "error") {
      return res.status(500).json({ error: data.error.message });
    }

    // Extraire le texte final (après la recherche web)
    const textBlocks = (data.content || []).filter(b => b.type === "text");
    const raw = textBlocks.map(b => b.text || "").join("");

    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start === -1) {
      return res.status(500).json({ error: "Réponse inattendue de l'IA.", raw });
    }

    const parsed = JSON.parse(raw.slice(start, end + 1));
    res.json(parsed);

  } catch (err) {
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
});

app.get("/", (req, res) => res.send("Proxy Anthropic OK ✓"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy lancé sur port " + PORT));
