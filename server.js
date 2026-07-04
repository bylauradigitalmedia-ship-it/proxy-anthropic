const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const NOTION_KEY = process.env.NOTION_TOKEN;
const DBS = {
  parlaura : "454b48c9-bb6f-82ee-9377-810f84e5f7ec",
  ostéo: "8efb48c9-bb6f-8320-b12b-013f309725e9",
  csc : "685b48c9-bb6f-8251-a64e-01401cfd9843",
  créationkris : "7fa37bee-aadf-4717-9ef2-9dc049bc1654",
  Christina : "38eb48c9-bb6f-80c9-85db-e83ef586107e"
};

app.get("/", (req, res) => res.send("OK"));

app.post("/generate", async (req, res) => {
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "Cle API manquante" });
  const { compte, sujet, format, objectif, tonne, détails } = req.body;
  if (!sujet || !compte) return res.status(400).json({ error: "Paramètres manquants" });
  const prompt = "Tu es expert CM Instagram 2026. Recherche les tendances pour : " + compte + ". Sujet: " + sujet + ". Format: " + format + ". Objectif: " + objectif + ". Ton: " + ton + (détails ? ". Détails: " + détails : "") + ". Répond UNIQUEMENT en JSON sans backticks: {\"tendances_trouvees\":\"...\",\"hook\":\"...\",\"legende\":\"...\",\"structure_carrousel\":\"...\",\"premier_co mmentaire\":\"...\",\"story_relance\":\"...\",\"angle_sauvegarde\":\"...\",\"hashtags\":[\"h1\",\"h2\",\"h3\",\"h 4\",\"h5\",\"h6\",\"h7\",\"h8\",\"h9\",\"h10\",\"h11\",\"h12\",\"h13\",\"h14\",\"h15\"],\"conseil_visuel\":\"...\ ",\"meilleur_jour\":\"Lundi\",\"meilleur_horaire\":\"18:00\",\"pourquoi_ce_slot\":\"...\",\"algo_tips\":\"...\"}";
  essayer {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      méthode : « POST »,
      en-têtes : { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      corps : JSON.stringify({ modèle : "claude-sonnet-4-6", max_tokens : 2500, outils : [{ type : "web_search_20250305", nom : "web_search" }], messages : [{ rôle : "utilisateur", contenu : prompt }] })
    });
    const d = await r.json();
    if (d.type === "error") return res.status(500).json({ error: d.error.message });
    const raw = (d.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
    si (s === -1) retourner res.status(500).json({ erreur: "JSON introuvable" });
    res.json(JSON.parse(raw.slice(s, e + 1)));
  } attraper (erreur) {
    res.status(500).json({ erreur: err.message });
  }
});

app.post("/notion-add", async (req, res) => {
  if (!NOTION_KEY) return res.status(500).json({ error: "Token Notion manquant" });
  const { compte_key, sujet, format, date, heure, hook, legende, hashtags, premier_commentaire, story_relance, conseil_visuel } = req.body;
  const dbId = DBS[compte_key];
  if (!dbId) return res.status(400).json({ error: "Client inconnu: " + compte_key });
  const tags = (hashtags || []).map(h => "#" + h.replace(/^#/, "")).join(" ");
  essayer {
    const sr = await fetch("https://api.notion.com/v1/databases/" + dbId, {
      en-têtes : { "Authorization": "Bearer " + NOTION_KEY, "Notion-Version": "2022-06-28" }
    });
    const schema = await sr.json();
    if (schema.object === "error") return res.status(400).json({ error: schema.message });
    const props = schema.properties || {};
    const pp = {};
    const tp = Object.keys(props).find(k => props[k].type === "title");
    si (tp) pp[tp] = { titre: [{ texte: { contenu: sujet || "Article" } }] };
    const dp = Object.keys(props).find(k => props[k].type === "date");
    if (dp && date) pp[dp] = { date: { start: date + (heure ? "T" + heure + ":00" : "") } };
    const stp = Object.keys(props).find(k => props[k].type === "status");
    si (stp) pp[stp] = { statut: { nom: "À faire" } };
    const cr = await fetch("https://api.notion.com/v1/pages", {
      méthode : « POST »,
      en-têtes : { "Authorization": "Bearer " + NOTION_KEY, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      corps : JSON.stringify({
        parent : { database_id : dbId },
        propriétés : pp,
        enfants: [
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Hook" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte enrichi : [{ texte : { contenu : crochet || "" } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Légende" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte enrichi : [{ texte : { contenu : (légende || "").substring(0, 2000) } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Hashtags" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte_enrichi : [{ texte : { contenu : balises } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Premier commentaire" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte_riche : [{ texte : { contenu : premier_commentaire || "" } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Article J+1" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte_riche : [{ texte : { contenu : story_relance || "" } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Visuel Canva" } }] } },
          { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: conseil_visuel || "" } }] } }
        ]
      })
    });
    const créé = await cr.json();
    if (created.object === "error") return res.status(400).json({ error: created.message });
    res.json({ success: true, notion_url: created.url });
  } attraper (erreur) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = app;
