// Catégorie
export function getIconByCategorie(categorie) {
  switch (categorie) {
    case "Peche":
      return "phishing";
    case "Piraterie":
      return "skull";
    case "Drogue":
      return "cannabis";
    case "Terrorisme":
      return "bomb";
    default:
      return "info";
  }
}

// Intervenant
export function getIconByIntervenant(intervenant) {
  switch (intervenant) {
    case "marine_national":
      return "/marine-logo.jpg";
    case "douanes":
      return "/vedette.jpg";
    default:
      return "/marine-logo.jpg";
  }
}

// Contributeur
export function getIconByContributeur(contributeur) {
  switch (contributeur) {
    case "marine_national":
      return "/marine-logo.jpg";
    case "douanes":
      return "/vedette.jpg";
    default:
      return "/marine-logo.jpg";
  }
}
