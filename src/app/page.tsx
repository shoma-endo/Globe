'use client';

import { useState } from 'react';
import AddressSearch from '@/components/AddressSearch';
import EarthScene from '@/components/EarthScene';

type GeocodeResult = {
  lat: number;
  lng: number;
  formatted: string;
};

export default function Home() {
  const [target, setTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);

  const handleResult = (result: GeocodeResult) => {
    setTarget({ lat: result.lat, lng: result.lng });
    setFormattedAddress(result.formatted);
  };

  const handleClear = () => {
    setTarget(null);
    setFormattedAddress(null);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <AddressSearch onResult={handleResult} />
      
      {formattedAddress && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-8 py-4 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-6 z-10">
          <div>
            <p className="text-xs font-light text-gray-400 uppercase tracking-wider">Selected Location</p>
            <p className="text-xl font-medium tracking-wide mt-1">{formattedAddress}</p>
            {target && (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Lat: {target.lat.toFixed(4)}, Lng: {target.lng.toFixed(4)}
              </p>
            )}
          </div>
          <button
            onClick={handleClear}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/5"
            aria-label="Clear selection"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <EarthScene target={target} />
    </main>
  );
}
