// Studeria — génération des apprenants simulés (partagée entre index.html et detail.html)
// Seed fixe pour que les mêmes apprenants apparaissent à l'identique sur les deux pages.

function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
const rng = mulberry32(20260831);
function pick(arr){ return arr[Math.floor(rng()*arr.length)]; }
function randInt(min,max){ return Math.floor(rng()*(max-min+1))+min; }

const firstNames = ["Benjamin","Sophie","Pauline","Francis","Claire","Antoine","Manon","Julien","Camille","Nicolas","Léa","Thomas","Marion","Guillaume","Chloé","Maxime","Amandine","Romain","Émilie","Baptiste","Laura","Kevin","Charlotte","Alexandre","Sarah","Mathieu","Justine","Damien","Lucie","Florian","Aurélie","Vincent","Céline","Jérôme","Élise","Fabien","Margaux","Sébastien","Noémie","Pierre-Yves","Hélène","Yohan","Anaïs","Cédric","Marine","Loïc","Émeline","Rémi","Ophélie","Bastien"];
const lastNames = ["Boutboul","Edeine","Breillot","Bellamari","Girard","Moreau","Lefebvre","Rousseau","Fontaine","Chevalier","Gauthier","Perrin","Mercier","Blanchard","Guerin","Muller","Henry","Roussel","Nicolas","Perrot","Morin","Dumont","Aubert","Marchand","Renard","Klein","Fabre","Barbier","Colin","Brun","Dupuis","Julien","Leroux","Roy","Noel","Meyer","Robin","Masson","Duval","Menard"];
const coaches = ["Nicolas Guyon","Nathalie Dupuy","Clément Cardinale","Hector Studeria","Sarah Fontanel","Julien Marchetti","Camille Vidal","Antoine Serra","Léa Fabron","Marc Delattre"];
const programmes = ["Influenceur","Incubateur Starter","Reconversion IA"];
const financingTypes = ["CPF","Financement personnel","OPCO","Entreprise"];

const N = 1000;
const STUDERIA_LEARNERS = [];

for(let i=0;i<N;i++){
  const fn = pick(firstNames), ln = pick(lastNames);
  const programme = pick(programmes);
  const coach = pick(coaches);
  const r = rng();
  let statut;
  if(r < 0.32) statut = "Terminée";
  else if(r < 0.75) statut = "En cours";
  else if(r < 0.90) statut = "Vérifiée";
  else statut = "Interrompue";

  let progress;
  if(statut === "Terminée") progress = randInt(90,100);
  else if(statut === "En cours") progress = randInt(8,89);
  else if(statut === "Vérifiée") progress = rng() < 0.85 ? randInt(0,4) : randInt(5,15);
  else progress = randInt(3,40);

  const coachingR = rng();
  const coaching = coachingR < 0.58 ? "Pas commencé" : (coachingR < 0.85 ? "En cours" : "Terminé");

  const hasRdv = rng() < 0.88;
  let rdvDate = null;
  if(hasRdv){
    const d = new Date(2026, 8, randInt(1,30));
    d.setDate(d.getDate() + randInt(-20,55));
    rdvDate = d;
  }

  // --- Onboarding steps ---
  const adbFilled = rng() < 0.88;
  const conventionSigned = rng() < 0.82;
  const kickoffDone = rng() < 0.7;
  const platformAccess = rng() < 0.93;
  const stepsDone = [adbFilled, conventionSigned, kickoffDone, platformAccess].filter(Boolean).length;
  const onboardingStatus = stepsDone === 4 ? "Complet" : stepsDone === 0 ? "Non démarré" : "En cours";

  // --- Financing ---
  const financingType = pick(financingTypes);
  const totalAmount = pick([1600, 1650, 1650, 1650]);
  let pctPaid;
  if(statut === "Terminée") pctPaid = pick([100,100,100,75]);
  else if(statut === "En cours") pctPaid = pick([0,25,50,75,100]);
  else if(statut === "Vérifiée") pctPaid = pick([0,0,0,25]);
  else pctPaid = pick([0,25,50]);
  const amountCollected = Math.round(totalAmount * pctPaid / 100);
  const amountDue = totalAmount - amountCollected;
  const invoiced = pctPaid > 0 ? (rng() < 0.9) : (rng() < 0.3);

  // --- Documents ---
  const documents = [
    { name: "Programme de formation", kind: "Programme", available: true },
    { name: "Convention de formation", kind: "Convention", available: conventionSigned, statusLabel: conventionSigned ? "Signée" : "En attente de signature" },
    { name: "Dossier ADB", kind: "ADB", available: adbFilled, statusLabel: adbFilled ? "Rempli" : "À compléter" },
    { name: "Livret d'accueil", kind: "Livret", available: true },
    { name: "Attestation de fin de formation", kind: "Attestation", available: statut === "Terminée" },
  ];

  STUDERIA_LEARNERS.push({
    id: i,
    name: fn + " " + ln,
    firstName: fn,
    lastName: ln,
    email: (fn+"."+ln).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"") + "@mail.fr",
    phone: "+336" + randInt(10000000,99999999),
    programme, coach, statut, progress, coaching, rdvDate,
    onboarding: { adbFilled, conventionSigned, kickoffDone, platformAccess, stepsDone, status: onboardingStatus },
    financing: { type: financingType, totalAmount, pctPaid, amountCollected, amountDue, invoiced },
    documents
  });
}

if (typeof window !== "undefined") window.STUDERIA_LEARNERS = STUDERIA_LEARNERS;
if (typeof module !== "undefined") module.exports = STUDERIA_LEARNERS;
