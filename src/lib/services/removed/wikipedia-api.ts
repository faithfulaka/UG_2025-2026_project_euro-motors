// src/lib/services/wikipedia-api.ts
export default async function getWikipediaSummary(make: string, model: string) {
  const query = `${make} ${model}`;
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data?.type === 'standard') {
      return {
        summary: data.extract,
        image: data.thumbnail?.source || null,
      };
    }

    return { summary: '', image: '' };
  } catch (err) {
    console.error('[Wikipedia API ERROR]', err);
    return { summary: '', image: '' };
  }
}