export interface Recipe {
  id: string;
  name: string;
  nameTr: string;
  category: 'camp' | 'fire' | 'cooking' | 'first_aid';
  requiredItems: { itemId: string; count: number }[];
  requiresFire?: boolean;
  requiresWater?: boolean;
  energyCost: number; // energy spent performing action
  timeMinutes: number;
  resultItemId?: string;
  resultCount?: number;
  description: string;
  descriptionTr: string;
}

export const CRAFTING_RECIPES: Recipe[] = [
  // Camp
  {
    id: 'pitch_tarp_lean_to',
    name: 'Pitch Tarp Lean-To Shelter',
    nameTr: 'Tek Kanatlı Tarp Barınak Kur',
    category: 'camp',
    requiredItems: [
      { itemId: 'silnylon_tarp', count: 1 },
      { itemId: 'paracord_550', count: 1 }
    ],
    energyCost: 15,
    timeMinutes: 20,
    description: 'Quick angled shelter facing away from wind. Reflects campfire heat onto your sleeping mat.',
    descriptionTr: 'Rüzgarı arkaya alan ve kamp ateşinin ısısını içeri toplayan pratik tarp barınak.'
  },
  {
    id: 'pitch_tarp_a_frame',
    name: 'Pitch Tarp A-Frame Storm Shelter',
    nameTr: 'A-Tipi Fırtına Barınağı Kur',
    category: 'camp',
    requiredItems: [
      { itemId: 'silnylon_tarp', count: 1 },
      { itemId: 'paracord_550', count: 1 },
      { itemId: 'flint_stone', count: 1 }
    ],
    energyCost: 25,
    timeMinutes: 35,
    description: 'Steep two-sided pitch shedding heavy rain and cross-winds efficiently.',
    descriptionTr: 'Şiddetli yağmur ve fırtınaya karşı iki taraflı yüksek koruma sağlayan çadır tipi kurulum.'
  },
  {
    id: 'build_fire_reflector',
    name: 'Construct Log/Stone Fire Reflector',
    nameTr: 'Ateş Arkasına Isı Yansıtıcı Duvar İnşa Et',
    category: 'fire',
    requiredItems: [
      { itemId: 'dry_deadwood', count: 2 },
      { itemId: 'flint_stone', count: 2 }
    ],
    energyCost: 18,
    timeMinutes: 25,
    description: 'Bounces up to 70% of fire radiation into your shelter, doubling overnight warmth.',
    descriptionTr: 'Ateşin arkasına taş ve kütük duvar örerek ısının doğrudan barınağa yansımasını sağlar.'
  },

  // Cooking & Water
  {
    id: 'boil_safe_water',
    name: 'Boil & Purify Raw Water (1L)',
    nameTr: 'Ham Suyu Kaynatarak Arıt (1 Litre)',
    category: 'cooking',
    requiresFire: true,
    requiredItems: [
      { itemId: 'cook_pot', count: 1 },
      { itemId: 'water_unpurified_canteen', count: 1 }
    ],
    resultItemId: 'steel_canteen',
    resultCount: 1,
    energyCost: 4,
    timeMinutes: 10,
    description: 'Full rolling boil for 3 minutes kills all waterborne pathogens and amoebas.',
    descriptionTr: 'Suyu 3 dakika kaynatarak parazit ve bakterileri tamamen yok eder.'
  },
  {
    id: 'brew_rosehip_tea',
    name: 'Brew Wild Mountain Rosehip Tea',
    nameTr: 'Yabani Kuşburnu Dağ Çayı Demle',
    category: 'cooking',
    requiresFire: true,
    requiredItems: [
      { itemId: 'cook_pot', count: 1 },
      { itemId: 'wild_rosehip', count: 1 },
      { itemId: 'steel_canteen', count: 1 }
    ],
    energyCost: 5,
    timeMinutes: 12,
    description: 'Hot infusion packed with natural Vitamin C. Restores morale, soothes throat, warms core temperature.',
    descriptionTr: 'C vitamini deposu sıcak dağ çayı. Moral yükseltir, iç sıcaklığı dengeler.'
  },
  {
    id: 'cook_bulgur_porridge',
    name: 'Cook Bulgur & Lentil Camp Stew',
    nameTr: 'Bulgurlu Mercimek Dağ Aşı Pişir',
    category: 'cooking',
    requiresFire: true,
    requiredItems: [
      { itemId: 'cook_pot', count: 1 },
      { itemId: 'bulgur_lentil_pack', count: 1 },
      { itemId: 'steel_canteen', count: 1 }
    ],
    energyCost: 8,
    timeMinutes: 20,
    description: 'Slow-simmered mountain porridge offering long-burning complex carbs and high satiety.',
    descriptionTr: 'Vücuda saatler süren enerji sağlayan sıcak ve besleyici kamp aşı.'
  }
];
