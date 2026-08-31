function formatDate(value) {
  if (!value) return null;

  // Cas DD/MM/YYYY HH:mm déjà fourni par Airtable
  if (
    typeof value === "string" &&
    value.includes("/")
  ) {
    return value;
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );
}


function setText(id, value) {
  const element =
    document.getElementById(id);

  if (element) {
    element.textContent =
      value || "—";
  }
}


function hideIfEmpty(blockId, value) {
  if (!value) {
    const block =
      document.getElementById(blockId);

    if (block) {
      block.classList.add("hidden");
    }
  }
}


async function loadDashboard() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const email =
    params.get("email");

  const loading =
    document.getElementById("loading");

  const dashboard =
    document.getElementById("dashboard");

  const errorBox =
    document.getElementById("errorBox");

  const errorMessage =
    document.getElementById("errorMessage");


  if (!email) {

    loading.classList.add("hidden");

    errorBox.classList.remove("hidden");

    errorMessage.textContent =
      "Aucun utilisateur n'a été identifié.";

    return;
  }


  try {

    const response =
      await fetch(
        `/api/apprenant/me?email=${encodeURIComponent(email)}`
      );


    const data =
      await response.json();


    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.error ||
        "Erreur inconnue"
      );
    }


    const a =
      data.apprenant;


    /* IDENTITÉ */

    setText(
      "prenom",
      a.prenom ||
      a.name?.split(" ")[0]
    );

    setText(
      "headerEmail",
      a.email
    );


    /* FORMATION */

    setText(
      "programme",
      a.programme ||
      "Votre formation"
    );

    setText(
      "statutFormation",
      a.statutFormation
    );


    /* PROGRESSION */

    const progress =
      Math.min(
        100,
        Math.max(
          0,
          Number(a.progress) || 0
        )
      );

    setText(
      "progressNumber",
      progress
    );

    document
      .getElementById("progressBar")
      .style.width =
        `${progress}%`;


    /* INFORMATIONS */

    setText(
      "coach",
      a.coach
    );

    hideIfEmpty(
      "coachBlock",
      a.coach
    );


    setText(
      "typeSuivi",
      a.typeSuivi
    );

    hideIfEmpty(
      "typeSuiviBlock",
      a.typeSuivi
    );


    setText(
      "dateDebut",
      formatDate(a.dateDebut)
    );

    hideIfEmpty(
      "dateDebutBlock",
      a.dateDebut
    );


    setText(
      "numeroDossier",
      a.numeroDossier
    );

    hideIfEmpty(
      "numeroDossierBlock",
      a.numeroDossier
    );


    /* RENDEZ-VOUS */

    if (a.prochainRdv) {

      setText(
        "prochainRdv",
        formatDate(a.prochainRdv)
      );

      if (a.coach) {
        setText(
          "coachRdv",
          `Avec ${a.coach}`
        );
      }

    } else {

      document
        .getElementById("rdvDisponible")
        .classList
        .add("hidden");

      document
        .getElementById("aucunRdv")
        .classList
        .remove("hidden");
    }


    /* DOSSIER */

    if (a.statutDossier) {
      setText(
        "statutDossier",
        a.statutDossier
      );
    } else {
      document
        .getElementById("dossierRow")
        .classList
        .add("hidden");
    }


    if (a.contractStatus) {

      setText(
        "contractStatus",
        a.contractStatus
      );

    } else {

      document
        .getElementById("contratRow")
        .classList
        .add("hidden");
    }


    if (a.adbStatus) {

      setText(
        "adbStatus",
        a.adbStatus
      );

    } else {

      document
        .getElementById("adbRow")
        .classList
        .add("hidden");
    }


    /* ACCÈS */

    let hasAccess = false;


    if (a.lienSoftr) {

      const link =
        document.getElementById(
          "softrLink"
        );

      link.href =
        a.lienSoftr;

      link.classList
        .remove("hidden");

      hasAccess = true;
    }


    if (a.lienPandaDoc) {

      const link =
        document.getElementById(
          "pandadocLink"
        );

      link.href =
        a.lienPandaDoc;

      link.classList
        .remove("hidden");

      hasAccess = true;
    }


    if (!hasAccess) {

      document
        .getElementById("noAccess")
        .classList
        .remove("hidden");
    }


    /* CONTACT */

    const contact =
      document.getElementById(
        "contactLink"
      );

    contact.href =
      "mailto:contact@studeria.fr";


    /* AFFICHAGE */

    loading.classList
      .add("hidden");

    dashboard.classList
      .remove("hidden");


  } catch (error) {

    console.error(error);

    loading.classList
      .add("hidden");

    errorBox.classList
      .remove("hidden");

    errorMessage.textContent =
      error.message;
  }
}


loadDashboard();
