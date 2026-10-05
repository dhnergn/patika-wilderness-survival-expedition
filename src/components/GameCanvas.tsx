import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState } from '../game/simulation';
import { WildernessMap, WorldTile } from '../game/proceduralWorld';
import { soundEngine } from '../utils/audio';

interface GameCanvasProps {
  gameState: GameState;
  mapData: WildernessMap;
  onPlayerMove: (newX: number, newY: number, heading: number) => void;
  onInteractResource: (resourceId: string) => void;
  onDrinkWater: () => void;
  isMobile: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  mapData,
  onPlayerMove,
  onInteractResource,
  onDrinkWater,
  isMobile
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysPressed = useRef<Record<string, boolean>>({});
  const lastStepSoundTime = useRef<number>(0);
  const [interactPrompt, setInteractPrompt] = useState<{
    text: string;
    action: () => void;
  } | null>(null);

  // Target destination for touch / click navigation
  const targetPos = useRef<{ x: number; y: number } | null>(null);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling when using arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysPressed.current[e.code] = true;
      targetPos.current = null; // Keyboard overrides click-to-move
      soundEngine.init();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Check interaction prompts (water, resource node, camp)
  useEffect(() => {
    const px = gameState.playerPos.x;
    const py = gameState.playerPos.y;

    // Check water
    const tileX = Math.floor(px);
    const tileY = Math.floor(py);
    const currentTile = mapData.tiles[tileX]?.[tileY];

    if (currentTile?.isWater || Math.abs(px - 40) < 2.5) {
      setInteractPrompt({
        text: 'Drink Fresh Spring Water (Su İç / Doldur)',
        action: onDrinkWater
      });
      return;
    }

    // Check resources within 1.8 units
    let nearbyRes = null;
    for (const res of mapData.resources) {
      if (!res.harvested) {
        const d = Math.hypot(res.x - px, res.y - py);
        if (d < 1.8) {
          nearbyRes = res;
          break;
        }
      }
    }

    if (nearbyRes) {
      setInteractPrompt({
        text: `Gather ${nearbyRes.name} (${nearbyRes.nameTr})`,
        action: () => onInteractResource(nearbyRes.id)
      });
      return;
    }

    setInteractPrompt(null);
  }, [gameState.playerPos, mapData, onDrinkWater, onInteractResource]);

  // Main game loop (Movement & Rendering)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // 1. Process Player Movement
      let dx = 0;
      let dy = 0;

      if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) dy -= 1;
      if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) dy += 1;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) dx -= 1;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) dx += 1;

      // Click to move target tracking
      if (targetPos.current && dx === 0 && dy === 0) {
        const toTargetX = targetPos.current.x - gameState.playerPos.x;
        const toTargetY = targetPos.current.y - gameState.playerPos.y;
        const dist = Math.hypot(toTargetX, toTargetY);
        if (dist > 0.4) {
          dx = toTargetX / dist;
          dy = toTargetY / dist;
        } else {
          targetPos.current = null;
        }
      }

      if (dx !== 0 || dy !== 0) {
        const length = Math.hypot(dx, dy);
        const normX = dx / length;
        const normY = dy / length;

        // Speed depends on fatigue and backpack weight
        const baseSpeed = 4.2; // tiles per second
        const fatiguePenalty = Math.max(0.4, 1.0 - (gameState.stats.fatigue / 150));
        const moveDist = baseSpeed * fatiguePenalty * dt;

        const nextX = Math.max(1, Math.min(mapData.width - 2, gameState.playerPos.x + normX * moveDist));
        const nextY = Math.max(1, Math.min(mapData.height - 2, gameState.playerPos.y + normY * moveDist));

        // Heading in degrees (0 = North, 90 = East, 180 = South, 270 = West)
        let headingDeg = (Math.atan2(normX, -normY) * 180) / Math.PI;
        if (headingDeg < 0) headingDeg += 360;

        onPlayerMove(nextX, nextY, Math.round(headingDeg));

        // Footstep sound
        if (currentTime - lastStepSoundTime.current > 420) {
          const tile = mapData.tiles[Math.floor(nextX)]?.[Math.floor(nextY)];
          const isRocky = tile?.biome === 'rocky_scree' || tile?.biome === 'alpine_ridge';
          soundEngine.playFootstep(isRocky);
          lastStepSoundTime.current = currentTime;
        }
      }

      // 2. Render Frame
      render();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, mapData, onPlayerMove]);

  // Click / Touch Handler to move or interact
  const handleCanvasPointer = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    soundEngine.init();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const tileSize = 44; // pixels per tile
    const centerScreenX = canvas.width / 2;
    const centerScreenY = canvas.height / 2;

    const worldX = gameState.playerPos.x + (clientX - centerScreenX) / tileSize;
    const worldY = gameState.playerPos.y + (clientY - centerScreenY) / tileSize;

    targetPos.current = {
      x: Math.max(1, Math.min(mapData.width - 2, worldX)),
      y: Math.max(1, Math.min(mapData.height - 2, worldY))
    };
  }, [gameState.playerPos, mapData.width, mapData.height]);

  // Canvas Drawing
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport dimensions
    const width = canvas.width;
    const height = canvas.height;
    const tileSize = 44;

    ctx.clearRect(0, 0, width, height);

    const playerX = gameState.playerPos.x;
    const playerY = gameState.playerPos.y;
    const centerScreenX = width / 2;
    const centerScreenY = height / 2;

    // Visible tile boundaries
    const minTileX = Math.max(0, Math.floor(playerX - width / (2 * tileSize) - 1));
    const maxTileX = Math.min(mapData.width - 1, Math.ceil(playerX + width / (2 * tileSize) + 1));
    const minTileY = Math.max(0, Math.floor(playerY - height / (2 * tileSize) - 1));
    const maxTileY = Math.min(mapData.height - 1, Math.ceil(playerY + height / (2 * tileSize) + 1));

    // 1. Draw Biome Ground Tiles
    for (let x = minTileX; x <= maxTileX; x++) {
      for (let y = minTileY; y <= maxTileY; y++) {
        const tile = mapData.tiles[x][y];
        const screenX = centerScreenX + (x - playerX) * tileSize;
        const screenY = centerScreenY + (y - playerY) * tileSize;

        // Base biome color palette
        let baseColor = '#2d4a22'; // Pine forest deep pine green
        if (tile.biome === 'mountain_meadow') {
          baseColor = '#4a6b2f'; // Golden alpine grass
        } else if (tile.biome === 'rocky_scree') {
          baseColor = '#595d52'; // Grey slate scree
        } else if (tile.biome === 'alpine_ridge') {
          baseColor = '#737a70'; // Weathered limestone ridge
        } else if (tile.biome === 'shepherd_camp') {
          baseColor = '#3f4536'; // Trampled earth & moss
        }

        if (tile.isWater) {
          baseColor = '#2b525f'; // Glacial cold mountain river
        }

        ctx.fillStyle = baseColor;
        ctx.fillRect(screenX, screenY, tileSize + 0.5, tileSize + 0.5);

        // Topographic Contour Line Overlay (Curved contour markings every 50m)
        if (tile.elevationM % 50 < 8) {
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.22)'; // Subtle topographic contour gold
          ctx.lineWidth = tile.elevationM % 100 < 8 ? 1.8 : 0.8;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY + tileSize * 0.5);
          ctx.lineTo(screenX + tileSize, screenY + tileSize * 0.5);
          ctx.stroke();

          // Contour elevation tag
          if (x % 6 === 0 && y % 6 === 0) {
            ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
            ctx.font = '9px "IBM Plex Mono", monospace';
            ctx.fillText(`${tile.elevationM}m`, screenX + 2, screenY + tileSize * 0.5 - 2);
          }
        }

        // Mountain Trail Rendering
        if (tile.hasTrail) {
          ctx.strokeStyle = '#c4a47c';
          ctx.lineWidth = 3.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(screenX + tileSize * 0.5, screenY);
          ctx.lineTo(screenX + tileSize * 0.5, screenY + tileSize);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // River Rapids Animation
        if (tile.isWater) {
          const flowOffset = (performance.now() * 0.05) % tileSize;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(screenX + tileSize * 0.4, screenY + (flowOffset % tileSize), 4, 0, Math.PI);
          ctx.stroke();
        }

        // Forest Trees
        if (tile.biome === 'pine_forest' && !tile.hasTrail && !tile.isWater) {
          if ((x * 7 + y * 13) % 5 === 0) {
            // Pine tree trunk and dark green needle crown
            ctx.fillStyle = '#1c3016';
            ctx.beginPath();
            ctx.arc(screenX + tileSize * 0.5, screenY + tileSize * 0.5, tileSize * 0.42, 0, Math.PI * 2);
            ctx.fill();

            // Inner highlight
            ctx.fillStyle = '#2d4d24';
            ctx.beginPath();
            ctx.arc(screenX + tileSize * 0.46, screenY + tileSize * 0.46, tileSize * 0.22, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Shepherd Stone Walls
        if (tile.biome === 'shepherd_camp') {
          ctx.strokeStyle = '#8a857b';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(screenX + 2, screenY + 2, tileSize - 4, tileSize - 4);
        }
      }
    }

    // 2. Draw Harvestable Resources
    for (const res of mapData.resources) {
      if (res.harvested) continue;
      const screenX = centerScreenX + (res.x - playerX) * tileSize;
      const screenY = centerScreenY + (res.y - playerY) * tileSize;

      if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) continue;

      if (res.type === 'deadwood_dry') {
        // Crossed branches
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(screenX - 8, screenY - 5);
        ctx.lineTo(screenX + 8, screenY + 5);
        ctx.moveTo(screenX - 5, screenY + 6);
        ctx.lineTo(screenX + 7, screenY - 6);
        ctx.stroke();
      } else if (res.type === 'wild_rosehip') {
        // Red berries
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(screenX - 3, screenY - 2, 4, 0, Math.PI * 2);
        ctx.arc(screenX + 4, screenY + 1, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (res.type === 'pine_resin') {
        // Amber resin drop
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (res.type === 'flint_stones') {
        // Grey quartz stones
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Draw Campsite (Shelter & Campfire)
    if (gameState.camp.established) {
      const campScreenX = centerScreenX + (gameState.camp.x - playerX) * tileSize;
      const campScreenY = centerScreenY + (gameState.camp.y - playerY) * tileSize;

      // Shelter pitch
      if (gameState.camp.shelterType !== 'none') {
        ctx.fillStyle = '#b7791f'; // Desert/orange silnylon tarp
        ctx.beginPath();
        ctx.moveTo(campScreenX - 22, campScreenY - 18);
        ctx.lineTo(campScreenX + 22, campScreenY - 18);
        ctx.lineTo(campScreenX + 16, campScreenY + 16);
        ctx.lineTo(campScreenX - 16, campScreenY + 16);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Guyline cords
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(campScreenX - 22, campScreenY - 18);
        ctx.lineTo(campScreenX - 32, campScreenY - 26);
        ctx.moveTo(campScreenX + 22, campScreenY - 18);
        ctx.lineTo(campScreenX + 32, campScreenY - 26);
        ctx.stroke();
      }

      // Campfire pit & flames
      ctx.fillStyle = '#3a3a3a'; // Stone ring
      ctx.beginPath();
      ctx.arc(campScreenX, campScreenY + 28, 12, 0, Math.PI * 2);
      ctx.fill();

      if (gameState.camp.fireState.lit) {
        // Animated fire flickering
        const flicker = Math.sin(performance.now() * 0.015) * 2;
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.arc(campScreenX, campScreenY + 28, 8 + flicker, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(campScreenX, campScreenY + 28, 4 + flicker * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Fire reflector wall
        if (gameState.camp.fireState.hasReflectorWall) {
          ctx.strokeStyle = '#5a3d28';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(campScreenX, campScreenY + 28, 16, Math.PI * 0.8, Math.PI * 1.8);
          ctx.stroke();
        }
      }
    }

    // 4. Draw Wildlife
    for (const animal of mapData.wildlife) {
      const animalScreenX = centerScreenX + (animal.x - playerX) * tileSize;
      const animalScreenY = centerScreenY + (animal.y - playerY) * tileSize;

      if (animalScreenX < -40 || animalScreenX > width + 40 || animalScreenY < -40 || animalScreenY > height + 40) continue;

      ctx.save();
      ctx.translate(animalScreenX, animalScreenY);

      if (animal.species === 'roe_deer') {
        // Light tawny deer body
        ctx.fillStyle = '#b36b28';
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // White rump patch
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-7, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (animal.species === 'wild_boar') {
        // Dark brown bristled boar
        ctx.fillStyle = '#3a2e22';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (animal.species === 'alpine_fox') {
        // Rust fox with bushy white-tipped tail
        ctx.fillStyle = '#d35400';
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fcf3cf';
        ctx.beginPath();
        ctx.arc(-6, 0, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (animal.species === 'brown_bear') {
        // Large dark brown grizzly/Eurasian bear
        ctx.fillStyle = '#4a3219';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 5. Draw Target Destination Marker (if user tapped/clicked)
    if (targetPos.current) {
      const tx = centerScreenX + (targetPos.current.x - playerX) * tileSize;
      const ty = centerScreenY + (targetPos.current.y - playerY) * tileSize;
      const pulse = (Math.sin(performance.now() * 0.008) + 1) * 3;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tx, ty, 8 + pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 6. Draw Player Character
    ctx.save();
    ctx.translate(centerScreenX, centerScreenY);
    ctx.rotate((gameState.playerHeadingDeg * Math.PI) / 180);

    // Backpack silhouette (heavy pack worn on back)
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.roundRect(-8, 5, 16, 12, 4);
    ctx.fill();

    // Body (weather jacket)
    ctx.fillStyle = gameState.inventory.hardshell_jacket?.equipped ? '#e67e22' : '#27ae60';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head (beanie / hood)
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.arc(0, -6, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Sighting direction arrow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, -18);
    ctx.stroke();

    ctx.restore();

    // 7. Dynamic Ambient Day/Night & Weather Lighting Mask
    const hour = gameState.time.hour + gameState.time.minute / 60;
    let darknessAlpha = 0.0;

    if (hour >= 20.5 || hour < 5.0) {
      darknessAlpha = 0.88; // Deep starry mountain night
    } else if (hour >= 18.5 && hour < 20.5) {
      darknessAlpha = 0.1 + ((hour - 18.5) / 2) * 0.78; // Twilight
    } else if (hour >= 5.0 && hour < 7.0) {
      darknessAlpha = 0.88 - ((hour - 5.0) / 2) * 0.78; // Dawn
    }

    // Fog / Mist overlay
    if (gameState.weather.current === 'mist') {
      darknessAlpha = Math.max(darknessAlpha, 0.55);
    }

    if (darknessAlpha > 0.05) {
      ctx.save();
      // Cutout radial gradients around player headlamp and campfire
      const nightGrad = ctx.createRadialGradient(
        centerScreenX, 
        centerScreenY, 
        15, 
        centerScreenX, 
        centerScreenY, 
        280
      );

      nightGrad.addColorStop(0, 'rgba(5, 12, 18, 0.0)');
      nightGrad.addColorStop(0.35, `rgba(5, 12, 18, ${darknessAlpha * 0.45})`);
      nightGrad.addColorStop(1, `rgba(5, 12, 18, ${darknessAlpha})`);

      ctx.fillStyle = nightGrad;
      ctx.fillRect(0, 0, width, height);

      // Campfire warm radial illumination cutout
      if (gameState.camp.established && gameState.camp.fireState.lit) {
        const campScreenX = centerScreenX + (gameState.camp.x - playerX) * tileSize;
        const campScreenY = centerScreenY + (gameState.camp.y - playerY) * tileSize;
        const fireLight = ctx.createRadialGradient(
          campScreenX, 
          campScreenY + 28, 
          10, 
          campScreenX, 
          campScreenY + 28, 
          120
        );
        fireLight.addColorStop(0, 'rgba(243, 156, 18, 0.35)');
        fireLight.addColorStop(1, 'rgba(243, 156, 18, 0.0)');

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = fireLight;
        ctx.beginPath();
        ctx.arc(campScreenX, campScreenY + 28, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.restore();
    }

    // 8. Rain / Snow Particle Layer
    if (gameState.weather.current === 'light_rain' || gameState.weather.current === 'heavy_downpour') {
      const dropCount = gameState.weather.current === 'heavy_downpour' ? 140 : 50;
      ctx.strokeStyle = 'rgba(210, 230, 255, 0.65)';
      ctx.lineWidth = 1.2;
      const seed = performance.now() * 0.8;

      ctx.beginPath();
      for (let i = 0; i < dropCount; i++) {
        const rx = (Math.sin(i * 19 + seed * 0.001) * 0.5 + 0.5) * width;
        const ry = (Math.cos(i * 31 + seed * 0.005) * 0.5 + 0.5) * height;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + 12);
      }
      ctx.stroke();
    } else if (gameState.weather.current === 'light_snow') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      const seed = performance.now() * 0.2;
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 17 + seed * 0.0008) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 29 + seed * 0.002) * 0.5 + 0.5) * height;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Resize canvas to match display size exactly
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-stone-950">
      <canvas
        ref={canvasRef}
        onPointerDown={handleCanvasPointer}
        className="w-full h-full cursor-crosshair touch-none"
      />

      {/* Interaction Prompt Floating Button */}
      {interactPrompt && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <button
            onClick={interactPrompt.action}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xl border border-emerald-400/40 backdrop-blur-md transition-all active:scale-95 text-sm md:text-base"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            {interactPrompt.text}
          </button>
        </div>
      )}

      {/* Mobile Virtual On-Screen Direction Pad */}
      {isMobile && (
        <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-2 opacity-80 hover:opacity-100">
          <button
            onPointerDown={() => { keysPressed.current['ArrowUp'] = true; }}
            onPointerUp={() => { keysPressed.current['ArrowUp'] = false; }}
            className="w-12 h-12 rounded-xl bg-stone-900/80 border border-stone-700 text-stone-200 active:bg-emerald-700 text-lg font-bold flex items-center justify-center shadow-lg"
          >
            ▲
          </button>
          <div className="flex gap-4">
            <button
              onPointerDown={() => { keysPressed.current['ArrowLeft'] = true; }}
              onPointerUp={() => { keysPressed.current['ArrowLeft'] = false; }}
              className="w-12 h-12 rounded-xl bg-stone-900/80 border border-stone-700 text-stone-200 active:bg-emerald-700 text-lg font-bold flex items-center justify-center shadow-lg"
            >
              ◀
            </button>
            <button
              onPointerDown={() => { keysPressed.current['ArrowDown'] = true; }}
              onPointerUp={() => { keysPressed.current['ArrowDown'] = false; }}
              className="w-12 h-12 rounded-xl bg-stone-900/80 border border-stone-700 text-stone-200 active:bg-emerald-700 text-lg font-bold flex items-center justify-center shadow-lg"
            >
              ▼
            </button>
            <button
              onPointerDown={() => { keysPressed.current['ArrowRight'] = true; }}
              onPointerUp={() => { keysPressed.current['ArrowRight'] = false; }}
              className="w-12 h-12 rounded-xl bg-stone-900/80 border border-stone-700 text-stone-200 active:bg-emerald-700 text-lg font-bold flex items-center justify-center shadow-lg"
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
