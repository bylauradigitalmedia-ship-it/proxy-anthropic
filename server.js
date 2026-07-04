const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const API_KEY = process.env.ANTHROPIC_API_KEY;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

const NOTION_DBS = {
  "Par Laura Digital Media — Community Manager : "454b48c9-bb6f-82ee-9377-810f84e5f7ec",
  "Laura Vecchioli — Ostéopathe DO" : "8efb48c9-bb6f-8320-b12b-013f309725e9",
  "CSC — Corse Solution Canalisation" : "685b48c9-bb6f-8251-a64e-01401cfd9843",
  "Créat'Kris — Géomancie & Créations": "7fa37bee-aadf-4717-9ef2-9dc049bc1654",
  "Christina Ferrandi — Psychogénéalogie": "38eb48c9-bb6f-80c9-85db-e83ef586107e",
};

app.get("/", (req, res) => res.send("Proxy Anthropic + Notion OK ✓"));

app.post("/generate", async (req, res) => {
  if (!API_KEY) return res.status(500).json({ error: "Clé API Anthropic non configurée." });
  const { compte, sujet, format, objectif, tonne, détails } = req.body;
  if (!sujet || !compte) return res.status(400).json({ error: "Paramètres manquants." });

  const prompt = `Tu es un expert en community management Instagram francophone, spécialisé en croissance organique et optimisation algorithmique en 2026.

MISSION EN 2 ÉTAPES :

ÉTAPE 1 — Fais une recherche web sur :
- Les tendances Instagram actuelles juillet 2026 pour le secteur : ${compte}
- Les formats qui génèrent le plus de vues et d'engagement en ce moment
- Les mots-clés SEO Instagram tendance pour ce secteur
- Les mises à jour récentes de l'algorithme Instagram 2026

ÉTAPE 2 — Génère un post Instagram ultra-optimisé :
Activité / compte : ${compte}
Sujet : ${sujet}
Format : ${format}
Objectif : ${objectif}
Tonne : ${ton}
${détails ? "Détails : " + détails : ""}

RÈGLES D'OR ALGORITHME 2026 :
- Crochet : les 3 premiers mots doivent stopper le scroll
- SEO : intégrer des mots-clés naturellement
- Angle sauvegarde : contenu si utile qu'on le garde
- CTA émotionnels et spécifiques
- Premier commentaire stratégique dans les 10 min
- Story de relance J+1

Répond UNIQUEMENT avec un objet JSON valide, sans backticks :
{
  "tendances_trouvees": "Résumé 2-3 phrases des tendances actuelles",
  "hook": "3-15 mots ultra-accrocheurs qui stoppent le scroll",
  "legende": "Légende complète avec emojis, sauts de ligne, SEO, CTA. 150-300 mots.",
  "structure_carrousel": "Si carrousel : slides numérotées avec titres. Sinon : null",
  "premier_commentaire": "Commentaire à poster dans les 10 minutes après publication",
  "story_relance": "Idée de story à publier J+1",
  "angle_sauvegarde": "Pourquoi ce contenu donne envie d'être sauvegardé",
  "hashtags" : "hashtag1, "hashtag2, "hashtag3, "hashtag4, "hashtag5, "hashtag6, "hashtag7, "hashtag8, "hashtag9, "hashtag10, "hashtag11, "hashtag12, "hashtag13, "hashtag14, "hashtag15"],
  "conseil_visuel": "Conseil visuel Canva adapté aux tendances actuelles",
  "meilleur_jour": "Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche",
  "meilleur_horaire": "HH:MM",
  "pourquoi_ce_slot": "Explication courte pourquoi ce jour/heure",
  "algo_tips": "3 conseils pour maximiser la portée dans les 24h"
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
    if (start === -1) return res.status(500).json({ error: "Réponse inattendue.", raw });
    res.json(JSON.parse(raw.slice(start, end + 1)));
  } attraper (erreur) {
    res.status(500).json({ erreur : "Erreur serveur : " + err.message });
  }
});

app.post("/notion-add", async (req, res) => {
  if (!NOTION_TOKEN) return res.status(500).json({ error: "Token Notion non configuré." });
  const { compte_label, sujet, format, date, heure, hook, legende, hashtags, premier_commentaire, story_relance, conseil_visuel } = req.body;
  const dbId = NOTION_DBS[compte_label];
  if (!dbId) return res.status(400).json({ error: "Client non reconnu : " + compte_label });

  const hashtagsStr = (hashtags || []).map(h => "#" + h.replace(/^#/, "")).join(" ");

  essayer {
    const schemaRes = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
      en-têtes : {
        "Autorisation" : "Porteur" + NOTION_TOKEN,
        "Notion-Version": "2022-06-28",
      }
    });
    const schema = await schemaRes.json();
    if (schema.object === "error") return res.status(400).json({ error: "Erreur Notion : " + schema.message });

    const props = schema.properties || {};
    const pageProps = {};

    const titleProp = Object.keys(props).find(k => props[k].type === "title");
    if (titleProp) pageProps[titleProp] = { title: [{ text: { content: sujet || "Publier sur Instagram" } }] };

    const dateProp = Object.keys(props).find(k => props[k].type === "date");
    if (dateProp && date) pageProps[dateProp] = { date: { start: date + (heure ? "T" + heure + ":00" : "") } };

    const selectProps = Object.keys(props).filter(k => props[k].type === "select");
    pour (const sp de selectProps) {
      si (sp.toLowerCase().includes("format") || sp.toLowerCase().includes("type")) {
        pageProps[sp] = { select: { name: format.charAt(0).toUpperCase() + format.slice(1) } };
        casser;
      }
    }

    const statusProp = Object.keys(props).find(k => props[k].type === "status");
    if (statusProp) pageProps[statusProp] = { status: { name: "À faire" } };

    const richTextProps = Object.keys(props).filter(k => props[k].type === "rich_text");
    pour (constante rtp de richTextProps) {
      const rtl = rtp.toLowerCase();
      if (rtl.includes("script") || rtl.includes("contenu") || rtl.includes("légende") || rtl.includes("texte")) {
        pageProps[rtp] = { rich_text: [{ text: { content: (hook + "\n\n" + legende).substring(0, 2000) } }] };
        casser;
      }
    }

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
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "🪝 Hook" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte enrichi : [{ texte : { contenu : crochet || "" } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "✍️ Légende" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte enrichi : [{ texte : { contenu : (légende || "").substring(0, 2000) } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "#️⃣ Hashtags" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte_enrichi : [{ texte : { contenu : hashtagsStr } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "💬 Premier commentaire" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte_riche : [{ texte : { contenu : premier_commentaire || "" } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "📲 Story J+1" } }] } },
          { objet : "bloc", type : "paragraphe", paragraphe : { texte_riche : [{ texte : { contenu : story_relance || "" } }] } },
          { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "🎨 Visuel Canva" } }] } },
          { objet: "bloc", type: "paragraphe", paragraphe: { texte_riche: [{ texte: { contenu: conseil_visuel || "" } }] } },
        ]
      }),
    });

    const créé = await createRes.json();
    if (created.object === "error") return res.status(400).json({ error: "Erreur création Notion : " + created.message });
    res.json({ success: true, notion_url: created.url, page_id: created.id });
  } attraper (erreur) {
    res.status(500).json({ error: "Erreur serveur Notion : " + err.message });
  }
});

module.exports = app;
