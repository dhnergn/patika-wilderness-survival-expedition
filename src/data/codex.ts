import { CodexEntry } from '../types';

export const FIELD_CODEX_ENTRIES: CodexEntry[] = [
  {
    id: 'navigation_compass_bearing',
    category: 'navigation',
    title: 'Silva 1-2-3 Navigation & Bearings',
    titleTr: 'Harita ve Pusula ile Açı (Azimut) Alma',
    summary: 'The fundamental technique of plotting an azimuth bearing from your map and following it through dense terrain where line-of-sight is blocked.',
    summaryTr: 'Arazide görüş kapandığında haritadan pusulaya açı transferi yapma ve kerteriz takip etme yöntemi.',
    practicalTips: [
      'Step 1: Lay the edge of your baseplate connecting your current location to your objective.',
      'Step 2: Rotate the compass dial (bezel) until the orienting lines are parallel to the map grid North lines.',
      'Step 3: Read the index line bearing (e.g., 68° ENE). Pick up the compass, turn your body until "Red in the Bed" (magnetic needle points inside orienting arrow). Follow the direction-of-travel arrow.',
      'Always sight an intermediate distinct landmark (a peculiar pine or rocky boulder) on that line to avoid walking in circles.'
    ],
    practicalTipsTr: [
      '1. Adım: Pusula tabanının uzun kenarını bulunduğun nokta ile hedefin arasına koy.',
      '2. Adım: Pusulanın döner kadranındaki çizgileri haritanın kuzey çizgilerine paralel hale getirene dek çevir.',
      '3. Adım: Pusulayı eline al, gövdenle dönerek kırmızı iğneyi yuvaya oturt. Seyir oku nereyi gösteriyorsa oraya yürü.',
      'Rotada zikzak çizmemek için aynı hat üzerindeki belirgin bir ağaç veya kaya parçasını ara hedef seç.'
    ],
    commonMistakes: [
      'Holding the compass near a metal knife, belt buckle, or smartphone will pull the magnetic needle off course by up to 40 degrees.',
      'Walking while staring constantly at the compass instead of picking sight landmarks causes stumbling and fatigue.'
    ],
    commonMistakesTr: [
      'Pusulayı çakı, kemer tokası veya cep telefonuna yakın tutmak iğneyi 40 dereceye kadar saptırır.',
      'Yürürken kafayı sürekli pusulaya gömmek takılıp düşmeye ve yorulmaya yol açar.'
    ],
    unlocked: true
  },
  {
    id: 'camp_site_selection_4w',
    category: 'campcraft',
    title: 'The 4 Ws of Campsite Selection',
    titleTr: 'Kamp Yeri Seçiminde 4 Kural (4 W Kuralı)',
    summary: 'Choosing the right bivouac location is 80% of staying warm and safe. A bad camp site ruins the best tent and sleeping bag.',
    summaryTr: 'Doğru kamp yeri seçimi, çadır ve uyku tulumunun kalitesinden daha hayatidir.',
    practicalTips: [
      'WIND: Look at prevailing wind direction. Pitch behind a natural berm, boulder, or dense tree line. Never camp on an exposed windy saddle.',
      'WATER: Camp at least 60-70 meters away from streams. Riverbeds flash-flood during rain, and cold air settles into drainage bottoms.',
      'WIDOWMAKERS: Look UP before pitching. Never set camp beneath dead, hollow pine trees or hanging broken branches.',
      'WOOD & WILDLIFE: Ensure nearby access to fallen deadwood. Never camp directly on animal game trails or near fresh animal droppings.'
    ],
    practicalTipsTr: [
      'RÜZGAR (Wind): Hakim rüzgar yönünü belirle; çadırı büyük bir kaya veya sık ağaç kümesinin korumasına kur.',
      'SU (Water): Dere yatağının en az 60 metre uzağında kal; gece vadi tabanına dondurucu soğuk hava çöker ve ani taşkın riski vardır.',
      'TEHLİKELİ DALLAR (Widowmakers): Çadırı kurmadan önce yukarı bak; tepedeki kuru, kırılmış veya rüzgarda düşebilecek dalların altına girme.',
      'YABANİ HAYAT (Wildlife): Hayvan patikaları ve su yolları üzerine asla çadır kurma.'
    ],
    commonMistakes: [
      'Camping in a concave depression where rainwater pools during night storms.',
      'Pitching tent door directly facing into the wind.'
    ],
    commonMistakesTr: [
      'Yağmur suyunun toplanacağı çukur yerlere çadır kurmak.',
      'Çadır girişini doğrudan rüzgar yönüne açmak.'
    ],
    unlocked: true
  },
  {
    id: 'firecraft_three_stages',
    category: 'firecraft',
    title: 'The Three Fuel Stages & Reflector Wall',
    titleTr: 'Ateş Yakmanın Üç Aşaması ve Isı Yansıtıcı Duvar',
    summary: 'A fire does not burn logs directly. Success requires strict separation into Tinder, Kindling, and Fuel Wood.',
    summaryTr: 'Ateş doğrudan kalın kütüklere yakılmaz; Kav, Çıra ve Yakıt odunları hiyerarşisi şarttır.',
    practicalTips: [
      'Stage 1 (Tinder / Kav): Fluffy material with huge surface area (birch bark, crushed dried grass, dry pine pitch resin shavings). Catches spark instantly.',
      'Stage 2 (Kindling / Çıra): Matchstick to pencil-thickness dry twigs. Build a loose teepee or log cabin over the tinder to let oxygen flow.',
      'Stage 3 (Fuel / Odun): Wrist-thick dry dead branches. Only add once the kindling has established glowing coals.',
      'Reflector Wall: Stack green logs or flat river stones 1 meter behind your fire opposite your shelter. This bounces 70% of radiant heat into your tarp.'
    ],
    practicalTipsTr: [
      '1. Aşama (Kav): Kıvılcımı hapseden lifli kuru ot, reçineli çıra tozu veya huş ağacı kabuğu.',
      '2. Aşama (Çıra): Kibrit çöpü ile kurşun kalem kalınlığında kuru dallar. Hava alacak şekilde çatılır.',
      '3. Aşama (Odun): Bilek kalınlığında kuru dallar. Ancak kor tabakası oluştuktan sonra beslenir.',
      'Isı Yansıtıcı (Reflektör): Ateşin arkasına dizilen taşlar veya kütükler, sıcaklığın barınağın içine yansımasını sağlar.'
    ],
    commonMistakes: [
      'Throwing thick damp logs onto faint embers before establishing a strong coal base, suffocating the fire with smoke.',
      'Neglecting to collect TWICE as much firewood as you think you need before darkness sets in.'
    ],
    commonMistakesTr: [
      'Yeterli kor oluşmadan kalın ve nemli kütük atıp ateşi dumanla boğmak.',
      'Gece çökmeden önce ihtiyacının iki katı odun toplamamak.'
    ],
    unlocked: true
  },
  {
    id: 'water_purification_rules',
    category: 'water',
    title: 'Safe Water: Boiling & Pathogen Defense',
    titleTr: 'Güvenli Su: Kaynatma ve Mikroorganizma Savunması',
    summary: 'Crystal clear mountain water can still carry Giardia lamblia, Cryptosporidium, and bacterial strains from upstream animal pastures.',
    summaryTr: 'Berrak görünen bir dağ deresi bile hayvan dışkılarından kaynaklanan parazitler taşıyabilir.',
    practicalTips: [
      'Look for spring heads (kaynak suyu) bubbling straight out of rock faces—these are the safest natural sources.',
      'Avoid standing pools, marsh edges, or streams running below grazing livestock herds.',
      'Boiling: Bring raw water to a vigorous rolling boil for at least 1 full minute (3 minutes at elevations above 2,000m due to lower boiling point).',
      'Chemical Tablets: Chlorine dioxide kills cysts and viruses; wait 30 minutes before drinking.'
    ],
    practicalTipsTr: [
      'Doğrudan kaya çatlağından fışkıran kaynak suları en güvenli doğal içme suyudur.',
      'Durgun göletler ve hayvan otlatılan alanların altındaki derelerden uzak dur.',
      'Kaynatma: Suyu en az 1 tam dakika boyunca fokurdayacak şekilde kaynat (2000m üzerinde 3 dakika).',
      'Arıtma tableti attıktan sonra bakterilerin ölmesi için 30 dakika bekle.'
    ],
    commonMistakes: [
      'Assuming melted snow is sterile; surface snow collects dust and airborne bacteria. Always boil melted snow.',
      'Drinking freezing water too quickly, which lowers your core temperature and triggers stomach cramps.'
    ],
    commonMistakesTr: [
      'Kar suyunun mikropsuz olduğunu sanmak; yüzey karı toz ve bakteri tutar, mutlaka kaynatılmalıdır.',
      'Dondurucu suyu bir anda lıkır lıkır içerek vücut çekirdek sıcaklığını düşürmek.'
    ],
    unlocked: true
  },
  {
    id: 'clothing_three_layer_principle',
    category: 'clothing',
    title: 'The Three-Layer System & "Cotton Kills"',
    titleTr: 'Üç Katman Giyim Sistemi ve "Pamuk Öldürür" İlkesi',
    summary: 'In the outdoors, hypothermia strikes most often between 0°C and 10°C in damp windy conditions, not just deep sub-zero winter.',
    summaryTr: 'Doğada hipotermi sadece dondurucu kışın değil, 5-10 derecede rüzgar ve ıslaklıkla birleştiğinde vurur.',
    practicalTips: [
      'Base Layer (Next to Skin): Merino wool or synthetic polyester. Pulls sweat vapor away from pores. Never wear cotton t-shirts!',
      'Mid Layer (Insulation): Fleece or lightweight down. Traps warm air created by body metabolism.',
      'Outer Shell (Protection): Breathable waterproof jacket (Gore-Tex). Deflects rain and stops windchill from stripping your warm air barrier.',
      'Regulate before sweating: Strip off a layer before steep uphills. Sweat cools down quickly when you pause, inducing shivering.'
    ],
    practicalTipsTr: [
      'İç Katman: Merinos yünü veya sentetik. Teri tenden uzaklaştırır. Asla pamuklu tişört giyme!',
      'Orta Katman: Polar veya kaz tüyü ceket. Vücudun ürettiği sıcak havayı hapseder.',
      'Dış Katman: Rüzgar ve su geçirmez hardshell ceket. Rüzgarın sıcak havayı süpürmesini engeller.',
      'Yokuş çıkmaya başlamadan önce terlememek için katman çıkar; terleyen kıyafet durduğunda dondurur.'
    ],
    commonMistakes: [
      'Wearing cotton denim jeans; when wet, cotton absorbs 27 times its weight in moisture and conducts heat away 25 times faster than air.',
      'Hiking with heavy jackets until drenched in internal sweat, then shivering uncontrollably at rest.'
    ],
    commonMistakesTr: [
      'Kot pantolonla dağa çıkmak; kot ıslandığında kurumaz ve vücut ısısını 25 kat daha hızlı tüketir.',
      'Terleyene kadar kalın montla yürüyüp mola verince donmak.'
    ],
    unlocked: true
  },
  {
    id: 'first_aid_rice_ankle',
    category: 'first_aid',
    title: 'Wilderness Sprains & The R.I.C.E. Protocol',
    titleTr: 'Ayak Bileği Burkulması ve R.I.C.E. Protokolü',
    summary: 'A sprained lateral ligament on a mountain trail is a serious hazard that can turn a simple day hike into an immobilizing emergency.',
    summaryTr: 'Arazide ayak burkulması, hareket kabiliyetini sıfırlayarak hayati tehlikeye dönüşebilir.',
    practicalTips: [
      'R - REST: Stop immediately. Do not test or force the ankle down steep scree.',
      'I - ICE / COLD: Soak the injured ankle in a cold mountain stream for 10-15 minutes to suppress initial inflammatory swelling.',
      'C - COMPRESSION: Wrap with an elastic crepe bandage in a figure-eight pattern. Snug enough to stabilize, but not so tight as to cut off toe circulation or sensation.',
      'E - ELEVATION: Prop your leg up on a backpack or log above heart level while resting at camp.'
    ],
    practicalTipsTr: [
      'R (Dinlenme): Hemen dur. Zorlayarak yürümeye devam etme.',
      'I (Soğuk Uygulama): Ayak bileğini 10-15 dakika soğuk dere suyuna sokarak ödem oluşumunu baskıla.',
      'C (Kompresyon/Sargı): Elastik bandajla 8 şeklinde bileği sar. Kan dolaşımını kesmeyecek sıkılıkta olsun.',
      'E (Yükseltme): Dinlenirken bacağı sırt çantasının üstüne koyarak kalp hizasının üzerine kaldır.'
    ],
    commonMistakes: [
      'Taking off a tight boot immediately on the trail without having a bandage ready; swelling might prevent putting the boot back on!',
      'Ignoring a hot-spot on the heel until it tears into a full open friction blister.'
    ],
    commonMistakesTr: [
      'Arazide sargı bezi hazır olmadan botu hemen çıkarmak; aşırı şişerse bot bir daha giyilemez.',
      'Ayakta ilk sürtünme kızarıklığı başladığında durmayıp içi su toplayana kadar yürümek.'
    ],
    unlocked: true
  },
  {
    id: 'wildlife_bear_boar_safety',
    category: 'wildlife',
    title: 'Encountering Wildlife: Bear & Wild Boar Protocols',
    titleTr: 'Yaban Hayatı: Ayı ve Yaban Domuzu ile Karşılaşma',
    summary: 'Wild animals in natural habitats fear humans. Encounters almost always happen when the animal is surprised at close range or defending cubs.',
    summaryTr: 'Yaban hayvanları insanlardan kaçınır; tehlikeli durumlar genelde hayvan rüzgaraltında aniden şaşırtıldığında doğar.',
    practicalTips: [
      'Make deliberate noise: Whistle, talk, or tap trekking poles while moving through dense forest or near rushing creeks.',
      'Never run: Running triggers the predatory pursuit reflex. Stand firm, raise your arms to appear larger, and speak in a calm, deep voice while backing away slowly.',
      'Food Discipline: Store food inside sealed bags and hang it 4 meters off the ground and 100 meters away from your sleeping shelter.',
      'Wild Boars: If a mother boar with piglets charges, step behind a sturdy tree trunk. Boars cannot turn sharply at speed.'
    ],
    practicalTipsTr: [
      'Ses çıkar: Dere kenarlarında ve sık ormanda yürürken sesli konuş veya batonları birbirine vur.',
      'Asla arkana bakıp koşma: Koşmak av içgüdüsünü tetikler. Kollarını aç, cüsseli görün ve geri geri yavaşça uzaklaş.',
      'Yiyecek Disiplini: Yiyecekleri çadıra sokma; çadırdan 100 metre uzakta yüksek bir dala as.',
      'Yaban Domuzu: Yavrulu bir domuz üzerinize koşarsa kalın bir ağaç gövdesinin arkasına geçin; domuzlar aniden dönemez.'
    ],
    commonMistakes: [
      'Keeping scented food, candy bars, or fish tins inside your tent pocket while sleeping.',
      'Approaching cute wild animals or cubs for a close photo.'
    ],
    commonMistakesTr: [
      'Çadırın içinde kokulu yiyecek, çikolata veya konserve bulundurmak.',
      'Yavru bir hayvan görünce fotoğraf çekmek için yanına yaklaşmak.'
    ],
    unlocked: true
  }
];
