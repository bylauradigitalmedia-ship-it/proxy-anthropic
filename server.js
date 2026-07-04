const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const API_KEY = process.env.ANTHROPIC_API_KEY;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

const NOTION_DBS = {
  "bylaura": "454b48c9-bb6f-82ee-9377-810f84e5f7ec",
  "ostéo": "8efb48c9-bb6f-8320-b12b-013f309725e9",
  "csc": "685b48c9-bb6f-8251-a64e-01401cfd9843",
  "creatkris": "7fa37bee-aadf-4717-9ef2-9dc049bc1654",
  "christina": "38eb48c9-bb6f-80c9-85db-e83ef586107e",
};

app.get("/", (req, res) => {
  res.send("Proxy OK");
});

app.post("/generate", async (req, res) => {
  if (!API_KEY) return res.status(500).json({ error: "Clé API manquante." });
  const { compte, sujet, format, objectif, tonne, détails } = req.body;
  if (!sujet || !compte) return res.status(400).json({ error: "Paramètres manquants." });

  const prompt = `Tu es un expert en community management Instagram francophone, spécialisé en croissance organique en 2026.

Fais une recherche web sur les tendances Instagram juillet 2026 pour : ${compte}

Puis générer un post Instagram optimiser :
Compte : ${compte}
Sujet : ${sujet}
Format : ${format}
Objectif : ${objectif}
Tonne : ${ton}
${details ? "Détails : " + détails : ""}

Répond UNIQUEMENT avec un JSON valide sans backticks :
{
  "tendances_trouvees": "reprendre tendances actuelles",
  "hook": " accroche 3-15 mots",
  "legende": "légende complète 150-300 mots",
  "structure_carrousel": "slides si carrousel sinon null",
  "premier_commentaire": "commentaire une affiche dans les 10 min",
  "story_relance": "story J+1",
  "angle_sauvegarde": "pourquoi sauvegarder ce post",
  "hashtags" : "h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12, h13, h14, h15"],
  "conseil_visuel": "conseil canva",
  "meilleur_jour": "Lundi ou Mardi ou Mercredi ou Jeudi ou Vendredi ou Samedi ou Dimanche",
  "meilleur_horaire": "HH:MM",
  "pourquoi_ce_slot": "explication courte",
  "algo_tips": "3 conseils algo 24h"
}`;

  essayer {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      méthode : « POST »,
      en-têtes : {
        "Content-Type": "application/json",
        "x-api-key" : API_KEY,
        "version anthropique": "2023-06-01",
      },
      corps : JSON.stringify({
        modèle : "claude-sonnet-4-6",
        max_tokens : 2500,
        outils : [{ type : "web_search_20250305", nom : "web_search" }],
        messages: [{ role: "utilisateur", content: invite }],
      }),
    });
    const data = await response.json();
    if (data.type === "error") return res.status(500).json({ error: data.error.message });
    const raw = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1) return res.status(500).json({ error: "JSON introuvable", raw: raw.substring(0, 200) });
    res.json(JSON.parse(raw.slice(start, end + 1)));
  } attraper (erreur) {
    res.status(500).json({ erreur: err.message });
  }
});

app.post("/notion-add", async (req, res) => {
  if (!NOTION_TOKEN) return res.status(500).json({ error: "Token Notion manquant." });
  const { compte_key, sujet, format, date, heure, hook, legende, hashtags, premier_commentaire, story_relance, conseil_visuel } = req.body;
  const dbId = NOTION_DBS[compte_key];
  if (!dbId) return res.status(400).json({ error: "Client non reconnu : " + compte_key });

  const hashtagsStr = (hashtags || []).map(h => "#" + h.replace(/^#/, "")).join(" ");

  essayer {
    const schemaRes = await fetch("https://api.notion.com/v1/databases/" + dbId, {
      en-têtes : { "Authorization": "Bearer " + NOTION_TOKEN, "Notion-Version": "2022-06-28" }
    });
    const schema = await schemaRes.json();
    if (schema.object === "error") return res.status(400).json({ error: schema.message });

    const props = schema.properties || {};
    const pageProps = {};

    const titleProp = Object.keys(props).find(k => props[k].type === "title");
    if (titleProp) pageProps[titleProp] = { title: [{ text: { content: sujet || "Publier sur Instagram" } }] };

    const dateProp = Object.keys(props).find(k => props[k].type === "date");
    if (dateProp && date) pageProps[dateProp] = { date: { start: date + (heure ? "T" + heure + ":00" : "") } };

    const statusProp = Object.keys(props).find(k => props[k].type === "status");
    si (statusProp) pageProps[statusProp] = { status: { name: "À faire" } };

    const createRes = await fetch("https://api.notion.com/v1/pages", {
      méthode : « POST »,
      en-têtes : {
        "Autorisation" : "Porteur" + NOTION_TOKEN,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      corps : JSON.stringify({
        parent : { database_id : dbId },
        propriétés : pageProps,
        enfants: [
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Hook" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte enrichi : [{ texte : { contenu : crochet || "" } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Légende" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte enrichi : [{ texte : { contenu : (légende || "").substring(0, 2000) } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Hashtags" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte_enrichi : [{ texte : { contenu : hashtagsStr } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Premier commentaire" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte_riche : [{ texte : { contenu : premier_commentaire || "" } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Article J+1" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte_riche : [{ texte : { contenu : story_relance || "" } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Visuel Canva" } }] } },
          { objet: "bloc", type: "paragraphe", paragraphe: { texte_riche: [{ texte: { contenu: conseil_visuel || "" } }] } },
        ]
      }),
    });

    const créé = await createRes.json();
    if (created.object === "error") return res.status(400).json({ error: created.message });
    res.json({ success: true, notion_url: created.url });
  } attraper (erreur) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = app;
