import React from 'react';
import { GameState } from '../game/simulation';
import { 
  Heart, 
  Droplet, 
  Utensils, 
  Zap, 
  Thermometer, 
  Backpack, 
  Map as MapIcon, 
  Tent, 
  Cross, 
  BookOpen, 
  Moon, 
  Sun, 
  Wind, 
  Compass as CompassIcon,
  Volume2,
  VolumeX,
  Languages
} from 'lucide-react';
import { calculateBackpackWeight } from '../game/simulation';
import { soundEngine } from '../utils/audio';

interface HUDProps {
  gameState: GameState;
  currentElevationM: number;
  onOpenModal: (modal: 'backpack' | 'navigation' | 'camp' | 'firstAid' | 'codex' | 'story') => void;
  onRest: () => void;
  lang: 'en' | 'tr';
  onToggleLang: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  currentElevationM,
  onOpenModal,
  onRest,
  lang,
  onToggleLang,
  isMuted,
  onToggleMute
}) => {
  const { totalWeightKg, isOverburdened } = calculateBackpackWeight(gameState.inventory);
  const hour = gameState.time.hour;
  const isNight = hour >= 20 || hour < 6;

  // Heading Cardinal Direction
  const heading = gameState.playerHeadingDeg;
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const cardinalIndex = Math.round(heading / 45) % 8;
  const cardinalName = cardinals[cardinalIndex];

  // Temperature color
  const temp = gameState.stats.bodyTempC;
  const isHypothermic = temp < 35.8;
  const isHyperthermic = temp > 38.0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-5 select-none font-sans z-10">
      {/* Top Header: Compass Tape, Altimeter, Barometer, Time & Weather */}
      <div className="flex flex-wrap items-start justify-between gap-3 pointer-events-auto">
        {/* Top Left: Environment Readout */}
        <div className="bg-stone-900/85 backdrop-blur-md border border-stone-700/60 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-4 text-xs md:text-sm text-stone-200">
          <div className="flex items-center gap-1.5">
            {isNight ? <Moon className="w-4 h-4 text-indigo-300" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span className="font-mono font-medium">
              {lang === 'tr' ? `${gameState.time.day}. Gün` : `Day ${gameState.time.day}`}, {String(gameState.time.hour).padStart(2, '0')}:{String(gameState.time.minute).padStart(2, '0')}
            </span>
          </div>

          <div className="h-4 w-px bg-stone-700" />

          {/* Elevation Altimeter */}
          <div className="flex items-center gap-1 font-mono">
            <span className="text-stone-400">ALT:</span>
            <span className="text-emerald-400 font-semibold">{currentElevationM}m</span>
          </div>

          <div className="h-4 w-px bg-stone-700" />

          {/* Barometer */}
          <div className="hidden sm:flex items-center gap-1 font-mono">
            <span className="text-stone-400">BARO:</span>
            <span className="text-sky-300">{gameState.weather.barometricPressureHpa} hPa</span>
          </div>

          <div className="h-4 w-px bg-stone-700" />

          {/* Ambient Temp & Wind */}
          <div className="flex items-center gap-1.5 font-mono">
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            <span>{gameState.weather.ambientTempC}°C</span>
            <Wind className="w-3.5 h-3.5 text-stone-400 ml-1" />
            <span>{gameState.weather.windSpeedKmh} km/h</span>
          </div>
        </div>

        {/* Top Center: Compass Azimuth Tape */}
        <div 
          onClick={() => {
            soundEngine.playCompassClick();
            onOpenModal('navigation');
          }}
          className="bg-stone-900/85 backdrop-blur-md border border-amber-600/40 hover:border-amber-500 rounded-xl px-4 py-2 shadow-xl cursor-pointer flex items-center gap-2 text-stone-200 transition-all hover:scale-105 active:scale-95"
          title={lang === 'tr' ? 'Harita ve Kerteriz Aç' : 'Open Map & Compass'}
        >
          <CompassIcon className="w-4 h-4 text-amber-500 animate-spin-slow" />
          <span className="font-mono font-bold text-amber-400 text-sm">
            {String(heading).padStart(3, '0')}° {cardinalName}
          </span>
          <span className="text-[10px] text-stone-400 border border-stone-700 px-1 rounded">
            {lang === 'tr' ? 'HARİTA' : 'MAP'}
          </span>
        </div>

        {/* Top Right: System Settings (Language & Audio) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="bg-stone-900/80 hover:bg-stone-800 border border-stone-700 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-stone-300 flex items-center gap-1 transition-all"
            title="Switch Language (TR/EN)"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            {lang.toUpperCase()}
          </button>
          <button
            onClick={onToggleMute}
            className="bg-stone-900/80 hover:bg-stone-800 border border-stone-700 p-2 rounded-lg text-stone-300 transition-all"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Middle Top: Active Objective Banner */}
      <div 
        onClick={() => onOpenModal('story')}
        className="pointer-events-auto self-start mt-2 bg-stone-900/85 hover:bg-stone-850 backdrop-blur-md border border-stone-700/70 hover:border-amber-600/60 rounded-xl px-4 py-2 max-w-md shadow-lg cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-0.5">
          <span>{lang === 'tr' ? 'GÖREV GÜNLÜĞÜ' : 'EXPEDITION LOG'}</span>
          <span className="text-[10px] text-stone-400">{lang === 'tr' ? 'Açmak için tıkla' : 'Click to read'}</span>
        </div>
        <p className="text-xs text-stone-200 line-clamp-1">
          {lang === 'tr' 
            ? 'Sırt çantası ağırlık dengesini kontrol et ve güvenli kamp yeri belirle.'
            : 'Check pack balance and locate a safe campsite before sunset.'}
        </p>
      </div>

      {/* Notification Logs Ticker */}
      {gameState.logs.length > 0 && (
        <div className="self-start mt-2 flex flex-col gap-1 max-w-sm pointer-events-none">
          {gameState.logs.slice(-2).map((log, idx) => (
            <div 
              key={idx} 
              className="bg-stone-950/80 border-l-2 border-amber-500 text-[11px] px-3 py-1.5 rounded-r-lg text-stone-300 font-mono shadow-md backdrop-blur-sm animate-fade-in"
            >
              <span className="text-amber-400 font-bold mr-1.5">[{log.time}]</span>
              {log.text}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Section: Survival Vitals & Quick Action Toolbar */}
      <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-3 pointer-events-auto mt-auto">
        {/* Survival Vitals Bar */}
        <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700/80 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center gap-3 md:gap-4 max-w-xl">
          {/* Health */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <div className="w-16 md:w-20 bg-stone-800 rounded-full h-2.5 overflow-hidden border border-stone-700">
              <div 
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${gameState.stats.health}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-stone-300 font-semibold">{gameState.stats.health}</span>
          </div>

          {/* Energy */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div className="w-16 md:w-20 bg-stone-800 rounded-full h-2.5 overflow-hidden border border-stone-700">
              <div 
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${gameState.stats.energy}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-stone-300 font-semibold">{gameState.stats.energy}</span>
          </div>

          {/* Hydration */}
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-sky-400 fill-sky-400" />
            <div className="w-16 md:w-20 bg-stone-800 rounded-full h-2.5 overflow-hidden border border-stone-700">
              <div 
                className="bg-sky-400 h-full transition-all duration-300"
                style={{ width: `${gameState.stats.hydration}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-stone-300 font-semibold">{gameState.stats.hydration}</span>
          </div>

          {/* Hunger */}
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-orange-400" />
            <div className="w-16 md:w-20 bg-stone-800 rounded-full h-2.5 overflow-hidden border border-stone-700">
              <div 
                className="bg-orange-400 h-full transition-all duration-300"
                style={{ width: `${gameState.stats.hunger}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-stone-300 font-semibold">{gameState.stats.hunger}</span>
          </div>

          {/* Core Body Temp */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <Thermometer className={`w-4 h-4 ${isHypothermic ? 'text-cyan-400 animate-pulse' : isHyperthermic ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`} />
            <span className={isHypothermic ? 'text-cyan-300 font-bold' : 'text-stone-200'}>
              {gameState.stats.bodyTempC.toFixed(1)}°C
            </span>
          </div>

          {/* Wetness alert */}
          {gameState.stats.clothingWetness > 10 && (
            <div className="flex items-center gap-1 text-[11px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              <Droplet className="w-3 h-3 text-cyan-400 animate-bounce" />
              <span>{Math.round(gameState.stats.clothingWetness)}% {lang === 'tr' ? 'Islak' : 'Wet'}</span>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700/80 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1 md:gap-2">
          {/* Backpack */}
          <button
            onClick={() => onOpenModal('backpack')}
            className={`flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all ${isOverburdened ? 'bg-rose-900/50 border border-rose-500 text-rose-300' : 'hover:bg-stone-800 text-stone-200 active:scale-95'}`}
            title="Backpack & Gear"
          >
            <Backpack className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-mono mt-0.5">{totalWeightKg}kg</span>
          </button>

          {/* Topo Map & Compass */}
          <button
            onClick={() => onOpenModal('navigation')}
            className="flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl hover:bg-stone-800 text-stone-200 transition-all active:scale-95"
            title="Topographic Map & Compass"
          >
            <MapIcon className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-mono mt-0.5">{lang === 'tr' ? 'Harita' : 'Map'}</span>
          </button>

          {/* Campcraft & Fire */}
          <button
            onClick={() => onOpenModal('camp')}
            className="flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl hover:bg-stone-800 text-stone-200 transition-all active:scale-95"
            title="Camp & Firecraft"
          >
            <Tent className="w-5 h-5 text-orange-400" />
            <span className="text-[10px] font-mono mt-0.5">{lang === 'tr' ? 'Kamp' : 'Camp'}</span>
          </button>

          {/* First Aid */}
          <button
            onClick={() => onOpenModal('firstAid')}
            className="flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl hover:bg-stone-800 text-stone-200 transition-all active:scale-95"
            title="First Aid & Triage"
          >
            <Cross className="w-5 h-5 text-rose-400" />
            <span className="text-[10px] font-mono mt-0.5">{lang === 'tr' ? 'İlk Yardım' : 'Triage'}</span>
          </button>

          {/* Field Codex (Handbook) */}
          <button
            onClick={() => onOpenModal('codex')}
            className="flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl hover:bg-stone-800 text-stone-200 transition-all active:scale-95"
            title="Wilderness Field Codex"
          >
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span className="text-[10px] font-mono mt-0.5">{lang === 'tr' ? 'Rehber' : 'Codex'}</span>
          </button>

          {/* Rest / Sleep */}
          <button
            onClick={onRest}
            className="flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-200 transition-all active:scale-95"
            title="Rest 1 Hour to recover fatigue"
          >
            <Moon className="w-5 h-5 text-indigo-300" />
            <span className="text-[10px] font-mono mt-0.5">{lang === 'tr' ? 'Dinlen' : 'Rest'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
