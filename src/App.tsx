import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { BackpackModal } from './components/BackpackModal';
import { NavigationModal } from './components/NavigationModal';
import { CampModal } from './components/CampModal';
import { FirstAidModal } from './components/FirstAidModal';
import { FieldCodexModal } from './components/FieldCodexModal';
import { StoryModal } from './components/StoryModal';

import { generateWildernessMap, WildernessMap } from './game/proceduralWorld';
import { createInitialState, tickGameSimulation, GameState } from './game/simulation';
import { INITIAL_ITEMS } from './data/items';
import { Recipe } from './data/recipes';
import { soundEngine } from './utils/audio';

export default function App() {
  const [mapData] = useState<WildernessMap>(() => generateWildernessMap(80, 80, 54321));
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('patika_savegame');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to initial
      }
    }
    return createInitialState(30, 35, INITIAL_ITEMS);
  });

  const [activeModal, setActiveModal] = useState<'backpack' | 'navigation' | 'camp' | 'firstAid' | 'codex' | 'story' | null>(null);
  const [lang, setLang] = useState<'en' | 'tr'>('tr'); // Default to Turkish or toggle to English
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const playerMovedRef = useRef<boolean>(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save game to localStorage every 10 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('patika_savegame', JSON.stringify(gameState));
    }, 10000);
    return () => clearInterval(saveInterval);
  }, [gameState]);

  // Current tile elevation and slope
  const tileX = Math.floor(gameState.playerPos.x);
  const tileY = Math.floor(gameState.playerPos.y);
  const currentTile = mapData.tiles[tileX]?.[tileY] || { elevationM: 1450, slopeDeg: 5 };

  // Core Simulation Heartbeat (Runs every 250ms)
  useEffect(() => {
    const simInterval = setInterval(() => {
      setGameState((prev) => {
        const next = tickGameSimulation(
          prev,
          0.25, // 0.25 second delta
          playerMovedRef.current,
          currentTile.elevationM,
          currentTile.slopeDeg
        );
        playerMovedRef.current = false;
        return next;
      });
    }, 250);

    return () => clearInterval(simInterval);
  }, [currentTile.elevationM, currentTile.slopeDeg]);

  // Player movement callback
  const handlePlayerMove = useCallback((newX: number, newY: number, heading: number) => {
    playerMovedRef.current = true;
    setGameState((prev) => ({
      ...prev,
      playerPos: { x: newX, y: newY },
      playerHeadingDeg: heading
    }));
  }, []);

  // Interact with Resource
  const handleInteractResource = (resId: string) => {
    const res = mapData.resources.find((r) => r.id === resId);
    if (!res || res.harvested) return;

    soundEngine.playBandageRustle();
    res.harvested = true;

    setGameState((prev) => {
      const inv = { ...prev.inventory };
      const existing = inv[res.yieldItemId];

      if (existing) {
        inv[res.yieldItemId] = {
          ...existing,
          quantity: existing.quantity + res.yieldCount
        };
      } else {
        const itemTemplate = INITIAL_ITEMS[res.yieldItemId];
        if (itemTemplate) {
          inv[res.yieldItemId] = {
            ...itemTemplate,
            quantity: res.yieldCount
          };
        }
      }

      // Check Objective 1-2 (Gather wood)
      const completed = [...prev.completedObjectives];
      if (res.yieldItemId === 'dry_deadwood' && !completed.includes('obj_gather_wood')) {
        completed.push('obj_gather_wood');
      }

      const logText = lang === 'tr'
        ? `${res.yieldCount} adet ${res.nameTr} toplandı.`
        : `Gathered ${res.yieldCount}x ${res.name}.`;

      return {
        ...prev,
        inventory: inv,
        completedObjectives: completed,
        logs: [
          ...prev.logs,
          {
            time: `${String(prev.time.hour).padStart(2, '0')}:${String(prev.time.minute).padStart(2, '0')}`,
            text: logText,
            type: 'success'
          }
        ]
      };
    });
  };

  // Drink fresh water
  const handleDrinkWater = () => {
    soundEngine.playWaterSip();
    setGameState((prev) => {
      const newHydration = Math.min(100, prev.stats.hydration + 40);
      const completed = [...prev.completedObjectives];
      if (!completed.includes('obj_discover_water')) {
        completed.push('obj_discover_water');
      }

      return {
        ...prev,
        stats: {
          ...prev.stats,
          hydration: newHydration
        },
        completedObjectives: completed,
        logs: [
          ...prev.logs,
          {
            time: `${String(prev.time.hour).padStart(2, '0')}:${String(prev.time.minute).padStart(2, '0')}`,
            text: lang === 'tr' ? 'Kaynak suyundan içildi. Hidrasyon yenilendi.' : 'Drank clean spring water. Hydration restored.',
            type: 'info'
          }
        ]
      };
    });
  };

  // Equip / Unequip Clothing Layer
  const handleEquipItem = (itemId: string) => {
    soundEngine.playBandageRustle();
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      const item = inv[itemId];
      if (!item) return prev;

      inv[itemId] = {
        ...item,
        equipped: !item.equipped
      };

      return {
        ...prev,
        inventory: inv
      };
    });
  };

  // Use consumable item (Eat / Drink canteen)
  const handleUseItem = (itemId: string) => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      const item = inv[itemId];
      if (!item || item.quantity <= 0) return prev;

      let newHunger = prev.stats.hunger;
      let newHydration = prev.stats.hydration;
      let newMorale = prev.stats.morale;

      if (item.category === 'food') {
        soundEngine.playBandageRustle();
        newHunger = Math.min(100, newHunger + (item.calories ? item.calories / 30 : 25));
        newMorale = Math.min(100, newMorale + 10);
      } else if (item.category === 'water') {
        soundEngine.playWaterSip();
        newHydration = Math.min(100, newHydration + 35);
      }

      if (item.quantity > 1) {
        inv[itemId] = { ...item, quantity: item.quantity - 1 };
      } else if (!item.clothingSlot && item.category !== 'water') {
        delete inv[itemId];
      }

      return {
        ...prev,
        inventory: inv,
        stats: {
          ...prev.stats,
          hunger: Math.round(newHunger),
          hydration: Math.round(newHydration),
          morale: Math.round(newMorale)
        }
      };
    });
  };

  // Drop item to lighten backpack
  const handleDropItem = (itemId: string) => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      delete inv[itemId];
      return {
        ...prev,
        inventory: inv
      };
    });
  };

  // Crafting / Camp / Cooking Recipe Execution
  const handleCraftRecipe = (recipe: Recipe) => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };

      // Deduct ingredients
      for (const req of recipe.requiredItems) {
        const item = inv[req.itemId];
        if (item) {
          if (item.quantity > req.count) {
            inv[req.itemId] = { ...item, quantity: item.quantity - req.count };
          } else if (item.category !== 'shelter' && item.category !== 'cooking') {
            delete inv[req.itemId];
          }
        }
      }

      // Add resulting item if cooking
      if (recipe.resultItemId) {
        const template = INITIAL_ITEMS[recipe.resultItemId];
        if (template) {
          inv[recipe.resultItemId] = {
            ...template,
            quantity: (inv[recipe.resultItemId]?.quantity || 0) + (recipe.resultCount || 1)
          };
        }
      }

      // Camp updates
      let updatedCamp = { ...prev.camp };
      const completed = [...prev.completedObjectives];

      if (recipe.id === 'pitch_tarp_lean_to') {
        updatedCamp = {
          ...updatedCamp,
          established: true,
          x: prev.playerPos.x,
          y: prev.playerPos.y,
          shelterType: 'tarp_lean_to',
          windBreakBuilt: true
        };
        if (!completed.includes('obj_pitch_camp')) completed.push('obj_pitch_camp');
      } else if (recipe.id === 'pitch_tarp_a_frame') {
        updatedCamp = {
          ...updatedCamp,
          established: true,
          x: prev.playerPos.x,
          y: prev.playerPos.y,
          shelterType: 'tarp_a_frame',
          windBreakBuilt: true,
          groundInsulationPlaced: true
        };
        if (!completed.includes('obj_pitch_camp')) completed.push('obj_pitch_camp');
      } else if (recipe.id === 'build_fire_reflector') {
        updatedCamp = {
          ...updatedCamp,
          fireState: {
            ...updatedCamp.fireState,
            hasReflectorWall: true,
            heatRadiusM: 5.0
          }
        };
      }

      return {
        ...prev,
        inventory: inv,
        camp: updatedCamp,
        completedObjectives: completed,
        stats: {
          ...prev.stats,
          energy: Math.max(0, prev.stats.energy - recipe.energyCost)
        },
        logs: [
          ...prev.logs,
          {
            time: `${String(prev.time.hour).padStart(2, '0')}:${String(prev.time.minute).padStart(2, '0')}`,
            text: lang === 'tr' ? `${recipe.nameTr} tamamlandı.` : `Completed: ${recipe.name}.`,
            type: 'success'
          }
        ]
      };
    });
  };

  // Light Fire
  const handleLightFire = () => {
    setGameState((prev) => {
      const completed = [...prev.completedObjectives];
      if (!completed.includes('obj_light_fire')) completed.push('obj_light_fire');

      return {
        ...prev,
        camp: {
          ...prev.camp,
          established: true,
          x: prev.playerPos.x,
          y: prev.playerPos.y,
          fireState: {
            ...prev.camp.fireState,
            lit: true,
            fuelLevelMinutes: 90
          }
        },
        completedObjectives: completed,
        logs: [
          ...prev.logs,
          {
            time: `${String(prev.time.hour).padStart(2, '0')}:${String(prev.time.minute).padStart(2, '0')}`,
            text: lang === 'tr' ? 'Kamp ateşi yandı. Çevreye sıcaklık yayılıyor.' : 'Campfire ignited. Radiant heat spreading.',
            type: 'success'
          }
        ]
      };
    });
  };

  // Add deadwood to campfire
  const handleAddFuel = () => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      const wood = inv.dry_deadwood;
      if (!wood || wood.quantity <= 0) return prev;

      if (wood.quantity > 1) {
        inv.dry_deadwood = { ...wood, quantity: wood.quantity - 1 };
      } else {
        delete inv.dry_deadwood;
      }

      return {
        ...prev,
        inventory: inv,
        camp: {
          ...prev.camp,
          fireState: {
            ...prev.camp.fireState,
            fuelLevelMinutes: prev.camp.fireState.fuelLevelMinutes + 60
          }
        },
        logs: [
          ...prev.logs,
          {
            time: `${String(prev.time.hour).padStart(2, '0')}:${String(prev.time.minute).padStart(2, '0')}`,
            text: lang === 'tr' ? 'Ocağa kuru odun eklendi (+60 dk).' : 'Fed seasoned deadwood to hearth (+60m).',
            type: 'info'
          }
        ]
      };
    });
  };

  // Treat Injury
  const handleTreatInjury = (injuryId: string, itemId: string) => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      const item = inv[itemId];
      if (item) {
        if (item.quantity > 1) {
          inv[itemId] = { ...item, quantity: item.quantity - 1 };
        } else {
          delete inv[itemId];
        }
      }

      const updatedInjuries = prev.injuries.map((inj) => {
        if (inj.id === injuryId) {
          return {
            ...inj,
            treated: true,
            treatmentItem: itemId,
            painLevel: Math.max(1, inj.painLevel - 4),
            infectionRisk: 0
          };
        }
        return inj;
      });

      return {
        ...prev,
        inventory: inv,
        injuries: updatedInjuries,
        stats: {
          ...prev.stats,
          health: Math.min(100, prev.stats.health + 15),
          morale: Math.min(100, prev.stats.morale + 20)
        },
        logs: [
          ...prev.logs,
          {
            time: `${String(prev.time.hour).padStart(2, '0')}:${String(prev.time.minute).padStart(2, '0')}`,
            text: lang === 'tr' ? 'İlk yardım protokolü başarıyla uygulandı.' : 'First aid protocol successfully executed.',
            type: 'success'
          }
        ]
      };
    });
  };

  // Rest 1 Game Hour
  const handleRest = () => {
    setGameState((prev) => {
      let newHour = prev.time.hour + 1;
      let newDay = prev.time.day;
      if (newHour >= 24) {
        newHour = 0;
        newDay += 1;
      }

      const nearFire = prev.camp.fireState.lit;
      const energyGain = nearFire ? 35 : 18;
      const fatigueLoss = nearFire ? 45 : 25;

      return {
        ...prev,
        time: {
          ...prev.time,
          day: newDay,
          hour: newHour
        },
        stats: {
          ...prev.stats,
          energy: Math.min(100, prev.stats.energy + energyGain),
          fatigue: Math.max(0, prev.stats.fatigue - fatigueLoss),
          hydration: Math.max(0, prev.stats.hydration - 5),
          hunger: Math.max(0, prev.stats.hunger - 3)
        },
        logs: [
          ...prev.logs,
          {
            time: `${String(newHour).padStart(2, '0')}:00`,
            text: lang === 'tr' ? '1 saat dinlenildi. Enerji ve yorgunluk toparlandı.' : 'Rested for 1 hour. Energy replenished.',
            type: 'info'
          }
        ]
      };
    });
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMute(nextMute);
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'tr' ? 'en' : 'tr'));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none">
      {/* 2D Topographic Game Canvas */}
      <GameCanvas
        gameState={gameState}
        mapData={mapData}
        onPlayerMove={handlePlayerMove}
        onInteractResource={handleInteractResource}
        onDrinkWater={handleDrinkWater}
        isMobile={isMobile}
      />

      {/* Rugged Expedition HUD */}
      <HUD
        gameState={gameState}
        currentElevationM={currentTile.elevationM}
        onOpenModal={(modal) => setActiveModal(modal)}
        onRest={handleRest}
        lang={lang}
        onToggleLang={handleToggleLang}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Interactive System Modals */}
      {activeModal === 'backpack' && (
        <BackpackModal
          inventory={gameState.inventory}
          onEquipItem={handleEquipItem}
          onUseItem={handleUseItem}
          onDropItem={handleDropItem}
          onClose={() => setActiveModal(null)}
          lang={lang}
        />
      )}

      {activeModal === 'navigation' && (
        <NavigationModal
          gameState={gameState}
          mapData={mapData}
          onClose={() => setActiveModal(null)}
          lang={lang}
        />
      )}

      {activeModal === 'camp' && (
        <CampModal
          gameState={gameState}
          onCraftRecipe={handleCraftRecipe}
          onLightFire={handleLightFire}
          onAddFuel={handleAddFuel}
          onClose={() => setActiveModal(null)}
          lang={lang}
        />
      )}

      {activeModal === 'firstAid' && (
        <FirstAidModal
          gameState={gameState}
          onTreatInjury={handleTreatInjury}
          onClose={() => setActiveModal(null)}
          lang={lang}
        />
      )}

      {activeModal === 'codex' && (
        <FieldCodexModal
          onClose={() => setActiveModal(null)}
          lang={lang}
        />
      )}

      {activeModal === 'story' && (
        <StoryModal
          gameState={gameState}
          onClose={() => setActiveModal(null)}
          lang={lang}
        />
      )}
    </div>
  );
}
