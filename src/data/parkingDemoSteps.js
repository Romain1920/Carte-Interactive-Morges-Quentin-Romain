const parkingReportData = {
  removedTotal: 284,
  availableTotal: 339,
  surfaceToRequalify: [
    { name: "Parking de la place de la Navigation", detail: "1 place libre / 43" },
    { name: "Parking Louis-de-Savoie", detail: "4 places libres / 49" },
    { name: "Parking de la place de l’église", detail: "0 place libre / 37" },
    { name: "Parking du quai Lochmann", detail: "0 place libre / 155" },
  ],
  absorbing: [
    { name: "Parking souterrain des Charpentiers", detail: "124 places libres / 574" },
    { name: "Parking souterrain de la gare", detail: "99 places libres / 144" },
    { name: "Parking souterrain du Pont-neuf", detail: "46 places libres / 171" },
    { name: "Parking du Parc des Sports", detail: "6 places libres / 446" },
    { name: "Parking de la piscine", detail: "25 places libres / 174" },
    { name: "Parking de la Blancherie", detail: "39 places libres / 87" },
  ],
};

parkingReportData.netGain = parkingReportData.availableTotal - parkingReportData.removedTotal;

export const parkingDemoSteps = [
  {
    id: "current",
    label: "Constat",
    title: "Constat : parkings en surface saturés",
    description:
      "Les parkings en surface du Bourg saturent et isolent le centre (Navigation, Louis-de-Savoie, Place de l’église, Quai Lochmann). Nous proposons de requalifier ces dalles minérales : cela représente 284 places à reloger.",
    cards: [{ label: "Places concernées", value: `-${parkingReportData.removedTotal}`, tone: "negative" }],
    listTitle: "Parkings en surface à requalifier",
    list: parkingReportData.surfaceToRequalify,
  },
  {
    id: "capacity",
    label: "Capacité disponible",
    title: "Parkings souterrains voisins sous-exploités",
    description:
      "Le même relevé (samedi 29 mai 2021, 11h30) montre que les parkings souterrains et de grande capacité alentour disposaient encore de plus de 330 places libres.",
    cards: [{ label: "Capacité restante", value: `+${parkingReportData.availableTotal}`, tone: "positive" }],
    listTitle: "Parkings de grande capacité à proximité",
    list: parkingReportData.absorbing,
  },
  {
    id: "summary",
    label: "Conclusion",
    title: "Conclusion : report crédible sans création",
    description:
      "En réaffectant la fréquentation vers ces parkings souterrains, le solde reste positif (+55 places nettes). Une signalétique dynamique et des abonnements visiteurs encadrent ce report tout en libérant l’espace public.",
    cards: [
      { label: "Places requalifiées", value: `-${parkingReportData.removedTotal}`, tone: "negative" },
      { label: "Capacité disponible", value: `+${parkingReportData.availableTotal}`, tone: "positive" },
      { label: "Solde net", value: `+${parkingReportData.netGain}`, tone: "positive" },
    ],
    bullets: [
      "Les parkings souterrains restent sous-utilisés même en pointe.",
      "Une communication en temps réel et des abonnements guident le report.",
      "Les surfaces rendues au Bourg deviennent des espaces piétons/végétalisés.",
    ],
  },
];
