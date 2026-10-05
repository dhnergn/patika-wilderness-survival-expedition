import { 
  PlayerStats, 
  WeatherState, 
  GameTime, 
  CampSite, 
  Item, 
  ActiveInjury, 
  WildlifeEntity,
  ResourceNode 
} from '../types';
import { soundEngine } from '../utils/audio';

export interface GameState {
  playerPos: { x: number; y: number };
  playerHeadingDeg: number;
  stats: PlayerStats;
  inventory: Record<string, Item>;
  time: GameTime;
  weather: WeatherState;
  camp: CampSite;
  injuries: ActiveInjury[];
  wildlife: WildlifeEntity[];
  resources: ResourceNode[];
  discoveredLandmarks: string[];
  currentChapterId: number;
  completedObjectives: string[];
  logs: { time: string; text: string; type: 'info' | 'warning' | 'alert' | 'success' }[];
}

export function createInitialState(spawnX = 30, spawnY = 35, initialItems: Record<string, Item>): GameState {
  return {
    playerPos: { x: spawnX, y: spawnY },
    playerHeadingDeg: 45,
    stats: {
      health: 100,
      energy: 95,
      hydration: 90,
      hunger: 85,
      bodyTempC: 37.0,
      fatigue: 10,
      morale: 90,
      clothingWetness: 0,
      warmthIndex: 1.0
    },
    inventory: JSON.parse(JSON.stringify(initialItems)),
    time: {
      day: 1,
      hour: 9,
      minute: 30,
      timeScale: 6 // 1 real second = 6 game minutes (10 real seconds = 1 game hour)
    },
    weather: {
      current: 'partly_cloudy',
      ambientTempC: 15.0,
      windSpeedKmh: 14,
      windDirectionDeg: 270, // West
      barometricPressureHpa: 1016,
      precipitationRateMmH: 0,
      visibilityMeters: 1200,
      forecast: {
        nextWeather: 'mist',
        hoursUntilChange: 4
      }
    },
    camp: {
      established: false,
      x: 0,
      y: 0,
      shelterType: 'none',
      shelterCondition: 100,
      windBreakBuilt: false,
      groundInsulationPlaced: false,
      fireState: {
        lit: false,
        fuelLevelMinutes: 0,
        heatRadiusM: 3.5,
        hasReflectorWall: false,
        boilingPot: null
      },
      foodHungHigh: false
    },
    injuries: [],
    wildlife: [],
    resources: [],
    discoveredLandmarks: ['kartal_tepesi', 'dumanli_zirve'],
    currentChapterId: 1,
    completedObjectives: [],
    logs: [
      {
        time: '09:30',
        text: 'Expedition commenced. Check your compass bearing and backpack weight distribution.',
        type: 'info'
      }
    ]
  };
}

export function calculateBackpackWeight(inventory: Record<string, Item>): {
  totalWeightKg: number;
  totalVolumeL: number;
  isOverburdened: boolean;
} {
  let totalWeightKg = 0;
  let totalVolumeL = 0;

  for (const item of Object.values(inventory)) {
    // Only count items in backpack, not equipped worn clothes
    if (item.clothingSlot && item.equipped) {
      continue;
    }
    totalWeightKg += item.weightKg * item.quantity;
    totalVolumeL += item.volumeL * item.quantity;
  }

  return {
    totalWeightKg: Math.round(totalWeightKg * 100) / 100,
    totalVolumeL: Math.round(totalVolumeL * 10) / 10,
    isOverburdened: totalWeightKg > 18.0
  };
}

export function tickGameSimulation(
  state: GameState,
  deltaTimeSeconds: number,
  playerMovedThisTick: boolean,
  currentElevationM: number,
  currentSlopeDeg: number
): GameState {
  const next = { ...state };
  const minutesPassed = (deltaTimeSeconds * next.time.timeScale);

  // 1. Advance Time
  let newMinute = next.time.minute + minutesPassed;
  let newHour = next.time.hour;
  let newDay = next.time.day;

  while (newMinute >= 60) {
    newMinute -= 60;
    newHour += 1;
    if (newHour >= 24) {
      newHour = 0;
      newDay += 1;
    }
  }

  next.time = {
    ...next.time,
    day: newDay,
    hour: newHour,
    minute: Math.floor(newMinute)
  };

  // 2. Dynamic Weather Simulation
  const hourOfDay = newHour + newMinute / 60;
  // Diurnal temperature cycle: peaks at 14:00, coolest at 05:00
  const sunElevationFactor = Math.sin(((hourOfDay - 6) / 24) * 2 * Math.PI);
  // Lapse rate: ~6.5°C drop per 1000m
  const elevationCooling = ((currentElevationM - 1200) / 1000) * 6.5;
  const baseTemp = 14 + sunElevationFactor * 6 - elevationCooling;

  // Weather effects
  let precipitationRate = 0;
  let visibility = 1200;

  if (next.weather.current === 'light_rain') {
    precipitationRate = 2.5;
    visibility = 600;
  } else if (next.weather.current === 'heavy_downpour') {
    precipitationRate = 9.0;
    visibility = 250;
  } else if (next.weather.current === 'mist') {
    visibility = 90;
    precipitationRate = 0.5;
  } else if (next.weather.current === 'light_snow') {
    precipitationRate = 1.5;
    visibility = 400;
  }

  // Wind chill calculation (Jag/Tsi formula simplified)
  const windChillOffset = next.weather.windSpeedKmh > 5 
    ? 0.04 * (next.weather.windSpeedKmh - 5) * (baseTemp < 10 ? 1.4 : 0.6) 
    : 0;
  const effectiveAmbient = Math.round((baseTemp - windChillOffset) * 10) / 10;

  next.weather = {
    ...next.weather,
    ambientTempC: effectiveAmbient,
    precipitationRateMmH: precipitationRate,
    visibilityMeters: visibility
  };

  // 3. Campfire burn simulation
  let nearLitFire = false;
  if (next.camp.established && next.camp.fireState.lit) {
    const distToCamp = Math.hypot(next.playerPos.x - next.camp.x, next.playerPos.y - next.camp.y);
    nearLitFire = distToCamp <= next.camp.fireState.heatRadiusM;

    const remainingFuel = Math.max(0, next.camp.fireState.fuelLevelMinutes - minutesPassed);
    next.camp = {
      ...next.camp,
      fireState: {
        ...next.camp.fireState,
        fuelLevelMinutes: remainingFuel,
        lit: remainingFuel > 0
      }
    };
  }

  // 4. Clothing Wetness
  let shellEquipped = false;
  let totalInsulation = 0;
  for (const item of Object.values(next.inventory)) {
    if (item.clothingSlot && item.equipped) {
      totalInsulation += (item.insulationValue || 0.2);
      if (item.clothingSlot === 'shell_torso' && (item.waterproofValue || 0) > 0.8) {
        shellEquipped = true;
      }
    }
  }

  const shelteredFromRain = next.camp.established && 
    next.camp.shelterType !== 'none' && 
    Math.hypot(next.playerPos.x - next.camp.x, next.playerPos.y - next.camp.y) < 2.5;

  let wetness = next.stats.clothingWetness;
  if (precipitationRate > 0 && !shellEquipped && !shelteredFromRain) {
    wetness = Math.min(100, wetness + precipitationRate * (minutesPassed / 60) * 12);
  } else if (nearLitFire || (!precipitationRate && next.weather.windSpeedKmh > 10)) {
    // Dries near fire or in dry wind
    const dryRate = nearLitFire ? 25 : 5;
    wetness = Math.max(0, wetness - (dryRate * minutesPassed) / 60);
  }

  // 5. Survival Stats (Metabolism)
  const { totalWeightKg, isOverburdened } = calculateBackpackWeight(next.inventory);
  const exertionFactor = (playerMovedThisTick ? 2.2 : 0.8) * (1 + totalWeightKg / 25) * (1 + currentSlopeDeg / 40);

  // Hydration drain
  const hydrationDrain = (3.5 * exertionFactor * (minutesPassed / 60));
  const newHydration = Math.max(0, next.stats.hydration - hydrationDrain);

  // Hunger drain
  const hungerDrain = (1.8 * exertionFactor * (minutesPassed / 60));
  const newHunger = Math.max(0, next.stats.hunger - hungerDrain);

  // Energy & Fatigue
  let energyChange = playerMovedThisTick ? -0.8 * exertionFactor : 0.1;
  if (newHydration < 20 || newHunger < 20) {
    energyChange -= 0.5;
  }
  const newEnergy = Math.max(0, Math.min(100, next.stats.energy + energyChange * (minutesPassed / 10)));
  const newFatigue = Math.min(100, next.stats.fatigue + (playerMovedThisTick ? 0.35 : -0.1) * exertionFactor * (minutesPassed / 10));

  // Thermal balance (Core temp)
  const wetnessCooling = (wetness / 100) * 4.5;
  const fireBonus = nearLitFire ? (next.camp.fireState.hasReflectorWall ? 14 : 9) : 0;
  const netThermalExposure = (effectiveAmbient + fireBonus) - (20 - totalInsulation * 15) - wetnessCooling;

  let bodyTemp = next.stats.bodyTempC;
  if (netThermalExposure < -5) {
    // Hypothermia danger
    bodyTemp = Math.max(34.0, bodyTemp - 0.08 * (minutesPassed / 60));
  } else if (netThermalExposure > 12 && playerMovedThisTick) {
    // Hyperthermia / overheating
    bodyTemp = Math.min(39.2, bodyTemp + 0.05 * (minutesPassed / 60));
  } else {
    // Normalizing towards 37.0°C
    if (bodyTemp < 37.0) bodyTemp = Math.min(37.0, bodyTemp + 0.2 * (minutesPassed / 60));
    if (bodyTemp > 37.0) bodyTemp = Math.max(37.0, bodyTemp - 0.2 * (minutesPassed / 60));
  }

  // Health damage from severe starvation, dehydration or hypothermia
  let healthDamage = 0;
  if (newHydration <= 0) healthDamage += 0.8;
  if (newHunger <= 0) healthDamage += 0.4;
  if (bodyTemp < 35.0) healthDamage += 1.2; // Hypothermic crisis

  const newHealth = Math.max(0, Math.min(100, next.stats.health - healthDamage * (minutesPassed / 10)));

  next.stats = {
    ...next.stats,
    health: Math.round(newHealth * 10) / 10,
    energy: Math.round(newEnergy * 10) / 10,
    hydration: Math.round(newHydration * 10) / 10,
    hunger: Math.round(newHunger * 10) / 10,
    fatigue: Math.round(newFatigue * 10) / 10,
    bodyTempC: Math.round(bodyTemp * 10) / 10,
    clothingWetness: Math.round(wetness * 10) / 10,
    warmthIndex: Math.round(totalInsulation * 10) / 10
  };

  // Sound Engine ambient update
  const nearStream = Math.abs(next.playerPos.x - 40) < 4;
  soundEngine.updateAmbience(
    next.weather.windSpeedKmh,
    precipitationRate / 9.0,
    nearLitFire,
    nearStream
  );

  return next;
}
