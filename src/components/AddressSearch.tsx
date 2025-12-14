'use client';

import { useState } from 'react';
import axios from 'axios';

type GeocodeResult = {
  lat: number;
  lng: number;
  formatted: string;
};

type Props = {
  onResult: (result: GeocodeResult) => void;
};

export default function AddressSearch({ onResult }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get('/api/geocode', {
        params: { q: query },
      });
      onResult(res.data);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || '検索に失敗しました');
      } else {
        setError('予期せぬエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl w-80">
      <h1 className="text-xl font-bold mb-4 text-white tracking-wide">地球儀エクスプローラー</h1>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="住所を入力..."
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg disabled:bg-blue-400/50 transition-all font-medium backdrop-blur-sm"
        >
          {loading ? '...' : '検索'}
        </button>
      </form>
      {error && <p className="mt-3 text-red-400 text-sm font-light">{error}</p>}
      <p className="mt-3 text-xs text-gray-400 font-light">
        例: "東京駅", "エッフェル塔", "ニューヨーク"
      </p>
    </div>
  );
}
