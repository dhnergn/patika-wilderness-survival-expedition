import React, { useState } from 'react';
import { Item, ItemCategory } from '../types';
import { X, Backpack, Shield, Droplet, Flame, Utensils, Heart, AlertTriangle } from 'lucide-react';
import { calculateBackpackWeight } from '../game/simulation';
import { soundEngine } from '../utils/audio';

interface BackpackModalProps {
  inventory: Record<string, Item>;
  onEquipItem: (itemId: string) => void;
  onUseItem: (itemId: string) => void;
  onDropItem: (itemId: string) => void;
  onClose: () => void;
  lang: 'en' | 'tr';
}

export const BackpackModal: React.FC<BackpackModalProps> = ({
  inventory,
  onEquipItem,
  onUseItem,
  onDropItem,
  onClose,
  lang
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  const { totalWeightKg, totalVolumeL, isOverburdened } = calculateBackpackWeight(inventory);
  const maxWeightKg = 18.0;
  const maxVolumeL = 50.0;

  const categories: { id: ItemCategory | 'all'; name: string; nameTr: string }[] = [
    { id: 'all', name: 'All Gear', nameTr: 'Tüm Malzemeler' },
    { id: 'clothing', name: 'Clothing', nameTr: 'Giyim & Katmanlar' },
    { id: 'shelter', name: 'Shelter', nameTr: 'Barınak & Uyku' },
    { id: 'water', name: 'Water', nameTr: 'Su & Arıtma' },
    { id: 'food', name: 'Food', nameTr: 'Beslenme & Azık' },
    { id: 'fire', name: 'Firecraft', nameTr: 'Ateş Başlatıcılar' },
    { id: 'tool', name: 'Tools', nameTr: 'Alet & Bıçak' },
    { id: 'first_aid', name: 'First Aid', nameTr: 'İlk Yardım' }
  ];

  const filteredItems = Object.values(inventory).filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl h-[90vh] bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-200 font-sans">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${isOverburdened ? 'bg-rose-950/50 border-rose-600/50 text-rose-400' : 'bg-amber-950/50 border-amber-600/40 text-amber-500'}`}>
              <Backpack className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-100 tracking-wide">
                {lang === 'tr' ? '50L Sefer Çantası & Ekipman Düzeni' : '50L Expedition Backpack & Gear Organization'}
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                {lang === 'tr' ? 'Ağırlık Dağılımı ve Hacim Dengesi' : 'Weight Center-of-Gravity & Volume Load'}
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

        {/* Load Status Banner: Weight & Volume Gauges */}
        <div className="px-5 py-3 bg-stone-950/60 border-b border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weight */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-stone-400">
                {lang === 'tr' ? 'Toplam Ağırlık:' : 'Pack Load:'}
              </span>
              <span className={`font-mono font-bold ${isOverburdened ? 'text-rose-400' : 'text-amber-400'}`}>
                {totalWeightKg} kg / {maxWeightKg} kg
              </span>
            </div>
            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
              <div
                className={`h-full transition-all duration-300 ${isOverburdened ? 'bg-rose-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (totalWeightKg / maxWeightKg) * 100)}%` }}
              />
            </div>
            {isOverburdened && (
              <p className="flex items-center gap-1 text-[11px] text-rose-400 font-mono mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lang === 'tr' ? 'Aşırı Yük! Enerji tüketimi %60 artar, bilek burkulma riski yükselir.' : 'Overburdened! Energy drains 60% faster with elevated sprain hazard.'}
              </p>
            )}
          </div>

          {/* Volume */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-stone-400">
                {lang === 'tr' ? 'Doluluk Hacmi:' : 'Internal Volume:'}
              </span>
              <span className="font-mono font-bold text-sky-400">
                {totalVolumeL} L / {maxVolumeL} L
              </span>
            </div>
            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (totalVolumeL / maxVolumeL) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400 font-mono mt-1">
              {lang === 'tr' ? 'Ağır malzemeleri omurgaya yakın ve sırtın ortasına yerleştirin.' : 'Pack heavy items close to your spine at shoulder blade level.'}
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-stone-900 border-b border-stone-800 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-amber-600 text-white font-semibold shadow' : 'bg-stone-800/80 hover:bg-stone-800 text-stone-300'}`}
            >
              {lang === 'tr' ? cat.nameTr : cat.name}
            </button>
          ))}
        </div>

        {/* Item Grid & Detail Inspector */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Left 2 Cols: Item Grid */}
          <div className="md:col-span-2 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const isSelected = activeItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${isSelected ? 'bg-stone-800 border-amber-500 ring-2 ring-amber-500/30 shadow-lg' : 'bg-stone-950/70 hover:bg-stone-800/60 border-stone-800'}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs text-stone-100 line-clamp-1">
                        {lang === 'tr' ? item.nameTr : item.name}
                      </span>
                      {item.equipped && (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-mono">
                          {lang === 'tr' ? 'GİYİLİ' : 'WORN'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2">
                      {lang === 'tr' ? item.descriptionTr : item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 pt-2 border-t border-stone-850 mt-2">
                    <span>{item.weightKg} kg</span>
                    <span>x{item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Col: Item Inspection & Action Panel */}
          <div className="bg-stone-950 p-5 border-t md:border-t-0 md:border-l border-stone-800 flex flex-col justify-between overflow-y-auto">
            {activeItem ? (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <h3 className="font-bold text-sm text-amber-400">
                    {lang === 'tr' ? activeItem.nameTr : activeItem.name}
                  </h3>
                  <span className="text-[11px] font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                    {activeItem.category.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-stone-300 my-3 leading-relaxed">
                  {lang === 'tr' ? activeItem.descriptionTr : activeItem.description}
                </p>

                {/* Item Stats Breakdown */}
                <div className="space-y-2 bg-stone-900/80 p-3 rounded-xl border border-stone-850 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">{lang === 'tr' ? 'Ağırlık:' : 'Unit Weight:'}</span>
                    <span className="text-stone-200">{activeItem.weightKg} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">{lang === 'tr' ? 'Hacim:' : 'Volume:'}</span>
                    <span className="text-stone-200">{activeItem.volumeL} L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">{lang === 'tr' ? 'Dayanıklılık:' : 'Durability:'}</span>
                    <span className="text-emerald-400">{activeItem.durability}%</span>
                  </div>

                  {activeItem.insulationValue && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">{lang === 'tr' ? 'Isı Yalıtımı:' : 'Insulation Trapping:'}</span>
                      <span className="text-orange-400">+{Math.round(activeItem.insulationValue * 100)}%</span>
                    </div>
                  )}

                  {activeItem.calories && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">{lang === 'tr' ? 'Enerji Değeri:' : 'Caloric Value:'}</span>
                      <span className="text-amber-400">+{activeItem.calories} kcal</span>
                    </div>
                  )}

                  {activeItem.hydrationMl && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">{lang === 'tr' ? 'Su Miktarı:' : 'Hydration:'}</span>
                      <span className="text-sky-400">{activeItem.hydrationMl} ml</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-5 space-y-2">
                  {activeItem.clothingSlot && (
                    <button
                      onClick={() => onEquipItem(activeItem.id)}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow transition-all active:scale-95"
                    >
                      {activeItem.equipped
                        ? (lang === 'tr' ? 'Çantaya Kaldır (Çıkar)' : 'Unequip into Pack')
                        : (lang === 'tr' ? 'Üstüne Giy (Katman Ekle)' : 'Wear / Equip Layer')}
                    </button>
                  )}

                  {(activeItem.category === 'food' || activeItem.category === 'water') && (
                    <button
                      onClick={() => onUseItem(activeItem.id)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow transition-all active:scale-95"
                    >
                      {activeItem.category === 'water'
                        ? (lang === 'tr' ? 'Mataradan Su İç' : 'Drink Water')
                        : (lang === 'tr' ? 'Azığı Tüket (Ye)' : 'Eat Ration')}
                    </button>
                  )}

                  <button
                    onClick={() => onDropItem(activeItem.id)}
                    className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-rose-400 border border-stone-800 text-xs font-mono transition-all"
                  >
                    {lang === 'tr' ? 'Yere Bırak (Yük Azalt)' : 'Drop Item (Reduce Weight)'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-stone-400">
                <Backpack className="w-10 h-10 text-stone-700 mb-2" />
                <p className="text-xs">
                  {lang === 'tr' ? 'İncelemek veya kullanmak için bir eşya seçin.' : 'Select an item from your pack to inspect or use.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
