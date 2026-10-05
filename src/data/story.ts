import { StoryChapter } from '../types';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: 'Chapter 1: The Trailhead & Pack Check',
    titleTr: '1. Bölüm: Başlangıç Noktası ve Çanta Düzeni',
    brief: 'You have entered the high wilderness of the Northern Ridge. Before venturing deeper into uncharted terrain, verify your compass, check backpack weight distribution, and secure a clean water source.',
    briefTr: 'Kuzey Sırtı yaban hayatı bölgesine giriş yaptın. Rotada derinleşmeden önce pusula açını doğrula, sırt çantası ağırlık dengesini kontrol et ve temiz su kaynağı temin et.',
    objectives: [
      {
        id: 'obj_inspect_pack',
        text: 'Inspect your backpack inventory and check total weight and insulation layers',
        textTr: 'Sırt çantasını aç, ağırlık dağılımını ve kıyafet katmanlarını incele',
        completed: false
      },
      {
        id: 'obj_gather_wood',
        text: 'Gather 2 bundles of dry deadwood before shadows lengthen',
        textTr: 'Gölge uzamadan önce en az 2 bağ kuru odun topla',
        completed: false
      },
      {
        id: 'obj_discover_water',
        text: 'Locate the river valley or mountain spring to inspect water purity',
        textTr: 'Vadi tabanındaki dereyi veya Ayı Pınarı kaynağını bul',
        completed: false
      }
    ],
    journalEntry: 'Day 1, 09:30 AM. Air temperature is crisp, around 14°C with a gentle westerly breeze. The pine canopy is dense. If I maintain good pace discipline and pack management, I can establish a base camp before the cold mountain air descends into the valley.',
    journalEntryTr: '1. Gün, Saat 09:30. Hava serin ve berrak, yaklaşık 14°C. Hafif bir batı rüzgarı esiyor. Çam ormanı oldukça sık. Tempomu korur ve gereksiz yükten kaçınırsam, hava soğumadan önce güvenli bir kamp kurabilirim.'
  },
  {
    id: 2,
    title: 'Chapter 2: The Sinking Barometer & Mist',
    titleTr: '2. Bölüm: Düşen Barometre ve Vadi Sisi',
    brief: 'The barometric pressure has begun falling sharply. Heavy valley fog is rolling in from the gorge, cutting visibility down to 25 meters. Use your compass bearing to locate the Ancient Stone Shepherd Enclosure.',
    briefTr: 'Barometre hızla düşüyor. Vadiden yükselen yoğun sis görüş mesafesini 25 metreye kadar düşürdü. Pusula açını kullanarak Eski Taş Ağıl mevkiine ulaş.',
    objectives: [
      {
        id: 'obj_compass_bearing',
        text: 'Open Topographic Map & take a sighting bearing toward the Stone Shelter (Bearing ~240°)',
        textTr: 'Topografik haritada pusulayı aç ve Taş Ağıl yönünde kerteriz al (~240°)',
        completed: false
      },
      {
        id: 'obj_reach_shelter',
        text: 'Navigate to the Ancient Stone Enclosure using compass guidance',
        textTr: 'Pusula yönlendirmesiyle sisin içinden Taş Ağıl kalıntısına ulaş',
        completed: false
      }
    ],
    journalEntry: 'Barometer dropped 6 hPa in two hours—a classic harbinger of a cold front. The mountains vanished behind a wall of white mist. Without a magnetic compass, anyone would walk in hopeless circles here.',
    journalEntryTr: 'Barometre iki saatte 6 hPa düştü; bu yaklaşan soğuk hava cephesinin habercisi. Dağlar beyaz bir sis perdesinin arkasında kayboldu. Pusula olmadan bu arazide insan daireler çizer.'
  },
  {
    id: 3,
    title: 'Chapter 3: Nightfall & The Reflector Fire',
    titleTr: '3. Bölüm: Dağda Gece ve Yansıtıcı Ateş',
    brief: 'The temperature is plunging toward 4°C with gusting winds. Establish an A-frame or Lean-to shelter, build a stone fire ring, and start a fire to ward off hypothermia.',
    briefTr: 'Hava sıcaklığı rüzgarla birlikte 4°C ye kadar iniyor. Tarp barınağını kur, ocak taşlarını diz ve donma tehlikesine karşı ateşini yak.',
    objectives: [
      {
        id: 'obj_pitch_camp',
        text: 'Pitch a Tarp Shelter in the Campcraft workstation',
        textTr: 'Kamp menüsünden Tarp Barınağını kur',
        completed: false
      },
      {
        id: 'obj_light_fire',
        text: 'Ignite campfire using ferrocerium rod and fatwood tinder',
        textTr: 'Kav çubuğu ve çıra kullanarak kamp ateşini tutuştur',
        completed: false
      },
      {
        id: 'obj_boil_water',
        text: 'Boil water in your camp pot for safe drinking and hot tea',
        textTr: 'Tencerede su kaynatarak temiz içme suyu ve sıcak çay hazırla',
        completed: false
      }
    ],
    journalEntry: 'Night in the mountains tests your preparation. When the wind howls against the silnylon tarp, a crackling fire and warm sleeping insulation are the difference between misery and restful recovery.',
    journalEntryTr: 'Dağda gece, hazırlığınızın gerçek sınavıdır. Rüzgar brandayı döverken, önündeki çıtırdayan ateş ve yalıtımlı uyku matı insanı hayata bağlar.'
  }
];
