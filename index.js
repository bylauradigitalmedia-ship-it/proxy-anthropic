const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const NOTION_KEY = process.env.NOTION_TOKEN;
const DBS = {
  bylaura: "454b48c9-bb6f-82ee-9377-810f84e5f7ec",
  osteo: "8efb48c9-bb6f-8320-b12b-013f309725e9",
  csc: "685b48c9-bb6f-8251-a64e-01401cfd9843",
  creatkris: "7fa37bee-aadf-4717-9ef2-9dc049bc1654",
  christina: "38eb48c9-bb6f-80c9-85db-e83ef586107e"
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const path = req.url.split("?")[0];

  if (req.method === "GET") return res.status(200).send("Proxy OK");

  if (req.method === "POST" && path === "/generate") {
    if (!ANTHROPIC_KEY) return res.status(500).json({ error: "Cle API manquante" });
    const { compte, sujet, format, objectif, ton, details } = req.body;
    if (!sujet || !compte) return res.status(400).json({ error: "Parametres manquants" });
    const prompt = "Tu es expert CM Instagram 2026. Recherche les tendances pour : " + compte + ". Sujet: " + sujet + ". Format: " + format + ". Objectif: " + objectif + ". Ton: " + ton + (details ? ". Details: " + details : "") + ". Reponds UNIQUEMENT en JSON sans backticks: {\"tendances_trouvees\":\"...\",\"hook\":\"...\",\"legende\":\"...\",\"structure_carrousel\":null,\"premier_commentaire\":\"...\",\"story_relance\":\"...\",\"angle_sauvegarde\":\"...\",\"hashtags\":[\"h1\",\"h2\",\"h3\",\"h4\",\"h5\",\"h6\",\"h7\",\"h8\",\"h9\",\"h10\",\"h11\",\"h12\",\"h13\",\"h14\",\"h15\"],\"conseil_visuel\":\"...\",\"meilleur_jour\":\"Lundi\",\"meilleur_horaire\":\"18:00\",\"pourquoi_ce_slot\":\"...\",\"algo_tips\":\"...\"}";
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2500, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: prompt }] })
      });
      const d = await r.json();
      if (d.type === "error") return res.status(500).json({ error: d.error.message });
      const raw = (d.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
      if (s === -1) return res.status(500).json({ error: "JSON introuvable" });
      return res.json(JSON.parse(raw.slice(s, e + 1)));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST" && path === "/notion-add") {
    if (!NOTION_KEY) return res.status(500).json({ error: "Token Notion manquant" });
    const { compte_key, sujet, format, date, heure, hook, legende, hashtags, premier_commentaire, story_relance, conseil_visuel } = req.body;
    const dbId = DBS[compte_key];
    if (!dbId) return res.status(400).json({ error: "Client inconnu: " + compte_key });
    const tags = (hashtags || []).map(h => "#" + h.replace(/^#/, "")).join(" ");
    try {
      const sr = await fetch("https://api.notion.com/v1/databases/" + dbId, {
        headers: { "Authorization": "Bearer " + NOTION_KEY, "Notion-Version": "2022-06-28" }
      });
      const schema = await sr.json();
      if (schema.object === "error") return res.status(400).json({ error: schema.message });
      const props = schema.properties || {};
      const pp = {};
      const tp = Object.keys(props).find(k => props[k].type === "title");
      if (tp) pp[tp] = { title: [{ text: { content: sujet || "Post" } }] };
      const dp = Object.keys(props).find(k => props[k].type === "date");
      if (dp && date) pp[dp] = { date: { start: date + (heure ? "T" + heure + ":00" : "") } };
      const stp = Object.keys(props).find(k => props[k].type === "status");
      if (stp) pp[stp] = { status: { name: "A faire" } };
      const cr = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: { "Authorization": "Bearer " + NOTION_KEY, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
        body: JSON.stringify({
          parent: { database_id: dbId },
          properties: pp,
          children: [
            { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Hook" } }] } },
            { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: hook || "" } }] } },
            { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Legende" } }] } },
            { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: (legende || "").substring(0, 2000) } }] } },
            { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Hashtags" } }] } },
            { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: tags } }] } },
            { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Premier commentaire" } }] } },
            { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: premier_commentaire || "" } }] } },
            { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Story J+1" } }] } },
            { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: story_relance || "" } }] } },
            { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Visuel Canva" } }] } },
            { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: conseil_visuel || "" } }] } }
          ]
        })
      });
      const created = await cr.json();
      if (created.object === "error") return res.status(400).json({ error: created.message });
      return res.json({ success: true, notion_url: created.url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(404).json({ error: "Route inconnue" });
}
