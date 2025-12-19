export const pollutionLegendTemplates = {
  noise: {
    title: "Niveau sonore Lr [dB(A)]",
    body: `
        <div class="legend-description">
          <strong>Impact du bruit sur la santé</strong>
          <p>Le bruit routier est un facteur majeur de stress en milieu urbain. Au-delà de 55–60 dB(A) le jour, l’OMS relève des risques accrus de fatigue, de baisse de concentration et, à long terme, de troubles cardiovasculaires. Dans le périmètre étudié, les axes routiers oscillent surtout entre 55 et 65 dB(A) le jour et demeurent souvent &gt; 50 dB(A) la nuit, seuil susceptible de perturber le sommeil.</p>
        </div>
        <ul>
          <li><span style="background:#1d4ed8"></span>&ge; 75</li>
          <li><span style="background:#7c3aed"></span>70 – 74.9</li>
          <li><span style="background:#b91c1c"></span>65 – 69.9</li>
          <li><span style="background:#dc2626"></span>60 – 64.9 <small>(valeur limite)</small></li>
          <li><span style="background:#ea580c"></span>55 – 59.9</li>
          <li><span style="background:#f97316"></span>50 – 54.9</li>
          <li><span style="background:#facc15"></span>45 – 49.9</li>
          <li><span style="background:#16a34a"></span>40 – 44.9</li>
          <li><span style="background:#f3f4f6;border:1px solid #cbd5f5"></span>&lt; 40</li>
        </ul>
        <div class="legend-sources">Sources : OMS (2018, 2021), OFEV, Office fédéral de la santé publique.</div>
      `,
  },
  air: {
    title: "Pollution de l'air (NO<sub>2</sub> annuel)",
    body: `
        <div class="legend-description">
          <strong>Impact du dioxyde d’azote sur la santé</strong>
          <p>Le NO₂ issu principalement du trafic routier irrite les voies respiratoires et aggrave les maladies cardio-respiratoires. L’OMS recommande de ne pas dépasser 10 µg/m³ en moyenne annuelle (25 µg/m³ sur 24 h), alors que la Suisse fixe une valeur limite de 30 µg/m³ par an. Dans le périmètre, les axes principaux se situent autour ou légèrement au-dessus de 30 µg/m³, au-delà des recommandations de l’OMS. Une exposition chronique à ces niveaux accentue les symptômes chez les personnes asthmatiques, limite la fonction pulmonaire des enfants et peut augmenter les hospitalisations lors de pics supplémentaires.</p>
        </div>
        <p>Concentration moyenne en µg/m³</p>
        <ul>
          <li><span style="background:#002f86"></span>0 – 3.0</li>
          <li><span style="background:#0a4ec2"></span>3.1 – 6.0</li>
          <li><span style="background:#1c74fc"></span>6.1 – 9.0</li>
          <li><span style="background:#2894ff"></span>9.1 – 12.0</li>
          <li><span style="background:#43baff"></span>12.1 – 15.0</li>
          <li><span style="background:#73d8ff"></span>15.1 – 18.0</li>
          <li><span style="background:#81e4ff"></span>18.1 – 21.0</li>
          <li><span style="background:#49c769"></span>21.1 – 24.0</li>
          <li><span style="background:#6ee33e"></span>24.1 – 27.0</li>
          <li><span style="background:#9df02a"></span>27.1 – 30.0</li>
          <li><span style="background:#f3f11d"></span>30.1 – 33.0</li>
          <li><span style="background:#fbd31c"></span>33.1 – 36.0</li>
          <li><span style="background:#fca71a"></span>36.1 – 39.0</li>
          <li><span style="background:#fb7018"></span>39.1 – 42.0</li>
          <li><span style="background:#ff3a19"></span>42.1 – 45.0</li>
          <li><span style="background:#ff1171"></span>45.1 – 48.0</li>
          <li><span style="background:#cc01a3"></span>48.1 – 51.0</li>
          <li><span style="background:#9b02a5"></span>51.1 – 54.0</li>
          <li><span style="background:#65038b"></span>&gt; 54.0</li>
        </ul>
        <p class="legend-note">Valeur limite annuelle (OPair) : 30 µg/m³</p>
        <div class="legend-sources">Sources : OMS (2021), OFEV (2023).</div>
      `,
  },
  heat: {
    title: "Température de l’air à 14h (situation actuelle)",
    body: `
        <div class="legend-description">
          <strong>Zones actuellement les plus chaudes</strong>
          <p>Température de l’air à 2 m du sol à 14h (données DGE – cartes climatiques actuelles). Les classes les plus élevées signalent des îlots minéralisés où des mesures de rafraîchissement sont prioritaires.</p>
        </div>
        <ul>
          <li><span style="background:#0b5e17"></span>&le; 21 °C</li>
          <li><span style="background:#167824"></span>&gt; 21 – 22 °C</li>
          <li><span style="background:#2a942f"></span>&gt; 22 – 23 °C</li>
          <li><span style="background:#4ab132"></span>&gt; 23 – 24 °C</li>
          <li><span style="background:#7dd422"></span>&gt; 24 – 25 °C</li>
          <li><span style="background:#b4e11f"></span>&gt; 25 – 26 °C</li>
          <li><span style="background:#f1dd18"></span>&gt; 26 – 27 °C</li>
          <li><span style="background:#f6b616"></span>&gt; 27 – 28 °C</li>
          <li><span style="background:#f58911"></span>&gt; 28 – 29 °C</li>
          <li><span style="background:#f5540f"></span>&gt; 29 – 30 °C</li>
          <li><span style="background:#df2116"></span>&gt; 30 – 31 °C</li>
          <li><span style="background:#b51036"></span>&gt; 31 – 32 °C</li>
          <li><span style="background:#900050"></span>&gt; 32 – 33 °C</li>
          <li><span style="background:#a00092"></span>&gt; 33 – 34 °C</li>
          <li><span style="background:#6501a5"></span>&gt; 34 – 35 °C</li>
          <li><span style="background:#46176b"></span>&gt; 35 – 36 °C</li>
          <li><span style="background:#2b153d"></span>&gt; 36 °C</li>
        </ul>
        <div class="legend-sources">Sources : DGE – Atmosphère/Climatologie, cartes climatiques actuelles.</div>
      `,
  },
  heat2050: {
    title: "Température de l’air à 14h (2060)",
    body: `
        <div class="legend-description">
          <strong>Situation future (scénario chaud)</strong>
          <p>Température de l’air à 2 m du sol à 14h, projection 2060. Plus la classe est élevée, plus l’excès de chaleur est marqué et sollicite des dispositifs de résilience (canopées, désimperméabilisation, ventilation naturelle).</p>
        </div>
        <ul>
          <li><span style="background:#0b5e17"></span>&le; 21 °C</li>
          <li><span style="background:#167824"></span>&gt; 21 – 22 °C</li>
          <li><span style="background:#2a942f"></span>&gt; 22 – 23 °C</li>
          <li><span style="background:#4ab132"></span>&gt; 23 – 24 °C</li>
          <li><span style="background:#7dd422"></span>&gt; 24 – 25 °C</li>
          <li><span style="background:#b4e11f"></span>&gt; 25 – 26 °C</li>
          <li><span style="background:#f1dd18"></span>&gt; 26 – 27 °C</li>
          <li><span style="background:#f6b616"></span>&gt; 27 – 28 °C</li>
          <li><span style="background:#f58911"></span>&gt; 28 – 29 °C</li>
          <li><span style="background:#f5540f"></span>&gt; 29 – 30 °C</li>
          <li><span style="background:#df2116"></span>&gt; 30 – 31 °C</li>
          <li><span style="background:#b51036"></span>&gt; 31 – 32 °C</li>
          <li><span style="background:#900050"></span>&gt; 32 – 33 °C</li>
          <li><span style="background:#a00092"></span>&gt; 33 – 34 °C</li>
          <li><span style="background:#6501a5"></span>&gt; 34 – 35 °C</li>
          <li><span style="background:#46176b"></span>&gt; 35 – 36 °C</li>
          <li><span style="background:#2b153d"></span>&gt; 36 °C</li>
        </ul>
        <div class="legend-sources">Sources : DGE – Atmosphère/Climatologie, cartes climatiques 2060.</div>
      `,
  },
  attractivity: {
    title: "Un potentiel d’attractivité développé",
    body: `
        <div class="legend-description">
          <strong>Animation à intégrer</strong>
          <p>Ce filtre présentera prochainement la narration complète : report des activités vers les places libérées, activation du littoral et itinéraires confortables reliant les polarités du centre.</p>
        </div>
        <ul>
          <li>Réaffectation des surfaces de stationnement en espaces publics.</li>
          <li>Nouvelles continuités piétonnes vers le parc et les quais.</li>
          <li>Valorisation du front lacustre et des commerces de proximité.</li>
        </ul>
        <p>Le rendu cartographique est en préparation ; le filtre rappelle simplement ce scénario dans l’interface.</p>
      `,
  },
};
