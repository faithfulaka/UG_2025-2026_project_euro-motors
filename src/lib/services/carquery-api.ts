// src/lib/services/carquery-api.ts

const CARQUERY_BASE = 'https://www.carqueryapi.com/api/0.3/';

export async function fetchCarDataFromCarQuery(make: string, model: string, year: string) {
  const res = await fetch(
    `${CARQUERY_BASE}?cmd=getTrims&make=${make}&model=${model}&year=${year}&sold_in_us=1`
  );
  const data = await res.json();

  const trims = data?.Trims || [];

  interface CarTrim {
    make_display: string;
    model_name: string;
    model_year: string;
    price?: string;
    model_body?: string;
    model_engine_position?: string;
    model_engine_cc?: string;
    model_engine_type?: string;
  }

  const bestTrim = trims.find((t: CarTrim) => t.make_display && t.model_name && t.model_year);

  return {
    specs: {
      model_make_id: make,
      model_name: model,
      model_year: year,
      model_body: bestTrim?.model_body ?? null,
      model_engine_cc: bestTrim?.model_engine_cc ?? null,
      model_engine_type: bestTrim?.model_engine_type ?? null,
    },
    pricing: {
      baseMSRP: bestTrim?.price ? parseFloat(bestTrim.price) : null,
    },
    ownership: {},
    performance: {},
  };
}