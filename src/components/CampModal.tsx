import React, { useState } from 'react';
import { GameState } from '../game/simulation';
import { CRAFTING_RECIPES, Recipe } from '../data/recipes';
import { X, Tent, Flame, Coffee, Sparkles, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface CampModalProps {
  gameState: GameState;
  onCraftRecipe: (recipe: Recipe) => void;
  onLightFire: () => void;
  onAddFuel: () => void;
  onClose: () => void;
  lang: 'en' | 'tr';
}

export const CampModal: React.FC<CampModalProps> = ({
  gameState,
  onCraftRecipe,
  onLightFire,
  onAddFuel,
  onClose,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'shelter' | 'fire' | 'cooking'>('shelter');
  const [sparkProgress, setSparkProgress] = useState<number>(0);
  const [sparkMessage, setSparkMessage] = useState<string | null>(null);

  const camp = gameState.camp;
  const inv = gameState.inventory;

  // Striking sparks with ferro rod
  const handleStrikeSpark = () => {
    soundEngine.playSpark();
    const tinderItem = inv.fatwood_tinder || inv.pine_resin_lump;
    const bonus = tinderItem ? 35 : 15;
    const roll = Math.random() * 30 + bonus;
    const newProgress = Math.min(100, sparkProgress + roll);
    setSparkProgress(newProgress);

    if (newProgress >= 100) {
      onLightFire();
      setSparkMessage(lang === 'tr' ? '🔥 Kıvılcım kavı yakaladı! Ateş alevlendi.' : '🔥 Spark caught the tinder! Fire is roaring.');
      setSparkProgress(0);
    } else {
      setSparkMessage(lang === 'tr' ? `Kıvılcım çaktı! Kor tabakası: %${Math.round(newProgress)}` : `Sparks showered! Coal ember: ${Math.round(newProgress)}%`);
    }
  };

  const shelterRecipes = CRAFTING_RECIPES.filter((r) => r.category === 'camp');
  const cookingRecipes = CRAFTING_RECIPES.filter((r) => r.category === 'cooking');
  const fireRecipes = CRAFTING_RECIPES.filter((r) => r.category === 'fire');

  const checkRecipeItems = (recipe: Recipe) => {
    return recipe.requiredItems.every((req) => {
      const item = inv[req.itemId];
      return item && item.quantity >= req.count;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl h-[90vh] bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-200 font-sans">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-950/50 border border-orange-600/40 text-orange-400">
              <Tent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-100 tracking-wide">
                {lang === 'tr' ? 'Kamp Kurma & Ateş & Mutfak İstasyonu' : 'Campcraft, Firecraft & Camp Kitchen'}
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                {camp.established
                  ? (lang === 'tr' ? 'Kamp Yeri Kurulu • Güvenli Barınak' : 'Bivouac Established • Active Campsite')
                  : (lang === 'tr' ? 'Geçici Konaklama Seçimi' : 'Temporary Shelter Site')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-5 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('shelter')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'shelter' ? 'border-amber-500 text-amber-400 font-semibold' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
          >
            <Tent className="w-4 h-4" />
            {lang === 'tr' ? 'Barınak Kurulumu (Tarp)' : 'Shelter & Bivouac'}
          </button>
          <button
            onClick={() => setActiveTab('fire')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'fire' ? 'border-orange-500 text-orange-400 font-semibold' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
          >
            <Flame className="w-4 h-4" />
            {lang === 'tr' ? 'Ateş Yakma & Reflektör' : 'Firecraft & Embers'}
          </button>
          <button
            onClick={() => setActiveTab('cooking')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'cooking' ? 'border-emerald-500 text-emerald-400 font-semibold' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
          >
            <Coffee className="w-4 h-4" />
            {lang === 'tr' ? 'Mutfak & Su Kaynatma' : 'Camp Cooking & Water'}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-5 overflow-y-auto">
          {/* TAB 1: SHELTER */}
          {activeTab === 'shelter' && (
            <div className="space-y-5">
              {/* Active Shelter Status Card */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-stone-400">
                    {lang === 'tr' ? 'Mevcut Barınak Tipi:' : 'Current Shelter Status:'}
                  </span>
                  <h4 className="text-base font-bold text-amber-400 capitalize">
                    {camp.shelterType === 'none'
                      ? (lang === 'tr' ? 'Barınak Yok (Açık Arazi)' : 'No Shelter (Exposed Bivy)')
                      : camp.shelterType.replace(/_/g, ' ')}
                  </h4>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'tr' ? 'Rüzgar Kalkanı:' : 'Windbreak:'} {camp.windBreakBuilt ? 'EVET' : 'YOK'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>{lang === 'tr' ? 'Zemin Yalıtımı:' : 'Ground Mat:'} {camp.groundInsulationPlaced ? 'EVET' : 'YOK'}</span>
                  </div>
                </div>
              </div>

              {/* Pitchable Shelter Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shelterRecipes.map((recipe) => {
                  const hasItems = checkRecipeItems(recipe);
                  return (
                    <div
                      key={recipe.id}
                      className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-stone-200 mb-1">
                          {lang === 'tr' ? recipe.nameTr : recipe.name}
                        </h4>
                        <p className="text-xs text-stone-400 mb-3">
                          {lang === 'tr' ? recipe.descriptionTr : recipe.description}
                        </p>

                        <div className="space-y-1 mb-4">
                          <span className="text-[11px] font-mono text-stone-400">
                            {lang === 'tr' ? 'Gereken Ekipmanlar:' : 'Required Gear:'}
                          </span>
                          {recipe.requiredItems.map((req) => (
                            <div key={req.itemId} className="flex items-center justify-between text-xs font-mono">
                              <span className="text-stone-300">
                                {inv[req.itemId]?.nameTr || req.itemId}
                              </span>
                              <span className={inv[req.itemId] && inv[req.itemId].quantity >= req.count ? 'text-emerald-400' : 'text-rose-400'}>
                                {inv[req.itemId]?.quantity || 0} / {req.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => onCraftRecipe(recipe)}
                        disabled={!hasItems}
                        className={`w-full py-2.5 rounded-xl font-medium text-xs transition-all ${hasItems ? 'bg-amber-600 hover:bg-amber-500 text-white shadow active:scale-95' : 'bg-stone-800 text-stone-400 cursor-not-allowed'}`}
                      >
                        {lang === 'tr' ? 'Barınağı Kur' : 'Pitch Shelter'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FIRE */}
          {activeTab === 'fire' && (
            <div className="space-y-5">
              {/* Campfire Status */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-stone-400">
                    {lang === 'tr' ? 'Ateş Durumu:' : 'Campfire State:'}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Flame className={`w-5 h-5 ${camp.fireState.lit ? 'text-orange-500 animate-bounce' : 'text-stone-600'}`} />
                    <h4 className="text-base font-bold text-stone-100">
                      {camp.fireState.lit
                        ? (lang === 'tr' ? 'Canlı Alev & Sıcak Kor' : 'Active Flame & Glowing Embers')
                        : (lang === 'tr' ? 'Sönük Ocak' : 'Cold Hearth (Unlit)')}
                    </h4>
                  </div>
                </div>

                {camp.fireState.lit && (
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-amber-400 font-bold">
                      {lang === 'tr' ? 'Kalan Odun Süresi:' : 'Burn Time:'} {Math.round(camp.fireState.fuelLevelMinutes)} dk
                    </span>
                    <button
                      onClick={onAddFuel}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all active:scale-95"
                    >
                      {lang === 'tr' ? '+ Odun Besle' : '+ Feed Firewood'}
                    </button>
                  </div>
                )}
              </div>

              {/* Spark Striker Interactivity */}
              {!camp.fireState.lit && (
                <div className="p-5 rounded-2xl bg-stone-950 border border-orange-900/50 flex flex-col items-center text-center">
                  <Sparkles className="w-8 h-8 text-amber-500 mb-2 animate-pulse" />
                  <h3 className="font-bold text-sm text-amber-400 mb-1">
                    {lang === 'tr' ? 'Magnezyum & Çıra ile Ateş Başlatma' : 'Strike Ferrocerium Rod against Tinder'}
                  </h3>
                  <p className="text-xs text-stone-400 max-w-md mb-4">
                    {lang === 'tr'
                      ? 'Çıra ve reçineli kuru kav hazırlayın. Kıvılcım çubuğunu 45 derece açıyla kav üzerine sürterek alev oluşturun.'
                      : 'Prepare fatwood shavings and dry pine resin. Scrape the ferro rod at 45 degrees directly into the tinder nest.'}
                  </p>

                  {/* Coal Progress Bar */}
                  <div className="w-full max-w-sm h-3 bg-stone-800 rounded-full overflow-hidden border border-stone-700 mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-200"
                      style={{ width: `${sparkProgress}%` }}
                    />
                  </div>

                  {sparkMessage && (
                    <p className="text-xs font-mono text-amber-300 mb-3 animate-fade-in">
                      {sparkMessage}
                    </p>
                  )}

                  <button
                    onClick={handleStrikeSpark}
                    className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-xl border border-orange-400/40 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    {lang === 'tr' ? 'Kıvılcım Çak!' : 'Strike Spark!'}
                  </button>
                </div>
              )}

              {/* Reflector Wall Crafting */}
              <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-stone-200">
                    {lang === 'tr' ? 'Taş/Kütük Isı Yansıtıcı Duvar' : 'Stone/Log Fire Heat Reflector Wall'}
                  </h4>
                  <span className="text-xs font-mono text-emerald-400">
                    {camp.fireState.hasReflectorWall ? 'İNŞA EDİLDİ' : 'YOK'}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mb-3">
                  {lang === 'tr'
                    ? 'Ateşin arkasına örülen yansıtıcı duvar, barınak içine giren ısı radyasyonunu 2 katına çıkarır.'
                    : 'A reflector built behind the hearth bounces radiant heat back into the shelter mouth.'}
                </p>

                {!camp.fireState.hasReflectorWall && (
                  <button
                    onClick={() => {
                      const recipe = fireRecipes.find((r) => r.id === 'build_fire_reflector');
                      if (recipe) onCraftRecipe(recipe);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-all active:scale-95"
                  >
                    {lang === 'tr' ? 'Reflektör Duvar İnşa Et' : 'Build Reflector Wall'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COOKING */}
          {activeTab === 'cooking' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  {camp.fireState.lit
                    ? (lang === 'tr' ? 'Kamp ateşi hazır. Tencere doğrudan közün üzerine konabilir.' : 'Campfire is hot. Cook pot can be set directly over glowing coals.')
                    : (lang === 'tr' ? 'Dikkat: Su kaynatmak ve sıcak yemek pişirmek için önce ateşi yakmalısınız.' : 'Note: Fire must be lit before you can boil water or simmer meals.')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cookingRecipes.map((recipe) => {
                  const hasItems = checkRecipeItems(recipe);
                  const canCook = hasItems && (!recipe.requiresFire || camp.fireState.lit);

                  return (
                    <div
                      key={recipe.id}
                      className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-stone-200 mb-1">
                          {lang === 'tr' ? recipe.nameTr : recipe.name}
                        </h4>
                        <p className="text-xs text-stone-400 mb-3">
                          {lang === 'tr' ? recipe.descriptionTr : recipe.description}
                        </p>

                        <div className="space-y-1 mb-4">
                          <span className="text-[11px] font-mono text-stone-400">
                            {lang === 'tr' ? 'Gereken Malzemeler:' : 'Ingredients:'}
                          </span>
                          {recipe.requiredItems.map((req) => (
                            <div key={req.itemId} className="flex items-center justify-between text-xs font-mono">
                              <span className="text-stone-300">
                                {inv[req.itemId]?.nameTr || req.itemId}
                              </span>
                              <span className={inv[req.itemId] && inv[req.itemId].quantity >= req.count ? 'text-emerald-400' : 'text-rose-400'}>
                                {inv[req.itemId]?.quantity || 0} / {req.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => onCraftRecipe(recipe)}
                        disabled={!canCook}
                        className={`w-full py-2.5 rounded-xl font-medium text-xs transition-all ${canCook ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow active:scale-95' : 'bg-stone-800 text-stone-400 cursor-not-allowed'}`}
                      >
                        {lang === 'tr' ? 'Pişir / Kaynat' : 'Cook / Boil'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
