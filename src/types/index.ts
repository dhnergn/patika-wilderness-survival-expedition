export type BiomeType = 
  | 'pine_forest' 
  | 'rocky_scree' 
  | 'alpine_ridge' 
  | 'river_valley' 
  | 'mountain_meadow' 
  | 'shepherd_camp';

export type WeatherType = 
  | 'clear' 
  | 'partly_cloudy' 
  | 'overcast' 
  | 'mist' 
  | 'light_rain' 
  | 'heavy_downpour' 
  | 'thunderstorm' 
  | 'mountain_gale' 
  | 'light_snow';

export type ItemCategory = 
  | 'water' 
  | 'food' 
  | 'clothing' 
  | 'shelter' 
  | 'navigation' 
  | 'first_aid' 
  | 'fire' 
  | 'cooking' 
  | 'tool' 
  | 'resource';

export type ClothingSlot = 'head' | 'base_torso' | 'insulation_torso' | 'shell_torso' | 'legs' | 'feet' | 'hands';

export interface Item {
  id: string;
  name: string;
  nameTr: string;
  category: ItemCategory;
  weightKg: number;
  volumeL: number;
  durability: number; // 0 - 100
  maxDurability: number;
  quantity: number;
  description: string;
  descriptionTr: string;
  clothingSlot?: ClothingSlot;
  insulationValue?: number; // 0.0 - 1.0
  waterproofValue?: number; // 0.0 - 1.0
  windproofValue?: number; // 0.0 - 1.0
  calories?: number;
  hydrationMl?: number;
  isPerishable?: boolean;
  spoilHours?: number;
  purified?: boolean;
  tinderQuality?: number; // 0.0 - 1.0
  fuelBurnMinutes?: number;
  firstAidType?: 'bandage' | 'antiseptic' | 'blister_tape' | 'splint' | 'thermal_blanket' | 'analgesic' | 'rehydration_salts';
  equipped?: boolean;
}

export interface PlayerStats {
  health: number; // 0 - 100
  energy: number; // 0 - 100
  hydration: number; // 0 - 100
  hunger: number; // 0 - 100
  bodyTempC: number; // 35.0 (hypothermia) to 37.0 (normal) to 39.5 (fever/heatstroke)
  fatigue: number; // 0 - 100 (high fatigue lowers movement and reaction)
  morale: number; // 0 - 100
  clothingWetness: number; // 0 - 100 (%)
  warmthIndex: number; // combined insulation vs ambient
}

export type InjuryType = 
  | 'sprained_ankle' 
  | 'friction_blister' 
  | 'minor_laceration' 
  | 'mild_hypothermia' 
  | 'heat_exhaustion' 
  | 'burn_minor' 
  | 'insect_bite' 
  | 'waterborne_illness';

export interface ActiveInjury {
  id: string;
  type: InjuryType;
  severity: 'mild' | 'moderate' | 'severe';
  bodyPart: 'head' | 'torso' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg' | 'left_foot' | 'right_foot';
  treated: boolean;
  treatmentItem?: string;
  timeReceived: number;
  painLevel: number; // 0 - 10
  infectionRisk: number; // 0 - 100 (%)
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Landmark {
  id: string;
  name: string;
  nameTr: string;
  elevationM: number;
  x: number;
  y: number;
  type: 'peak' | 'spring' | 'pass' | 'cairn' | 'shelter' | 'cliff' | 'bridge';
  description: string;
  discovered: boolean;
}

export interface ResourceNode {
  id: string;
  x: number;
  y: number;
  type: 
    | 'deadwood_dry' 
    | 'deadwood_damp' 
    | 'pine_resin' 
    | 'birch_bark' 
    | 'mountain_spring' 
    | 'wild_rosehip' 
    | 'wild_mint' 
    | 'flint_stones' 
    | 'river_bank';
  name: string;
  nameTr: string;
  yieldItemId: string;
  yieldCount: number;
  harvested: boolean;
  requiresTool?: string;
}

export interface WildlifeEntity {
  id: string;
  name: string;
  nameTr: string;
  species: 'roe_deer' | 'wild_boar' | 'alpine_fox' | 'brown_bear' | 'wolf' | 'golden_eagle';
  x: number;
  y: number;
  vx: number;
  vy: number;
  alertState: 'calm' | 'alert' | 'fleeing' | 'curious' | 'warning';
  distanceToPlayer: number;
  behaviorNotes: string;
  behaviorNotesTr: string;
}

export interface CampSite {
  established: boolean;
  x: number;
  y: number;
  shelterType: 'none' | 'tarp_lean_to' | 'tarp_a_frame' | 'three_season_tent' | 'stone_bivy';
  shelterCondition: number; // 0 - 100
  windBreakBuilt: boolean;
  groundInsulationPlaced: boolean; // pine boughs or foam mat
  fireState: {
    lit: boolean;
    fuelLevelMinutes: number;
    heatRadiusM: number;
    hasReflectorWall: boolean;
    boilingPot: {
      hasWater: boolean;
      purified: boolean;
      cookingItem?: string;
      progressPercent: number;
    } | null;
  };
  foodHungHigh: boolean; // bear-bag technique
}

export interface GameTime {
  day: number;
  hour: number; // 0 - 23
  minute: number; // 0 - 59
  timeScale: number; // game minutes per real second
}

export interface WeatherState {
  current: WeatherType;
  ambientTempC: number;
  windSpeedKmh: number;
  windDirectionDeg: number; // 0 - 360
  barometricPressureHpa: number;
  precipitationRateMmH: number;
  visibilityMeters: number;
  forecast: {
    nextWeather: WeatherType;
    hoursUntilChange: number;
  };
}

export interface StoryChapter {
  id: number;
  title: string;
  titleTr: string;
  brief: string;
  briefTr: string;
  objectives: {
    id: string;
    text: string;
    textTr: string;
    completed: boolean;
  }[];
  journalEntry: string;
  journalEntryTr: string;
}

export interface CodexEntry {
  id: string;
  category: 
    | 'navigation' 
    | 'campcraft' 
    | 'firecraft' 
    | 'water' 
    | 'nutrition' 
    | 'first_aid' 
    | 'clothing' 
    | 'wildlife' 
    | 'mountain_safety';
  title: string;
  titleTr: string;
  summary: string;
  summaryTr: string;
  practicalTips: string[];
  practicalTipsTr: string[];
  commonMistakes: string[];
  commonMistakesTr: string[];
  unlocked: boolean;
}

export type DifficultyMode = 'explorer' | 'hiker' | 'mountaineer' | 'survivalist';

export interface GameSettings {
  language: 'en' | 'tr';
  difficulty: DifficultyMode;
  audioVolume: number;
  ambientVolume: number;
  compassStyle: 'orienteering' | 'military_lensatic';
  units: 'metric';
}
