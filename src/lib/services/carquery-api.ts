// src/lib/services/carquery-api.ts
import type { CarQueryMake, CarQueryModel, CarQueryTrim } from '@/types/spa';

const CARQUERY_BASE = process.env.CARQUERY_BASE_URL || 'https://www.carqueryapi.com/api/0.3/';

async function stripJSONP(text: string): Promise<string> {
  let jsonStr = text.trim();
  if (jsonStr.startsWith('?(')) jsonStr = jsonStr.slice(2);
  if (jsonStr.endsWith(');')) jsonStr = jsonStr.slice(0, -2);
  else if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
  }
  return jsonStr;
}

/** Fetch all makes */
export async function getMakes(): Promise<string[]> {
  const resp = await fetch(`${CARQUERY_BASE}?callback=?&cmd=getMakes`);
  const text = await resp.text();
  const jsonStr = await stripJSONP(text);
  const parsed = JSON.parse(jsonStr) as { Makes: CarQueryMake[] };
  return Array.isArray(parsed.Makes)
    ? parsed.Makes.map(m => m.make_display)
    : [];
}

/** Fetch all models for a given make */
export async function getModels(make: string): Promise<string[]> {
  const resp = await fetch(
    `${CARQUERY_BASE}?callback=?&cmd=getModels&make=${encodeURIComponent(make)}`
  );
  const text = await resp.text();
  const jsonStr = await stripJSONP(text);
  const parsed = JSON.parse(jsonStr) as { Models: CarQueryModel[] };
  return Array.isArray(parsed.Models)
    ? parsed.Models.map(m => m.model_name)
    : [];
}

/** Fetch all years for a given make/model by pulling trims and extracting years */
export async function getYears(make: string, model: string): Promise<number[]> {
  // Use the getTrims endpoint, then pull model_year from each trim
  const resp = await fetch(
    `${CARQUERY_BASE}?callback=?&cmd=getTrims&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`
  );
  const text = await resp.text();
  const jsonStr = await stripJSONP(text);
  const parsed = JSON.parse(jsonStr) as { Trims: CarQueryTrim[] };
  if (!Array.isArray(parsed.Trims)) return [];
  // Extract unique numeric years
  const yearsSet = new Set<number>();
  parsed.Trims.forEach(trim => {
    const y = Number(trim.model_year);
    if (!isNaN(y)) yearsSet.add(y);
  });
  // Return sorted descending
  return Array.from(yearsSet).sort((a, b) => b - a);
}

/** Fetch detailed car trim data for a given make/model/year */
export async function getCarData(
  make: string,
  model: string,
  year: string | number
): Promise<CarQueryTrim[]> {
  const resp = await fetch(
    `${CARQUERY_BASE}?callback=?&cmd=getTrims&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(String(year))}`
  );
  const text = await resp.text();
  const jsonStr = await stripJSONP(text);
  const parsed = JSON.parse(jsonStr) as { Trims: CarQueryTrim[] };
  return Array.isArray(parsed.Trims) ? parsed.Trims : [];
}