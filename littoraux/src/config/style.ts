import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";

// Couleurs et typographies de la vidéo.
export const STYLE = {
  glow: "#ffe14a",          // contour lumineux des pays
  outlineWidth: 2.6,       // contour fin
  flagOpacity: 0.58,       // drapeaux semi-transparents : le terrain reste visible
  fillOpacity: 0.5,
  labelSize: 52,
  coast: "#1e6bff",         // littoral surligné
  coastWidth: 7,
  arrowA: "#e3262b",        // flèches : rouge
  arrowB: "#1d3fc4",        //           bleu
  accent: "#ffd400",        // mots surlignés dans les sous-titres
  labelFont: "Oswald, sans-serif",
  subtitleFont: "Montserrat, sans-serif",
  subtitleSize: 56,
  subtitleY: 0.755,         // centre des sous-titres (fraction de la hauteur), hors de l'interface TikTok
  subtitleMaxWidth: 900,
  watermark: "",            // ex. "@mon_compte" (vide = aucun)
  // Crédit imposé par la licence de l'imagerie : à adapter si on change de fournisseur ou de couche.
  credits: "Sentinel-2 cloudless 2020 by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2020) · Natural Earth",
};
