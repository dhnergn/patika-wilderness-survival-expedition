import React, { useState } from 'react';
import { GameState } from '../game/simulation';
import { ActiveInjury, Item } from '../types';
import { X, Cross, AlertCircle, CheckCircle, ShieldAlert, HeartPulse } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface FirstAidModalProps {
  gameState: GameState;
  onTreatInjury: (injuryId: string, itemId: string) => void;
  onClose: () => void;
  lang: 'en' | 'tr';
}

export const FirstAidModal: React.FC<FirstAidModalProps> = ({
  gameState,
  onTreatInjury,
  onClose,
  lang
}) => {
  const [selectedInjury, setSelectedInjury] = useState<ActiveInjury | null>(
    gameState.injuries[0] || null
  );

  const injuries = gameState.injuries;
  const inv = gameState.inventory;

  // Available medical supplies in pack
  const medicalSupplies = Object.values(inv).filter((i) => i.category === 'first_aid');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl h-[90vh] bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-200 font-sans">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-600/40 text-rose-500">
              <Cross className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-100 tracking-wide">
                {lang === 'tr' ? 'Doğada İlk Yardım & Tıbbi Triyaj' : 'Wilderness First Aid & Medical Triage'}
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                {lang === 'tr' ? 'Saha Yaralanma Değerlendirmesi ve Müdahale' : 'Field Trauma Diagnosis & Protocol Execution'}
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

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Left Col: Active Injuries List */}
          <div className="p-4 border-b md:border-b-0 md:border-r border-stone-800 overflow-y-auto">
            <h3 className="font-bold text-xs text-stone-400 uppercase tracking-wider mb-3">
              {lang === 'tr' ? 'Mevcut Sağlık Durumu' : 'Active Conditions'}
            </h3>

            {injuries.length === 0 ? (
              <div className="p-4 rounded-xl bg-stone-950 border border-emerald-900/40 text-center">
                <HeartPulse className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-emerald-300 font-medium">
                  {lang === 'tr' ? 'Ciddi yaralanma veya travma saptanmadı.' : 'No active traumatic injuries diagnosed.'}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  {lang === 'tr' ? 'Vücut bütünlüğü stabil. Yürüyüşe devam edebilirsiniz.' : 'Musculoskeletal integrity intact. Pacing is safe.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {injuries.map((inj) => (
                  <div
                    key={inj.id}
                    onClick={() => setSelectedInjury(inj)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedInjury?.id === inj.id ? 'bg-stone-800 border-rose-500 shadow' : 'bg-stone-950 border-stone-800 hover:bg-stone-850'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-stone-200 capitalize">
                        {inj.type.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${inj.treated ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400 animate-pulse'}`}>
                        {inj.treated ? (lang === 'tr' ? 'TEDAVİ EDİLDİ' : 'TREATED') : (lang === 'tr' ? 'MÜDAHALE BEKLİYOR' : 'UNTREATED')}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {lang === 'tr' ? 'Bölge:' : 'Limb:'} {inj.bodyPart} • {lang === 'tr' ? 'Ağrı:' : 'Pain:'} {inj.painLevel}/10
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Medical Kit Supplies Summary */}
            <div className="mt-6 pt-4 border-t border-stone-800">
              <h4 className="font-bold text-xs text-stone-400 uppercase tracking-wider mb-2">
                {lang === 'tr' ? 'Çantadaki Tıbbi Malzemeler' : 'First Aid Kit Inventory'}
              </h4>
              <div className="space-y-1.5">
                {medicalSupplies.map((med) => (
                  <div key={med.id} className="flex items-center justify-between text-xs bg-stone-950 px-2.5 py-1.5 rounded-lg border border-stone-850 font-mono">
                    <span className="text-stone-300">{lang === 'tr' ? med.nameTr : med.name}</span>
                    <span className="text-amber-400 font-bold">x{med.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 2 Cols: Injury Details & Educational Protocol Execution */}
          <div className="md:col-span-2 p-5 overflow-y-auto flex flex-col justify-between">
            {selectedInjury ? (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <h3 className="font-bold text-base text-rose-400 capitalize">
                      {selectedInjury.type.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-stone-400">
                    {selectedInjury.severity.toUpperCase()} SEVERITY
                  </span>
                </div>

                {/* Educational Protocol Card */}
                <div className="mt-4 p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    {lang === 'tr' ? '📚 Kanıtlanmış Saha Müdahale Protokolü (R.I.C.E.)' : '📚 Evidence-Based Wilderness Protocol (R.I.C.E.)'}
                  </h4>

                  {selectedInjury.type === 'sprained_ankle' && (
                    <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
                      <p>
                        <strong>1. Rest (Dinlenme):</strong> {lang === 'tr' ? 'Yürüyüşü durdurun. Ayak bileği üzerine ağırlık vermeyin.' : 'Cease walking immediately. Take all weight off the lateral ankle joint.'}
                      </p>
                      <p>
                        <strong>2. Ice/Cold (Soğuk):</strong> {lang === 'tr' ? 'Dağ deresinin soğuk suyunda 15 dakika bekletip ödemi sınırlandırın.' : 'Immerse in cold glacial stream water for 15 minutes to suppress internal swelling.'}
                      </p>
                      <p>
                        <strong>3. Compression (Sargı):</strong> {lang === 'tr' ? 'Elastik kompresyon bandajını 8 şeklinde sararak eklemi sabitleyin.' : 'Wrap firmly with an elastic crepe bandage in a figure-eight configuration.'}
                      </p>
                      <p>
                        <strong>4. Elevation (Yükseltme):</strong> {lang === 'tr' ? 'Çadırda yatarken ayağı sırt çantasının üstüne koyup kalp hizasından yukarıda tutun.' : 'Elevate the ankle on your backpack above heart level during rest.'}
                      </p>
                    </div>
                  )}

                  {selectedInjury.type === 'friction_blister' && (
                    <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
                      <p>
                        {lang === 'tr'
                          ? 'Su toplayan kabarcığı arazide patlatmayın; açık yara enfeksiyon riski doğurur. Bölgeyi temizleyin ve hidrokolid (moleskin) koruyucu bant yapıştırın.'
                          : 'Do not de-roof or puncture the blister in the field; intact skin prevents infection. Cleanse surrounding skin and apply a hydrocolloid moleskin patch.'}
                      </p>
                    </div>
                  )}

                  {selectedInjury.type === 'minor_laceration' && (
                    <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
                      <p>
                        {lang === 'tr'
                          ? 'Yarayı önce temiz kaynatılmış suyla yıkayın, povidon iyotlu antiseptik mendille dezenfekte edin ve steril gazlı bezle kapatın.'
                          : 'Irrigate thoroughly with clean boiled water, apply povidone-iodine swab to prevent anaerobic soil infection, and dress with sterile gauze.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Treatment Execution Buttons */}
                {!selectedInjury.treated && (
                  <div className="mt-5 space-y-2">
                    <h4 className="text-xs font-mono text-stone-400">
                      {lang === 'tr' ? 'Uygulanacak Tedavi Eşyası:' : 'Select Treatment Gear to Apply:'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {medicalSupplies.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            soundEngine.playBandageRustle();
                            onTreatInjury(selectedInjury.id, item.id);
                          }}
                          className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow flex items-center justify-between transition-all active:scale-95"
                        >
                          <span>{lang === 'tr' ? item.nameTr : item.name}</span>
                          <span className="font-mono text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded">
                            {lang === 'tr' ? 'Uygula' : 'Apply'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedInjury.treated && (
                  <div className="mt-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>
                      {lang === 'tr' ? 'Müdahale tamamlandı. Dinlenerek iyileşme sürecini hızlandırın.' : 'Protocol completed. Rest at camp to allow tissue healing.'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <Cross className="w-10 h-10 text-stone-700 mb-2" />
                <p className="text-xs">
                  {lang === 'tr' ? 'İncelemek için bir sağlık durumu seçin.' : 'Select an active condition to inspect protocol.'}
                </p>
              </div>
            )}

            {/* Medical Disclaimer */}
            <div className="mt-4 pt-3 border-t border-stone-800 text-[10px] text-stone-500">
              {lang === 'tr'
                ? 'ℹ️ Bu simülasyondaki ilk yardım ilkeleri genel dağcılık eğitim prensiplerine dayanmaktadır ve profesyonel tıbbi bakım yerine geçmez.'
                : 'ℹ️ The first-aid concepts in this simulation reflect standard outdoor education guidelines and do not substitute for professional medical care.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
