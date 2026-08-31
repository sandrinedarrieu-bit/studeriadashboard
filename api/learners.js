// Fonction serveur Vercel — GET /api/learners
// Le token Airtable ne vit que côté serveur (variable d'environnement Vercel),
// jamais envoyé au navigateur.

const BASE_ID = "appcjeZ14aATfinxZ";
const TABLE_ID = "tblLxRw2bp3TTAE11";

function mapStatut(raw) {
  switch (raw) {
    case "terminated": return "Terminée";
    case "inTraining": return "En cours";
    case "verified": return "Vérifiée";
    case "interrupted": return "Interrompue";
    default: return raw || "Inconnu";
  }
}

function mapCoaching(raw) {
  if (!raw) return "Inconnu";
  if (raw.includes("terminé")) return "Terminé";
  if (raw.includes("en cours")) return "En cours";
  if (raw.includes("pas commencé")) return "Pas commencé";
  return raw;
}

export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN;

  if (!token) {
    res.status(500).json({ error: "AIRTABLE_TOKEN manquant. Ajoute-le dans Vercel → Settings → Environment Variables." });
    return;
  }

  let records = [];
  let offset;

  try {
    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
      url.searchParams.set("pageSize", "100");
      if (offset) url.searchParams.set("offset", offset);

      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`Airtable a répondu ${r.status}: ${text}`);
      }
      const data = await r.json();
      records = records.concat(data.records);
      offset = data.offset;
    } while (offset);
  } catch (err) {
    res.status(502).json({ error: "Échec de récupération Airtable", detail: String(err) });
    return;
  }

  const learners = records.map((rec) => {
    const f = rec.fields;
    const progressRaw = f["Progression (%)"] || "";
    const progress = parseInt(String(progressRaw).replace("%", "").trim(), 10) || 0;

    return {
      id: rec.id,
      name: f["Name"] || [f["Prénom"], f["Nom"]].filter(Boolean).join(" ") || "(Sans nom)",
      email: f["Email"] || "",
      phone: f["Téléphone"] || "",
      programme: f["Programme / Offre"] || "",
      coach: f["Coach référent"] || "",
      typeSuivi: f["Type de suivi"] || "",
      statut: mapStatut(f["Statut formation"]),
      progress,
      coaching: mapCoaching(f["Statut coaching individuel"] || ""),
      rdvRaw: f["Prochain RDV"] || null,
      adbStatus: f["Statut ADB"] || null,
      contractStatus: f["Statut contrat"] || null,
      montantFormation: f["Montant formation"] || null,
      montantPaye: f["Montant payé"] || null,
      lienPandaDoc: f["Lien contrat PandaDoc"] || null,
      lienSoftr: f["Lien accès plateforme Softr"] || null,
    };
  });

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).json({ learners, count: learners.length, fetchedAt: new Date().toISOString() });
}
