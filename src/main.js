import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

window.addEventListener("DOMContentLoaded", () => {
  const morgesCenter = [6.496, 46.509];

  const rawProjetFeatures = [
    {
      id: 1,
      type: "Feature",
      geometry: { type: "Point", coordinates: [6.501173649086801, 46.509627396869014] },
      properties: {
        title: "Déplacement des quais et transformation en plage",
        description: "Description à compléter.",
        images: ["https://placekitten.com/400/240", "https://placekitten.com/401/240"],
      },
    },
    {
      id: 2,
      type: "Feature",
      geometry: { type: "Point", coordinates: [6.501393097261323, 46.51102600956074] },
      properties: {
        title: "Déplacement des quais et transformation en plage",
        description:
          "Le projet propose de déplacer les quais plus en amont dans la baie afin de libérer le front lacustre et de le transformer en une grande plage publique. Cette intervention mettrait en valeur la géographie particulière de la baie de Morges et offrirait un accès direct et généreux au lac pour les habitant·e·s, les visiteur·euse·s et les usagers des promenades. La nouvelle plage deviendrait un espace central de détente, de baignade et de sociabilité, en continuité avec les quais réaménagés et les parcours piétons existants.",
        images: ["https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/ref_rives_I-1.png"],
      },
    },
    { id: 3, type: "Feature", geometry: { type: "Point", coordinates: [6.501999472118144, 46.51032553330137] }, properties: { title: "Point 3", description: "Description à compléter.", images: [] } },
    { id: 4, type: "Feature", geometry: { type: "Point", coordinates: [6.500648172917296, 46.50993521909845] }, properties: { title: "Point 4", description: "Description à compléter.", images: [] } },
    { id: 5, type: "Feature", geometry: { type: "Point", coordinates: [6.498168462480993, 46.50899805879923] }, properties: { title: "Point 5", description: "Description à compléter.", images: [] } },
    { id: 6, type: "Feature", geometry: { type: "Point", coordinates: [6.498868117689945, 46.508632163109276] }, properties: { title: "Point 6", description: "Description à compléter.", images: [] } },
    { id: 7, type: "Feature", geometry: { type: "Point", coordinates: [6.499552002131644, 46.50811525597903] }, properties: { title: "Point 7", description: "Description à compléter.", images: [] } },
    { id: 8, type: "Feature", geometry: { type: "Point", coordinates: [6.497160843948601, 46.50706604124388] }, properties: { title: "Point 8", description: "Description à compléter.", images: [] } },
    { id: 9, type: "Feature", geometry: { type: "Point", coordinates: [6.496842475479566, 46.50931757070339] }, properties: { title: "Point 9", description: "Description à compléter.", images: [] } },
    { id: 10, type: "Feature", geometry: { type: "Point", coordinates: [6.496824972852992, 46.510215603310755] }, properties: { title: "Point 10", description: "Description à compléter.", images: [] } },
  ];

  const zoneCoords = [
    [6.496428089845968, 46.505720246977845],
    [6.495422645545607, 46.506410726171772],
    [6.496657911779806, 46.507311558309034],
    [6.4961305547527, 46.50779493148643],
    [6.496141534861831, 46.50825014673682],
    [6.496132167552963, 46.508601123580739],
    [6.495978805511734, 46.508840838349258],
    [6.495893896186166, 46.508974219930295],
    [6.49600857141811, 46.509061915756938],
    [6.496177916700713, 46.50908212081503],
    [6.496354206270263, 46.509471279461728],
    [6.496679373990847, 46.510214752038422],
    [6.497355327250958, 46.510788679214947],
    [6.497890521361452, 46.511172793333039],
    [6.498408477004381, 46.511273983402695],
    [6.498907917965965, 46.511273945161371],
    [6.499063645764654, 46.511367854131102],
    [6.499332058888355, 46.511753567898104],
    [6.499901468157285, 46.511584096852559],
    [6.499910398748741, 46.511101285984132],
    [6.501125922474875, 46.510911988004942],
    [6.501225729251705, 46.511103102338197],
    [6.501471609318094, 46.511428265125865],
    [6.501905666676305, 46.511280985648682],
    [6.502402586617334, 46.511000127254853],
    [6.50250339800081, 46.510672989534228],
    [6.50248831109936, 46.510396429407443],
    [6.502117187827048, 46.509787911107736],
    [6.501171045650843, 46.507966718445545],
    [6.499748334702972, 46.506964924648635],
    [6.499285242087422, 46.506007997693146],
    [6.497913015033828, 46.505261414867121],
    [6.496976580415872, 46.505219502004437],
    [6.496428089845968, 46.505720246977845],
  ];

  const focusZone = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Dessin" },
        geometry: { type: "Polygon", coordinates: [zoneCoords] },
      },
    ],
  };

  const maskGeoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-180, -90],
              [180, -90],
              [180, 90],
              [-180, 90],
              [-180, -90],
            ],
            zoneCoords.slice().reverse(),
          ],
        },
      },
    ],
  };

  const cloneFeature = (feature, overrides = {}) => ({
    ...feature,
    geometry: { ...feature.geometry, coordinates: [...feature.geometry.coordinates] },
    properties: { ...feature.properties, ...overrides },
  });

  const diagnosticFeatures = [];

  const diagnosticAutoAxesPrimary = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [6.474839622244019, 46.493642238119484],
            [6.47735599188198, 46.49452043654931],
            [6.478797765427117, 46.49502613057504],
            [6.479385155059588, 46.49520279606368],
            [6.479619375863617, 46.49524715907624],
            [6.479748154398119, 46.495248247994915],
            [6.479799177604374, 46.49526395558212],
            [6.479855423826848, 46.4953099196428],
            [6.479877727114688, 46.4953611153818],
            [6.480034797718099, 46.49545490018396],
            [6.4802520870634215, 46.49555023069777],
            [6.480823266709247, 46.495858065216986],
            [6.481182408575122, 46.4961176553957],
            [6.48136337407637, 46.49629007323155],
            [6.481540810355163, 46.4965237674253],
            [6.481664514645869, 46.49676216463758],
            [6.481710611217749, 46.496905987220636],
            [6.481752906008254, 46.497185993578064],
            [6.48179173528566, 46.49742374723091],
            [6.481896534295776, 46.49772470554146],
            [6.4820707375949675, 46.497974827711516],
            [6.482373757501781, 46.49832495050909],
            [6.483583352885218, 46.49958398322486],
            [6.485176762234154, 46.50127234762636],
            [6.486200157360231, 46.502374406265766],
            [6.487347121131406, 46.50355623220471],
            [6.487443635693804, 46.50360322548588],
            [6.487556412457881, 46.503634052481566],
            [6.487593758017062, 46.50366701115968],
            [6.487592898928529, 46.50371586314956],
            [6.487580302017805, 46.503761238201896],
            [6.487632752489369, 46.50385449023871],
            [6.487716500007342, 46.50397988232896],
            [6.488387277551905, 46.504649528701684],
            [6.488746972632817, 46.50504782373708],
            [6.489213027764201, 46.50551317269589],
            [6.489505980463514, 46.50581166832688],
            [6.489688373099756, 46.50592994838237],
            [6.4898518579782465, 46.50599742687603],
            [6.489971968808729, 46.506022755980204],
            [6.49010160952103, 46.50603729587215],
            [6.490175077142484, 46.506089658155275],
            [6.490224510243238, 46.50617727320223],
            [6.490323132204918, 46.50624331041021],
            [6.490579034032954, 46.506346511184276],
            [6.490940040708113, 46.50648593552932],
            [6.492415130260124, 46.50703595786496],
            [6.492877685761369, 46.507169342454766],
            [6.493541118966697, 46.507319246987834],
            [6.494427241918245, 46.50743913175027],
            [6.4952632573376246, 46.50754329573604],
            [6.495833304717024, 46.50762017322173],
            [6.4960804814057065, 46.50766214538774],
            [6.496177713927303, 46.50767186387876],
            [6.49628049469085, 46.50767152312231],
            [6.496369190411577, 46.507651528442125],
            [6.496439281218816, 46.5076159293438],
            [6.496687607681032, 46.50748362325916],
            [6.496841577990994, 46.50739675695372],
            [6.496959049002552, 46.507342891399844],
            [6.497063066820048, 46.50732003222665],
            [6.497159350293559, 46.50732968810843],
            [6.497239783591077, 46.50736951016658],
            [6.497348790417893, 46.5074666078319],
            [6.497531770845895, 46.50764136160583],
            [6.497745437356253, 46.50780216835865],
            [6.498381672858625, 46.50824925461041],
            [6.498851197936747, 46.508618569433786],
            [6.499388033681961, 46.50912917656954],
            [6.4997718009017635, 46.50955082766737],
            [6.499824566100056, 46.50963792699769],
            [6.499879714739514, 46.509763104644215],
            [6.499941033070823, 46.51012420332548],
            [6.500012577695479, 46.51058426532287],
            [6.499975604561353, 46.51076928517859],
            [6.499988039860622, 46.51112393412441],
            [6.5000002822667335, 46.511506193498455],
            [6.500018123880395, 46.51161537002585],
            [6.500064468019439, 46.51178920445897],
            [6.500134742705253, 46.51193357682116],
            [6.500224654575351, 46.512081471013964],
            [6.500334257405475, 46.512207305436085],
            [6.500529056441777, 46.512372747267115],
            [6.500896930519526, 46.5126962869166],
            [6.501241375829205, 46.5129751553904],
            [6.5015509394634865, 46.51323832120664],
            [6.5019202569014745, 46.51357581956797],
            [6.502137931661333, 46.513758974433166],
            [6.503597513880036, 46.514989074922894],
            [6.503808161750254, 46.515157306942484],
            [6.5040721653130324, 46.51533089936704],
            [6.504311453866098, 46.515467326487574],
            [6.504832514787893, 46.515692381620816],
            [6.507020769233695, 46.516486659653026],
            [6.507549923798702, 46.51660691872452],
            [6.508344456039478, 46.51671773647926],
            [6.5091265827641, 46.51680774749326],
            [6.511457378149446, 46.51707080992839],
            [6.51342351064418, 46.51732308631228],
            [6.51361794185126, 46.51733528138816],
            [6.515097943657829, 46.517511262605396],
            [6.516427012497767, 46.5176662585842],
            [6.517764641940617, 46.51780878998678],
            [6.518809611051572, 46.517872834768795],
            [6.519359276853446, 46.51787392287972],
            [6.519878393925015, 46.51785616304679],
            [6.522130179489783, 46.51774606527359],
            [6.524627498111353, 46.51761260454519],
            [6.524841456080882, 46.5175823523823],
            [6.525002104651047, 46.51754149027067],
            [6.525100333618061, 46.51749739101084],
            [6.525276757246492, 46.51748884858944],
            [6.525446066351918, 46.517488516704674],
            [6.525985166901851, 46.51738803550958],
          ],
        },
      },
    ],
  };

  const diagnosticAutoAxesSecondary = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [6.521726909130038, 46.51778626113868],
            [6.520813817843157, 46.51783065853215],
            [6.519418332648826, 46.51789986825811],
            [6.518893037347558, 46.517917500513306],
            [6.5184044916196076, 46.51790999190509],
            [6.517411492124747, 46.51781789898482],
            [6.517065647654154, 46.5177851598589],
            [6.5168325057775105, 46.517734483929466],
            [6.515799386145899, 46.51761738106768],
            [6.513477563787053, 46.51735186956948],
            [6.511480500514598, 46.51710151632039],
            [6.509293794530041, 46.516856463163194],
            [6.508896375071936, 46.516849503085815],
            [6.508621915142371, 46.51680828483323],
            [6.507501017933429, 46.51664220078099],
            [6.5069119632437795, 46.516502466111085],
            [6.50580020766523, 46.516103064146904],
            [6.504437936180417, 46.515578670069154],
            [6.50415114219732, 46.51543670356163],
            [6.503790377740609, 46.515206391498076],
            [6.503384723525724, 46.51488494446459],
            [6.502658860690346, 46.514261153236966],
            [6.501877076632802, 46.51360084215247],
            [6.501473048909835, 46.51326257443014],
            [6.501310010339687, 46.51311285947171],
            [6.500783216540129, 46.51267052543691],
            [6.500424500708535, 46.51235893869402],
            [6.500262550694509, 46.51219346683935],
            [6.500119780541846, 46.51199839903111],
            [6.500013880545918, 46.511794119761],
            [6.499986123088533, 46.511711230016914],
            [6.4999333108080775, 46.51149797548117],
            [6.499931914355522, 46.51139223338985],
            [6.4999368116902465, 46.51128839534074],
            [6.4999288938122275, 46.511166008934204],
            [6.4998889100325865, 46.51109312822637],
            [6.499827589968525, 46.51105450969969],
            [6.499717297565654, 46.51104649476461],
            [6.499211856875037, 46.511136269339595],
            [6.4988993598324285, 46.511203574182545],
            [6.498648336866, 46.51121450505296],
            [6.498499428451175, 46.5111882397002],
            [6.498291740970021, 46.51113155330125],
            [6.498050207054968, 46.511059281714004],
            [6.497849784516094, 46.51095253225261],
            [6.497754817746535, 46.51087785938315],
            [6.49746067513977, 46.51064656308589],
            [6.496973387399011, 46.51025937252292],
            [6.496899720391048, 46.51019485243167],
            [6.496607704451221, 46.509649071568006],
            [6.496393854510477, 46.50924048548982],
            [6.496205486642244, 46.50889179170755],
            [6.496158713724916, 46.508761438830355],
            [6.496151459785388, 46.50866337910858],
            [6.496171274096636, 46.508481443344365],
            [6.4961961933903, 46.50817859441828],
            [6.496212632242931, 46.50802415000929],
            [6.4962277614305615, 46.50790250293961],
            [6.496211728539376, 46.50785638691791],
            [6.4961865019480705, 46.507811835622825],
            [6.496137015015498, 46.507780605246694],
            [6.496051754501026, 46.50773731920063],
            [6.4959163162829805, 46.507697776851494],
            [6.49483509943577, 46.50754833301149],
            [6.49437726277191, 46.507485632365025],
            [6.49359819056161, 46.50736908075702],
            [6.493157814903147, 46.50728479256164],
            [6.492777594461227, 46.507193272786886],
            [6.492460912693525, 46.507115439096786],
            [6.4916703949158165, 46.506883279031804],
            [6.491033113971361, 46.50666779255719],
            [6.490692891260315, 46.50651924197197],
            [6.490308237109609, 46.50634061013371],
            [6.4901685237666085, 46.50628089246222],
            [6.490106272564626, 46.50628097284407],
            [6.490013585358062, 46.50628863876375],
            [6.489904619114196, 46.50628050581216],
            [6.4898603475968875, 46.506263559194366],
            [6.489807946016262, 46.50622265876369],
            [6.489787815511246, 46.50617546379824],
            [6.489763922281316, 46.50612285013564],
            [6.489686509297527, 46.50606436286396],
            [6.489396925345237, 46.50577773600797],
            [6.4890647089145, 46.50544074051334],
            [6.488655215665689, 46.50501731600521],
            [6.488387748916604, 46.50476931582458],
            [6.48761100313935, 46.503934734424575],
            [6.487537429687235, 46.50387614077674],
            [6.4874759681428875, 46.503826848739884],
            [6.4874083936956985, 46.50379872395064],
            [6.48734498873844, 46.50376705315254],
            [6.48730760381606, 46.503735467019695],
            [6.487291233719115, 46.50370236682109],
            [6.487294491016761, 46.503668218856106],
            [6.48727584860803, 46.50362340093035],
            [6.487216479365852, 46.50349859979418],
            [6.486827014595505, 46.503077553854304],
            [6.486182679022653, 46.502415951083655],
            [6.485835495716196, 46.502047153889364],
            [6.485337544588732, 46.501527471992304],
            [6.485057088521424, 46.50121675523302],
            [6.484586666840533, 46.50074167248584],
            [6.484318986746172, 46.50049085445436],
            [6.484207919903419, 46.50036601025136],
            [6.483999364318606, 46.50010372568466],
            [6.483770031376186, 46.49985565975677],
            [6.4834108525886895, 46.499476833527645],
            [6.483017069768051, 46.49905817405203],
            [6.482616987929087, 46.49863139794889],
            [6.482234719184772, 46.498234277532625],
            [6.482074935302258, 46.498039550744046],
            [6.481976191217461, 46.497910146271394],
            [6.4818746632756, 46.497758911566926],
            [6.48179527545893, 46.49754882647743],
            [6.4817502640514935, 46.497403792644214],
            [6.481701867011545, 46.49708266542362],
            [6.481660661271828, 46.49690830230212],
            [6.481597695399632, 46.49670886572515],
            [6.48149413870613, 46.496530574445785],
            [6.481371949074853, 46.49636989697665],
            [6.48123848834053, 46.49621300341585],
            [6.480834102769592, 46.49590714056319],
            [6.480635674565832, 46.49579274251283],
            [6.480328812992505, 46.49562750528244],
            [6.4801480765523864, 46.495554518948346],
            [6.479936451120019, 46.49547699767516],
            [6.479814785596341, 46.49544063068585],
            [6.479697428502158, 46.495439316373904],
            [6.47964547541177, 46.495430892310864],
            [6.479597668871016, 46.495406523551736],
            [6.479540389865051, 46.49535850364645],
            [6.479471150644604, 46.49531266259342],
            [6.4792197954136155, 46.495193719757005],
            [6.478946065201659, 46.49509730932316],
            [6.478131668441033, 46.49481783153197],
            [6.477542504995659, 46.49461612010145],
            [6.476958516381149, 46.49441050703701],
            [6.476051952918704, 46.494091864028476],
            [6.475353311047611, 46.493853107519456],
            [6.4748875149084535, 46.49369564027114],
          ],
        },
      },
    ],
  };

  

  const projectFeatures = rawProjetFeatures.map((feature) =>
    cloneFeature(feature, {
      title: feature.properties.title.startsWith("Projet") ? feature.properties.title : `Projet – ${feature.properties.title}`,
    }),
  );

  const collectCoords = (collections) => {
    const coords = [];
    const pushCoords = (node) => {
      if (!node) return;
      if (typeof node[0] === "number" && typeof node[1] === "number") {
        coords.push(node);
        return;
      }
      if (Array.isArray(node)) node.forEach(pushCoords);
    };
    collections.forEach((collection) => {
      collection?.features?.forEach((feature) => {
        pushCoords(feature?.geometry?.coordinates);
      });
    });
    return coords;
  };

  const bounds = (() => {
    const coords = collectCoords([{ features: projectFeatures }, diagnosticAutoAxesPrimary, diagnosticAutoAxesSecondary]);
    if (!coords.length) return [[6.48, 46.49], [6.53, 46.53]];
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const baseBuffer = 0.001;
    const westBuffer = 0.0004;
    return [
      [Math.min(...lngs) - westBuffer, Math.min(...lats) - baseBuffer],
      [Math.max(...lngs) + baseBuffer, Math.max(...lats) + baseBuffer],
    ];
  })();

  const orthoLayerTemplate = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg";

  const map = new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
      sources: {
        ortho: {
          type: "raster",
          tiles: [orthoLayerTemplate],
          tileSize: 256,
        },
      },
      layers: [{ id: "ortho", type: "raster", source: "ortho" }],
    },
    center: morgesCenter,
    zoom: 15,
    maxBounds: bounds,
    attributionControl: false,
  });

  const coordDisplay = document.getElementById("coord-display");
  const mapSourceLabel = document.getElementById("map-source");
  if (mapSourceLabel) mapSourceLabel.textContent = "Données cartographiques · swisstopo (WMTS)";
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
  map.on("mousemove", (event) => {
    if (!coordDisplay) return;
    const { lng, lat } = event.lngLat.wrap();
    coordDisplay.textContent = `Lat ${lat.toFixed(5)} · Lng ${lng.toFixed(5)}`;
  });

  const detailsPanel = document.getElementById("details-panel");
  const detailsBody = document.getElementById("details-body");
  const detailsCloseBtn = document.getElementById("details-close");
  const lightbox = document.getElementById("media-lightbox");
  const lightboxImg = document.getElementById("lightbox-image");
  const lightboxFrame = document.getElementById("lightbox-frame");
  const lightboxCloseBtn = document.getElementById("lightbox-close");

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif", "heic", "heif"];

  const closeLightbox = () => {
    lightbox?.classList.remove("visible");
    if (lightboxImg) {
      lightboxImg.src = "";
      lightboxImg.style.display = "none";
    }
    if (lightboxFrame) {
      lightboxFrame.src = "";
      lightboxFrame.style.display = "none";
    }
  };

  const openLightbox = (url) => {
    if (!url || !lightbox) return;
    const clean = url.split("#")[0];
    const ext = clean.split("?")[0].split(".").pop()?.toLowerCase();
    const isImage = ext && imageExtensions.includes(ext);

    if (isImage && lightboxImg) {
      lightboxImg.src = url;
      lightboxImg.style.display = "block";
      if (lightboxFrame) lightboxFrame.style.display = "none";
    } else if (lightboxFrame) {
      lightboxFrame.src = url;
      lightboxFrame.style.display = "block";
      if (lightboxImg) lightboxImg.style.display = "none";
    } else {
      window.open(url, "_blank");
      return;
    }

    lightbox.classList.add("visible");
  };

  lightboxCloseBtn?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  const closeDetailsPanel = () => {
    detailsPanel?.classList.remove("visible");
    document.body.classList.remove("details-open");
  };

  const renderPopupContent = (feature) => {
    const { id = feature.properties.title || "poi", title = "Point", description = "", images = [] } = feature.properties;
    const comments = (() => {
      try {
        return JSON.parse(localStorage.getItem(`comments-${id}`) || "[]");
      } catch {
        return [];
      }
    })();

    const carousel = images.length
      ? `
        <div class="popup-carousel" data-id="${id}">
          <img src="${images[0]}" alt="" />
          ${images.length > 1 ? '<button class="prev" aria-label="Image précédente">&#8249;</button><button class="next" aria-label="Image suivante">&#8250;</button>' : ""}
        </div>
      `
      : "";

    const commentsList = comments.length ? comments.map((c) => `<li>${c}</li>`).join("") : "<li>Aucun commentaire pour l'instant.</li>";

    return `
      <div class="popup-content" data-poi-id="${id}">
        <h3>${title}</h3>
        ${description ? `<p>${description}</p>` : ""}
        ${carousel}
        <div class="popup-comments">
          <strong style="font-size:13px;">Commentaires</strong>
          <ul>${commentsList}</ul>
          <textarea placeholder="Ajouter un commentaire..."></textarea>
          <button type="button">Publier</button>
        </div>
      </div>
    `;
  };

  const bindPopupInteractions = (container, feature) => {
    const { id = feature.properties.title || "poi", images = [] } = feature.properties;
    const el = container || document.querySelector(".popup-content");
    if (!el) return;

    if (images.length > 1) {
      const carousel = el.querySelector(".popup-carousel");
      const img = carousel?.querySelector("img");
      let current = 0;
      const updateImg = () => {
        if (img) img.src = images[current];
      };
      const attachZoom = (node) => {
        if (!node) return;
        node.style.cursor = "zoom-in";
        node.addEventListener("click", () => openLightbox(images[current]));
      };
      attachZoom(img);
      carousel?.querySelector(".prev")?.addEventListener("click", () => {
        current = (current - 1 + images.length) % images.length;
        updateImg();
      });
      carousel?.querySelector(".next")?.addEventListener("click", () => {
        current = (current + 1) % images.length;
        updateImg();
      });
      carousel?.addEventListener("dblclick", () => openLightbox(images[current]));
    } else if (images.length === 1) {
      const img = el.querySelector(".popup-carousel img");
      if (img) {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => openLightbox(images[0]));
      }
    }

    const textarea = el.querySelector("textarea");
    const btn = el.querySelector(".popup-comments button");
    const list = el.querySelector(".popup-comments ul");

    const refreshComments = () => {
      try {
        const comments = JSON.parse(localStorage.getItem(`comments-${id}`) || "[]");
        list.innerHTML = comments.length ? comments.map((c) => `<li>${c}</li>`).join("") : "<li>Aucun commentaire pour l'instant.</li>";
      } catch {
        list.innerHTML = "<li>Aucun commentaire pour l'instant.</li>";
      }
    };

    btn?.addEventListener("click", () => {
      const value = textarea?.value?.trim();
      if (!value) return;
      const comments = JSON.parse(localStorage.getItem(`comments-${id}`) || "[]");
      comments.push(value);
      localStorage.setItem(`comments-${id}`, JSON.stringify(comments));
      textarea.value = "";
      refreshComments();
    });
  };

  const openDetailsPanel = (feature) => {
    if (!detailsPanel || !detailsBody) return;
    detailsBody.innerHTML = renderPopupContent(feature);
    bindPopupInteractions(detailsBody, feature);
    detailsPanel.classList.add("visible");
    document.body.classList.add("details-open");
  };

  detailsCloseBtn?.addEventListener("click", closeDetailsPanel);
  detailsPanel?.addEventListener("click", (event) => {
    if (event.target === detailsPanel) closeDetailsPanel();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDetailsPanel();
      closeLightbox();
    }
  });

  const sectionState = { diagnostic: true, projet: true };
  const sectionButtons = document.querySelectorAll("[data-section-toggle]");
  const updateSectionVisibility = (key) => {
    const section = document.querySelector(`[data-section="${key}"]`);
    const visible = sectionState[key];
    if (section) section.classList.toggle("hidden", !visible);
    const button = document.querySelector(`[data-section-toggle="${key}"]`);
    if (button) {
      button.classList.toggle("active", visible);
      button.setAttribute("aria-pressed", visible ? "true" : "false");
    }
  };
  sectionButtons.forEach((button) => {
    const key = button.dataset.sectionToggle;
    button.addEventListener("click", () => {
      sectionState[key] = !sectionState[key];
      updateSectionVisibility(key);
    });
    updateSectionVisibility(key);
  });

  const layerInputs = Array.from(document.querySelectorAll("[data-layer]"));
  const checklistButtons = Array.from(document.querySelectorAll(".checklist-button"));

  const poiMarkers = [];

  const createPoiMarkers = () => {
    projectFeatures.forEach((feature) => {
      const marker = new maplibregl.Marker({ color: "#38bdf8" }).setLngLat(feature.geometry.coordinates).addTo(map);
      marker.getElement().addEventListener("click", (event) => {
        event.stopPropagation();
        map.stop();
        openDetailsPanel(feature);
      });
      poiMarkers.push(marker);
    });
  };

  const setMarkersVisibility = (visible) => {
    poiMarkers.forEach((marker) => {
      const el = marker.getElement();
      if (el) el.style.display = visible ? "" : "none";
    });
  };

  const setPerimeterVisibility = (visible) => {
    ["focus-zone-layer", "focus-mask-layer"].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const setDiagnosticAutoVisibility = (visible) => {
    ["diagnostic-auto-1-layer", "diagnostic-auto-2-layer"].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    });
  };

  const layerHandlers = {
    perimeter: (checked) => setPerimeterVisibility(checked),
    "diagnostic-axes": (checked) => setDiagnosticAutoVisibility(checked),
    "project-interventions": (checked) => setMarkersVisibility(checked),
  };

  const bindLayerInputs = () => {
    layerInputs.forEach((input) => {
      const key = input.dataset.layer;
      const handler = layerHandlers[key];
      if (!handler) return;
      handler(Boolean(input.checked));
      input.addEventListener("change", () => handler(Boolean(input.checked)));
    });
  };

  const bindChecklistButtons = () => {
    checklistButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const active = button.classList.toggle("active");
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    });
  };

  const hideBaseIcons = () => {
    const style = map.getStyle();
    if (!style?.layers) return;
    style.layers
      .filter((layer) => layer.type === "symbol" && layer.layout && layer.layout["icon-image"])
      .forEach((layer) => map.setLayoutProperty(layer.id, "visibility", "none"));
  };

  map.on("load", () => {
    map.fitBounds(bounds, { padding: 40, duration: 0 });

    map.addSource("focus-zone", { type: "geojson", data: focusZone });
    map.addSource("focus-mask", { type: "geojson", data: maskGeoJson });
    map.addSource("diagnostic-auto-1", { type: "geojson", data: diagnosticAutoAxesPrimary });
    map.addSource("diagnostic-auto-2", { type: "geojson", data: diagnosticAutoAxesSecondary });
    map.addLayer({
      id: "focus-mask-layer",
      type: "fill",
      source: "focus-mask",
      paint: {
        "fill-color": "rgba(15, 23, 42, 0.75)",
        "fill-opacity": 0.75,
      },
    });
    map.addLayer({
      id: "diagnostic-auto-1-layer",
      type: "line",
      source: "diagnostic-auto-1",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#ff2d2d",
        "line-width": 4,
        "line-opacity": 0.9,
      },
    });
    map.addLayer({
      id: "diagnostic-auto-2-layer",
      type: "line",
      source: "diagnostic-auto-2",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#ff2d2d",
        "line-width": 4,
        "line-opacity": 0.9,
      },
    });

    bindLayerInputs();
    bindChecklistButtons();
    hideBaseIcons();
    map.on("styledata", hideBaseIcons);
  });
});
