import React, { useState } from 'react';
import { GameState } from '../game/simulation';
import { WildernessMap } from '../game/proceduralWorld';
import { Landmark } from '../types';
import { X, Compass, Mountain, MapPin, Eye, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface NavigationModalProps {
  gameState: GameState;
  mapData: WildernessMap;
  onClose: () => void;
  lang: 'en' | 'tr';
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  gameState,
  mapData,
  onClose,
  lang
}) => {
  const [bezelAngle, setBezelAngle] = useState<number>(45);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [navDifficulty, setNavDifficulty] = useState<'explorer' | 'mountaineer'>('explorer');
  const [showContours, setShowContours] = useState<boolean>(true);

  // Rotate compass bezel ring
  const handleRotateBezel = (delta: number) => {
    soundEngine.playCompassClick();
    setBezelAngle((prev) => (prev + delta + 360) % 360);
  };

  // Align needle to orienting arrow ("Red in the Bed")
  const handleAlignNeedle = () => {
    soundEngine.playCompassClick();
    setBezelAngle(gameState.playerHeadingDeg);
  };

  // Calculate bearing from player to selected landmark
  const getBearingToLandmark = (landmark: Landmark) => {
    const dx = landmark.x - gameState.playerPos.x;
    const dy = landmark.y - gameState.playerPos.y;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return Math.round(deg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl h-[92vh] bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-600/40 text-amber-500">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-amber-400 tracking-wide">
                {lang === 'tr' ? 'Topografik Saha Haritası & Açılı Pusula' : 'Topographic Field Map & Sighting Compass'}
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                {lang === 'tr' ? '1:25.000 Ölçekli Eşyükselti Eğrili Askeri Harita' : '1:25,000 Scale Contour Navigation Quadrangle'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Difficulty Toggle */}
            <div className="flex bg-stone-800 rounded-lg p-0.5 border border-stone-700 text-xs">
              <button
                onClick={() => setNavDifficulty('explorer')}
                className={`px-3 py-1 rounded-md transition-all ${navDifficulty === 'explorer' ? 'bg-amber-600 text-white font-semibold' : 'text-stone-400 hover:text-stone-200'}`}
              >
                {lang === 'tr' ? 'Yardımlı GPS' : 'Explorer (GPS)'}
              </button>
              <button
                onClick={() => setNavDifficulty('mountaineer')}
                className={`px-3 py-1 rounded-md transition-all ${navDifficulty === 'mountaineer' ? 'bg-amber-600 text-white font-semibold' : 'text-stone-400 hover:text-stone-200'}`}
              >
                {lang === 'tr' ? 'Klasik Dağcı' : 'Mountaineer (Real)'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Map view on left, Compass and Resection instrumentation on right */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Left 2 Cols: Topographic Map Canvas Display */}
          <div className="lg:col-span-2 relative bg-[#1c221a] overflow-auto flex items-center justify-center p-4 select-none">
            {/* Map Sheet with Contours & Landmarks */}
            <div className="relative w-[640px] h-[640px] bg-[#232b21] border-2 border-[#827717]/40 shadow-inner rounded-lg overflow-hidden">
              {/* Grid Lines (Easting & Northing) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <defs>
                  <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#d4af37" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Render Landmarks on Map */}
              {mapData.landmarks.map((lm) => {
                const mapPosX = (lm.x / mapData.width) * 640;
                const mapPosY = (lm.y / mapData.height) * 640;
                const isSelected = selectedLandmark?.id === lm.id;

                return (
                  <div
                    key={lm.id}
                    onClick={() => {
                      soundEngine.playCompassClick();
                      setSelectedLandmark(lm);
                      setBezelAngle(getBearingToLandmark(lm));
                    }}
                    style={{ left: `${mapPosX}px`, top: `${mapPosY}px` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center group z-10 transition-all ${isSelected ? 'scale-125 z-20' : 'hover:scale-110'}`}
                  >
                    <div className={`p-1 rounded-full border ${isSelected ? 'bg-amber-500 border-white text-stone-900 shadow-lg ring-4 ring-amber-500/30' : 'bg-stone-900/90 border-amber-600/70 text-amber-400'}`}>
                      <Mountain className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-950/80 border border-stone-700 text-stone-200 mt-1 whitespace-nowrap">
                      {lang === 'tr' ? lm.nameTr : lm.name} ({lm.elevationM}m)
                    </span>
                  </div>
                );
              })}

              {/* Sight Line from Player to Selected Landmark */}
              {selectedLandmark && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                  <line
                    x1={(gameState.playerPos.x / mapData.width) * 640}
                    y1={(gameState.playerPos.y / mapData.height) * 640}
                    x2={(selectedLandmark.x / mapData.width) * 640}
                    y2={(selectedLandmark.y / mapData.height) * 640}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              )}

              {/* Player Position Marker (Visible in Explorer mode or approximate in Mountaineer mode) */}
              {navDifficulty === 'explorer' && (
                <div
                  style={{
                    left: `${(gameState.playerPos.x / mapData.width) * 640}px`,
                    top: `${(gameState.playerPos.y / mapData.height) * 640}px`
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center"
                >
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg animate-pulse" />
                    {/* Heading pointer line */}
                    <div
                      style={{ transform: `rotate(${gameState.playerHeadingDeg}deg)` }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-0.5 h-6 bg-emerald-400 origin-bottom"
                    />
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-950/90 text-emerald-300 px-1 rounded border border-emerald-700 mt-1">
                    {lang === 'tr' ? 'KONUMUNUZ' : 'YOU ARE HERE'}
                  </span>
                </div>
              )}

              {navDifficulty === 'mountaineer' && (
                <div className="absolute top-3 left-3 bg-stone-900/90 border border-amber-600/50 rounded-lg p-2.5 max-w-xs text-xs text-amber-200/90 font-mono shadow-xl backdrop-blur-sm pointer-events-none">
                  <p className="font-semibold text-amber-400 mb-1">
                    {lang === 'tr' ? '🧭 Klasik Kerteriz Modu:' : '🧭 Pure Orienteering Mode:'}
                  </p>
                  <p>
                    {lang === 'tr'
                      ? 'GPS kapalı. İki belirgin tepeye açı alarak (resection/kestirme) haritadaki kesişimden konumunu saptamalısın.'
                      : 'GPS disabled. Sight bearings to two known summits to triangulate your intersection point.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Interactive Orienteering Compass & Bearing Tool */}
          <div className="bg-stone-950 p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-800 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-stone-200 uppercase tracking-wider">
                  {lang === 'tr' ? 'Silva Taban Plakalı Pusula' : 'Silva Sighting Compass'}
                </h3>
                <span className="text-xs font-mono text-amber-400 bg-amber-950/50 border border-amber-800 px-2 py-0.5 rounded">
                  Azimuth: {bezelAngle}°
                </span>
              </div>

              {/* Realistic Compass Visualizer */}
              <div className="relative w-48 h-48 mx-auto my-3 flex items-center justify-center">
                {/* Rotating Dial Bezel */}
                <div
                  style={{ transform: `rotate(${-bezelAngle}deg)` }}
                  className="absolute inset-0 rounded-full border-4 border-amber-600/70 bg-stone-900/90 shadow-2xl flex items-center justify-center transition-transform duration-200"
                >
                  {/* Cardinal points on bezel */}
                  <span className="absolute top-2 font-mono font-bold text-xs text-rose-500">N (0°)</span>
                  <span className="absolute right-3 font-mono font-bold text-xs text-stone-300">E (90°)</span>
                  <span className="absolute bottom-2 font-mono font-bold text-xs text-stone-300">S (180°)</span>
                  <span className="absolute left-3 font-mono font-bold text-xs text-stone-300">W (270°)</span>
                  {/* Degree tick markings */}
                  <div className="w-36 h-36 rounded-full border border-stone-700/50" />
                </div>

                {/* Magnetic Needle (Always points to Magnetic North!) */}
                <div
                  style={{ transform: `rotate(${0}deg)` }}
                  className="absolute w-2 h-36 flex flex-col pointer-events-none transition-transform duration-300"
                >
                  {/* Red North Needle */}
                  <div className="w-full h-1/2 bg-rose-600 rounded-t-full shadow-md" />
                  {/* White South Needle */}
                  <div className="w-full h-1/2 bg-stone-200 rounded-b-full shadow-md" />
                  {/* Pivot center brass screw */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 border border-stone-900 shadow" />
                </div>
              </div>

              {/* Bezel Rotation Controls */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => handleRotateBezel(-10)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-bold transition-all active:scale-95"
                >
                  -10°
                </button>
                <button
                  onClick={() => handleRotateBezel(-1)}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-bold transition-all active:scale-95"
                >
                  -1°
                </button>
                <button
                  onClick={handleAlignNeedle}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
                >
                  {lang === 'tr' ? 'İğneyi Sıfırla' : 'Align "Red in Bed"'}
                </button>
                <button
                  onClick={() => handleRotateBezel(1)}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-bold transition-all active:scale-95"
                >
                  +1°
                </button>
                <button
                  onClick={() => handleRotateBezel(10)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-bold transition-all active:scale-95"
                >
                  +10°
                </button>
              </div>

              {/* Selected Landmark Details & Sighting Azimuth */}
              {selectedLandmark && (
                <div className="mt-5 p-3.5 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">
                      {lang === 'tr' ? selectedLandmark.nameTr : selectedLandmark.name}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      {selectedLandmark.elevationM}m
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 mb-2">
                    {selectedLandmark.description}
                  </p>
                  <div className="flex items-center justify-between text-xs bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-850">
                    <span className="text-stone-400">{lang === 'tr' ? 'Gereken Açı (Kerteriz):' : 'Sighted Azimuth:'}</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {getBearingToLandmark(selectedLandmark)}°
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Educational Navigation Rule Footnote */}
            <div className="mt-4 pt-3 border-t border-stone-800/80 text-[11px] text-stone-400">
              <p className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">💡</span>
                <span>
                  {lang === 'tr'
                    ? 'Pusulayı çakı, telefon veya metal fermuarlardan en az 30 cm uzakta tutun; manyetik sapma iğneyi şaşırtır.'
                    : 'Keep the compass at least 30cm away from metal knives and phones to avoid local magnetic deflection.'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
