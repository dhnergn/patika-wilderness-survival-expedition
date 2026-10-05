import { BiomeType, Landmark, ResourceNode, WildlifeEntity } from '../types';

export interface WorldTile {
  x: number;
  y: number;
  elevationM: number;
  biome: BiomeType;
  slopeDeg: number;
  vegetationDensity: number; // 0 - 1
  isWater: boolean;
  waterType?: 'stream' | 'spring' | 'marsh';
  hasTrail: boolean;
}

export interface WildernessMap {
  width: number;
  height: number;
  tiles: WorldTile[][];
  landmarks: Landmark[];
  resources: ResourceNode[];
  wildlife: WildlifeEntity[];
  spawnPoint: { x: number; y: number };
}

// Simple deterministic 2D Perlin/Simplex-style pseudo noise for natural terrain
function pseudoNoise(x: number, y: number, seed = 1337): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number, seed = 1337): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;

  // Smoothstep
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = pseudoNoise(i, j, seed);
  const n10 = pseudoNoise(i + 1, j, seed);
  const n01 = pseudoNoise(i, j + 1, seed);
  const n11 = pseudoNoise(i + 1, j + 1, seed);

  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;

  return nx0 * (1 - sy) + nx1 * sy;
}

function fractalElevation(x: number, y: number, seed: number): number {
  let elevation = 0;
  let amp = 1;
  let freq = 0.035;

  for (let o = 0; o < 4; o++) {
    elevation += smoothNoise(x * freq, y * freq, seed + o * 100) * amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return elevation; // approx 0.0 to 2.0
}

export function generateWildernessMap(width = 80, height = 80, seed = 4242): WildernessMap {
  const tiles: WorldTile[][] = [];

  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      // Base elevation between 1200m (valley) and 2200m (peaks)
      const rawElev = fractalElevation(x, y, seed);
      const elevationM = Math.round(1200 + rawElev * 500);

      // River winding from top-right to bottom-left
      const riverCenter = 40 + Math.sin(y * 0.1) * 8 + Math.cos(y * 0.05) * 5;
      const isRiver = Math.abs(x - riverCenter) < 1.8 && elevationM < 1650;

      // Determine Biome
      let biome: BiomeType = 'pine_forest';
      if (isRiver) {
        biome = 'river_valley';
      } else if (elevationM > 1900) {
        biome = 'alpine_ridge';
      } else if (elevationM > 1680) {
        biome = 'rocky_scree';
      } else if (rawElev > 0.8 && rawElev < 1.1) {
        biome = 'mountain_meadow';
      } else {
        biome = 'pine_forest';
      }

      // Check for historic shepherd enclosure
      if (Math.abs(x - 28) < 3 && Math.abs(y - 32) < 3) {
        biome = 'shepherd_camp';
      }

      // Trail passing through
      const trailX = 25 + Math.sin(y * 0.08) * 12;
      const hasTrail = Math.abs(x - trailX) < 1.2 && !isRiver;

      const slope = Math.round(Math.abs(rawElev - 1.0) * 35);
      const vegetation = biome === 'pine_forest' ? 0.85 : biome === 'mountain_meadow' ? 0.6 : 0.15;

      tiles[x][y] = {
        x,
        y,
        elevationM,
        biome,
        slopeDeg: slope,
        vegetationDensity: vegetation,
        isWater: isRiver,
        waterType: isRiver ? 'stream' : undefined,
        hasTrail
      };
    }
  }

  // Authentic Landmarks for navigation & resection
  const landmarks: Landmark[] = [
    {
      id: 'kartal_tepesi',
      name: 'Eagle Peak (Kartal Tepesi)',
      nameTr: 'Kartal Tepesi',
      elevationM: 2180,
      x: 15,
      y: 12,
      type: 'peak',
      description: 'Prominent jagged limestone spire visible from most of the western valley.',
      discovered: true
    },
    {
      id: 'dumanli_zirve',
      name: 'Misty Ridge (Dumanlı Sırt)',
      nameTr: 'Dumanlı Sırt',
      elevationM: 2110,
      x: 68,
      y: 18,
      type: 'peak',
      description: 'Wind-scoured granite summit often cloaked in lenticular clouds.',
      discovered: true
    },
    {
      id: 'ayi_pinari',
      name: 'Bear Spring (Ayı Pınarı)',
      nameTr: 'Ayı Pınarı',
      elevationM: 1390,
      x: 44,
      y: 35,
      type: 'spring',
      description: 'Sweet, ice-cold pure mountain spring gushing from a bedrock fissure.',
      discovered: false
    },
    {
      id: 'kurt_gedigi',
      name: 'Wolf Pass (Kurt Gediği)',
      nameTr: 'Kurt Gediği',
      elevationM: 1840,
      x: 52,
      y: 58,
      type: 'pass',
      description: 'Narrow mountain col flanked by vertical rock walls. Wind howls through here.',
      discovered: false
    },
    {
      id: 'eski_tas_agil',
      name: 'Ancient Stone Shepherd Enclosure',
      nameTr: 'Eski Taş Yayla Ağılı',
      elevationM: 1520,
      x: 28,
      y: 32,
      type: 'shelter',
      description: 'Centuries-old dry-stone walls offering shelter from freezing mountain gusts.',
      discovered: false
    },
    {
      id: 'ahsap_kopru',
      name: 'Old Cedar Log Bridge',
      nameTr: 'Sedir Kütük Köprüsü',
      elevationM: 1280,
      x: 42,
      y: 50,
      type: 'bridge',
      description: 'Sturdy ancient pine trunk lashed across the rushing glacial river.',
      discovered: false
    }
  ];

  // Distribute Resources logically across biomes
  const resources: ResourceNode[] = [];
  let nodeId = 1;

  for (let x = 4; x < width - 4; x += 3) {
    for (let y = 4; y < height - 4; y += 3) {
      const tile = tiles[x][y];
      const roll = pseudoNoise(x, y, seed + 999);

      if (tile.biome === 'pine_forest') {
        if (roll < 0.28) {
          resources.push({
            id: `res_${nodeId++}`,
            x,
            y,
            type: 'deadwood_dry',
            name: 'Seasoned Deadwood Branches',
            nameTr: 'Kuru Dal ve Çıra Odunu',
            yieldItemId: 'dry_deadwood',
            yieldCount: 2,
            harvested: false
          });
        } else if (roll < 0.38) {
          resources.push({
            id: `res_${nodeId++}`,
            x,
            y,
            type: 'pine_resin',
            name: 'Pine Resin Exudation',
            nameTr: 'Çam Sakızı & Reçine',
            yieldItemId: 'pine_resin_lump',
            yieldCount: 1,
            harvested: false
          });
        }
      } else if (tile.biome === 'mountain_meadow') {
        if (roll < 0.35) {
          resources.push({
            id: `res_${nodeId++}`,
            x,
            y,
            type: 'wild_rosehip',
            name: 'Wild Mountain Rosehip Bush',
            nameTr: 'Yabani Kuşburnu Çalısı',
            yieldItemId: 'wild_rosehip',
            yieldCount: 3,
            harvested: false
          });
        }
      } else if (tile.biome === 'river_valley' || tile.isWater) {
        if (roll < 0.35) {
          resources.push({
            id: `res_${nodeId++}`,
            x,
            y,
            type: 'flint_stones',
            name: 'Riverbed Quartzite & Flint',
            nameTr: 'Dere Çakmak Taşı & Kuvars',
            yieldItemId: 'flint_stone',
            yieldCount: 2,
            harvested: false
          });
        }
      }
    }
  }

  // Wildlife Entities
  const wildlife: WildlifeEntity[] = [
    {
      id: 'wildlife_deer_1',
      name: 'Roe Deer (Karaca)',
      nameTr: 'Dağ Karacası',
      species: 'roe_deer',
      x: 32,
      y: 20,
      vx: 0,
      vy: 0,
      alertState: 'calm',
      distanceToPlayer: 40,
      behaviorNotes: 'Grazing in sub-alpine meadow. Highly sensitive to wind direction and quick movement.',
      behaviorNotesTr: 'Çayırda otluyor. Rüzgar altındaysanız ve yavaş hareket ederseniz ürkmez.'
    },
    {
      id: 'wildlife_fox_1',
      name: 'Red Fox (Kızıl Tilki)',
      nameTr: 'Kızıl Tilki',
      species: 'alpine_fox',
      x: 22,
      y: 45,
      vx: 0,
      vy: 0,
      alertState: 'curious',
      distanceToPlayer: 35,
      behaviorNotes: 'Scouting along boulder edges for voles. Will cautiously observe campsite.',
      behaviorNotesTr: 'Kayalıkların arasında fare avlıyor. Çadır çevresini merakla izler.'
    },
    {
      id: 'wildlife_boar_1',
      name: 'Wild Boar (Yaban Domuzu)',
      nameTr: 'Yaban Domuzu',
      species: 'wild_boar',
      x: 60,
      y: 40,
      vx: 0,
      vy: 0,
      alertState: 'calm',
      distanceToPlayer: 50,
      behaviorNotes: 'Rooting for roots and truffles in pine duff. Avoid cornering or startling.',
      behaviorNotesTr: 'Ağaç diplerini kazıyor. Köşeye sıkıştırılmadığı sürece saldırmaz.'
    },
    {
      id: 'wildlife_bear_1',
      name: 'Brown Bear (Bozayı)',
      nameTr: 'Bozayı',
      species: 'brown_bear',
      x: 55,
      y: 24,
      vx: 0,
      vy: 0,
      alertState: 'calm',
      distanceToPlayer: 65,
      behaviorNotes: 'Foraging along upper berry slopes. Deterred by human voice and campfire smoke.',
      behaviorNotesTr: 'Yüksek yamaçlarda böğürtlen yiyor. Ateş dumanından ve insan sesinden uzak durur.'
    }
  ];

  return {
    width,
    height,
    tiles,
    landmarks,
    resources,
    wildlife,
    spawnPoint: { x: 30, y: 35 } // Near the ancient shepherd shelter & trail
  };
}
