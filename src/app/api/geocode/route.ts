import { NextResponse } from 'next/server';
import axios from 'axios';

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
const OPENCAGE_URL = 'https://api.opencagedata.com/geocode/v1/json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }

  if (!OPENCAGE_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
  }

  try {
    console.log(`[API] Searching for: ${q}`);
    let response = await axios.get(OPENCAGE_URL, {
      params: {
        q,
        key: OPENCAGE_API_KEY,
        language: 'ja',
        limit: 1,
      },
    });

    let data = response.data;
    console.log(`[API] First attempt results: ${data.results?.length}`);

    // Retry with "Japan" if no results and query doesn't already contain it
    if ((!data.results || data.results.length === 0) && !q.includes('日本') && !q.includes('Japan')) {
      console.log(`[API] Retrying with "Japan" suffix...`);
      response = await axios.get(OPENCAGE_URL, {
        params: {
          q: `${q} 日本`,
          key: OPENCAGE_API_KEY,
          language: 'ja',
          limit: 1,
        },
      });
      data = response.data;
      console.log(`[API] Second attempt results: ${data.results?.length}`);
    }

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return NextResponse.json({
        lat: result.geometry.lat,
        lng: result.geometry.lng,
        formatted: result.formatted,
      });
    } else {
      console.log('[API] No results in data after retry');
      return NextResponse.json({ error: '検索結果が見つかりませんでした。住所をより詳しく入力してみてください。' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('OpenCage API Error:', error.message);
    if (error.response) {
        console.error('OpenCage Error Data:', JSON.stringify(error.response.data));
    }
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
