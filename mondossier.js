"use client";

import { useEffect, useState } from "react";

export default function DashboardApprenant() {
  const [apprenant, setApprenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerDossier() {
      try {
        /*
          IMPORTANT :
          L'API doit identifier l'apprenant connecté côté serveur.
          On ne transmet PAS l'ID Airtable dans l'URL.
        */

        const response = await fetch("/api/apprenant/me", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Impossible de récupérer votre dossier.");
        }

        const data = await response.json();
        setApprenant(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    chargerDossier();
  }, []);

  if (loading) {
    return (
      <div className="page-center">
        <p>Chargement de votre dossier...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-center">
        <div className="error-box">{error}</div>
      </div>
    );
  }

  if (!apprenant) {
    return (
      <div className="page-center">
        <p>Aucun dossier trouvé.</p>
      </div>
    );
  }

  const progression = apprenant.progression || 0;

  return (
    <main className="dashboard">

      {/* HEADER */}

      <header className="header">
        <div>
          <p className="surtitle">ESPACE APPRENANT</p>

          <h1>
            Bonjour {apprenant.prenom || ""}
          </h1>

          <p className="subtitle">
            Retrouvez ici les informations concernant votre dossier.
          </p>
        </div>

        <button
          className="logout"
          onClick={() => {
            window.location.href = "/api/logout";
          }}
        >
          Déconnexion
        </button>
      </header>


      {/* PROGRESSION */}

      <section className="progress-card">

        <div className="progress-header">
          <div>
            <span className="label">Avancement de votre dossier</span>

            <strong>
              {progression} %
            </strong>
          </div>

          <span className={`badge ${getProgressClass(progression)}`}>
            {getProgressLabel(progression)}
          </span>
        </div>

        <div className="progress-background">
          <div
            className="progress-bar"
            style={{
              width: `${progression}%`,
            }}
          />
        </div>

      </section>


      {/* CARTES PRINCIPALES */}

      <section className="cards">

        <InfoCard
          titre="Dossier administratif"
          valeur={apprenant.statutDossier || "En cours"}
          description="État actuel de votre dossier"
        />

        <InfoCard
          titre="Formation"
          valeur={apprenant.formation || "Non renseignée"}
          description="Formation concernée"
        />

        <InfoCard
          titre="Date de début"
          valeur={formatDate(apprenant.dateDebut)}
          description="Début prévu de la formation"
        />

        <InfoCard
          titre="Financement"
          valeur={apprenant.financement || "En cours"}
          description="Situation du financement"
        />

      </section>


      {/* DOCUMENTS */}

      <section className="section">

        <div className="section-title">
          <div>
            <h2>Mes documents</h2>
            <p>
              Retrouvez l'état des documents nécessaires à votre dossier.
            </p>
          </div>
        </div>

        <div className="documents">

          {(apprenant.documents || []).map((document, index) => (

            <div
              className="document"
              key={index}
            >

              <div className="document-left">

                <div
                  className={`status-icon ${
                    document.recu ? "ok" : "waiting"
                  }`}
                >
                  {document.recu ? "✓" : "!"}
                </div>

                <div>
                  <strong>{document.nom}</strong>

                  <p>
                    {document.recu
                      ? "Document reçu"
                      : "Document à transmettre"}
                  </p>
                </div>

              </div>

              <span
                className={`document-badge ${
                  document.recu ? "received" : "missing"
                }`}
              >
                {document.recu ? "Reçu" : "À fournir"}
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* PROCHAINES ETAPES */}

      <section className="section">

        <h2>Prochaines étapes</h2>

        <div className="timeline">

          {(apprenant.etapes || []).map((etape, index) => (

            <div
              className="timeline-item"
              key={index}
            >

              <div
                className={`timeline-dot ${
                  etape.terminee ? "done" : ""
                }`}
              />

              <div>

                <strong>{etape.nom}</strong>

                {etape.date && (
                  <p>
                    {formatDate(etape.date)}
                  </p>
                )}

                {etape.description && (
                  <p>
                    {etape.description}
                  </p>
                )}

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* CONTACT */}

      <section className="contact-card">

        <div>
          <h3>Une question concernant votre dossier ?</h3>

          <p>
            Contactez votre interlocuteur pour obtenir des informations
            complémentaires.
          </p>
        </div>

        {apprenant.emailContact && (
          <a
            href={`mailto:${apprenant.emailContact}`}
            className="contact-button"
          >
            Nous contacter
          </a>
        )}

      </section>

    </main>
  );
}


function InfoCard({ titre, valeur, description }) {

  return (
    <div className="info-card">

      <span className="info-label">
        {titre}
      </span>

      <strong className="info-value">
        {valeur}
      </strong>

      <span className="info-description">
        {description}
      </span>

    </div>
  );

}


function formatDate(date) {

  if (!date) return "Non renseignée";

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(date));

}


function getProgressLabel(progress) {

  if (progress === 100) return "Dossier complet";

  if (progress >= 70) return "Presque terminé";

  if (progress >= 30) return "En cours";

  return "À compléter";

}


function getProgressClass(progress) {

  if (progress === 100) return "complete";

  if (progress >= 70) return "advanced";

  return "current";

}
