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

export default async function handler(req, res) {
  // On autorise uniquement GET
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Méthode non autorisée",
    });
  }

  // Token Airtable stocké dans Vercel
  const token = process.env.AIRTABLE_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "AIRTABLE_TOKEN manquant",
      detail:
        "Vérifie AIRTABLE_TOKEN dans Vercel → Settings → Environment Variables.",
    });
  }

  // Pour l'instant, l'email est passé dans l'URL pour tester.
  // L'authentification sécurisée sera ajoutée ensuite.
  const email = String(req.query.email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return res.status(400).json({
      error: "Email manquant",
      detail:
        "Pour le test, utilise ?email=adresse@email.fr",
    });
  }

  try {
    // Protection des guillemets éventuels
    const safeEmail = email.replace(/"/g, '\\"');

    // Recherche de l'apprenant par son email
    const formula = `LOWER({Email})="${safeEmail}"`;

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

    // Aucun apprenant correspondant
    if (!data.records || data.records.length === 0) {
      return res.status(404).json({
        error: "Aucun apprenant trouvé",
        detail: `Aucun dossier trouvé pour ${email}`,
      });
    }

    const rec = data.records[0];
    const f = rec.fields;

    // Progression
    const progressRaw = f["Progression (%)"] || "";

    const progress =
      parseInt(
        String(progressRaw)
          .replace("%", "")
          .trim(),
        10
      ) || 0;

    // Données envoyées au dashboard apprenant
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

      email: f["Email"] || "",

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

      statutFormation:
        mapStatut(
          f["Statut formation"]
        ),

      statutDossier:
        f["Statut dossier"] || "",

      progress,

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

    // Pas de cache long pour des données personnelles
    res.setHeader(
      "Cache-Control",
      "private, no-store"
    );

    return res.status(200).json({
      apprenant,
    });

  } catch (err) {

    console.error("Erreur API apprenant :", err);

    return res.status(502).json({
      error: "Échec de récupération Airtable",
      detail: String(err),
    });
  }
}
