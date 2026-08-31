const BASE_ID = "appcjeZ14aATfinxZ";
const TABLE_ID = "tblLxRw2bp3TTAE11";

function mapStatut(raw) {
  switch (raw) {
    case "terminated":
      return "Terminée";
    case "inTraining":
      return "En cours";
    case "verified":
      return "Vérifiée";
    case "interrupted":
      return "Interrompue";
    default:
      return raw || "Inconnu";
  }
}

function mapCoaching(raw) {
  if (!raw) return "Inconnu";

  const value = String(raw).toLowerCase();

  if (value.includes("terminé")) return "Terminé";
  if (value.includes("en cours")) return "En cours";
  if (value.includes("pas commencé")) return "Pas commencé";

  return raw;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Méthode non autorisée",
    });
  }

  const token = process.env.AIRTABLE_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "AIRTABLE_TOKEN manquant",
      detail:
        "Vérifie la variable AIRTABLE_TOKEN dans Vercel → Settings → Environment Variables.",
    });
  }

  const email = String(req.query.email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return res.status(400).json({
      error: "Email manquant",
      detail:
        "Ajoute ?email=adresse@email.fr à l'URL pour le test.",
    });
  }

  try {
    const safeEmail = email.replace(/"/g, '\\"');

    const formula = `LOWER({Status})="${safeEmail}"`;

    const url = new URL(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`
    );

    url.searchParams.set("maxRecords", "1");
    url.searchParams.set("filterByFormula", formula);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();

      throw new Error(
        `Airtable a répondu ${response.status}: ${text}`
      );
    }

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      return res.status(404).json({
        error: "Aucun apprenant trouvé",
        detail: `Aucun dossier avec l'adresse ${email}`,
      });
    }

    const rec = data.records[0];
    const f = rec.fields;

    const progressRaw = f["Progression (%)"] || "";

    const progress =
      parseInt(
        String(progressRaw)
          .replace("%", "")
          .trim(),
        10
      ) || 0;

    const apprenant = {
      id: rec.id,

      name:
        f["Name"] ||
        [f["Prénom"], f["Nom"]]
          .filter(Boolean)
          .join(" ") ||
        "(Sans nom)",

      prenom: f["Prénom"] || "",

      nom: f["Nom"] || "",

      email: f["Status"] || "",

      telephone:
        f["Téléphone"] ||
        f["Téléphone (bis)"] ||
        "",

      numeroDossier:
        f["Numéro de dossier"] || "",

      programme:
        f["Programme / Offre"] || "",

      coach:
        f["Coach référent"] ||
        f["Coach (bis)"] ||
        "",

      conseiller:
        f["Conseiller"] ||
        f["Conseiller (bis)"] ||
        "",

      groupe:
        f["Groupe"] || "",

      typeSuivi:
        f["Type de suivi"] || "",

      statut:
        mapStatut(
          f["Statut formation"]
        ),

      statutDossier:
        f["Statut dossier"] || "",

      progress,

      coaching:
        mapCoaching(
          f["Statut coaching individuel"] || ""
        ),

      prochainRdv:
        f["Prochain RDV"] || null,

      statutRdv:
        f["Statut RDV"] || null,

      adbStatus:
        f["Statut ADB"] || null,

      contractStatus:
        f["Statut contrat"] || null,

      dateDebut:
        f["Date début formation"] || null,

      dateCreationDossier:
        f["Date de création dossier"] || null,

      dateFinDroits:
        f["Date fin de droits"] || null,

      montantFormation:
        f["Montant formation"] ||
        f["Prix formation (HT)"] ||
        null,

      montantPaye:
        f["Montant payé"] || null,

      montantRestantDu:
        f["Montant restant dû"] || null,

      montantImpaye:
        f["Montant impayé"] || null,

      lienPandaDoc:
        f["Lien contrat PandaDoc"] || null,

      lienSoftr:
        f["Lien accès plateforme Softr"] || null,
    };

    res.setHeader(
      "Cache-Control",
      "s-maxage=30, stale-while-revalidate=60"
    );

    return res.status(200).json({
      apprenant,
    });
  } catch (err) {
    return res.status(502).json({
      error: "Échec de récupération Airtable",
      detail: String(err),
    });
  }
}
