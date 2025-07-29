import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Type for the response
interface ModelsResponse {
  models: string[];
  sources: string[];
  errors?: string[];
  timestamp: string;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const sources: string[] = [];
  const errors: string[] = [];
  let allModels: string[] = [];

  if (!make) return NextResponse.json({ models: [] });

  // 1. CarQuery API
  try {
    const carQueryResp = await axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${encodeURIComponent(make)}`);
    const data = carQueryResp.data;
    interface CarQueryModel {
  model_name: string;
  [key: string]: unknown;
}


let models: string[] = [];
    if (typeof data === 'string') {
      const json = JSON.parse(data.replace(/^\?\((.*)\);?$/, '$1'));
      models = (json.Models as CarQueryModel[] || []).map((m) => m.model_name).filter(Boolean);
    } else if (data.Models) {
      models = (data.Models as CarQueryModel[]).map((m) => m.model_name).filter(Boolean);
    }
    if (models.length > 0) {
      allModels = allModels.concat(models);
      sources.push('CarQueryAPI');
    }
  } catch (err) {
    errors.push('CarQueryAPI: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 2. NHTSA API
  try {
    const nhtsaResp = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make)}?format=json`);
    // NHTSA API types
interface NHTSAModel {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}
const models = (nhtsaResp.data.Results as NHTSAModel[] || []).map((m) => m.Model_Name).filter(Boolean);
    if (models.length > 0) {
      allModels = allModels.concat(models);
      sources.push('NHTSA');
    }
  } catch (err) {
    errors.push('NHTSA: ' + (err instanceof Error ? err.message : String(err)));
  }

  // Deduplicate and sort
  allModels = Array.from(new Set(allModels.map(m => (m || '').trim()).filter(Boolean)));
  allModels.sort((a, b) => a.localeCompare(b));

  // If no models found, return error
  if (allModels.length === 0) {
    return NextResponse.json({
      models: [],
      sources,
      errors: errors.length ? errors : ['No models found from any API'],
      timestamp: new Date().toISOString()
    } as ModelsResponse, { status: 502 });
  }

  return NextResponse.json({
    models: allModels,
    sources,
    errors: errors.length ? errors : undefined,
    timestamp: new Date().toISOString()
  } as ModelsResponse);
}
