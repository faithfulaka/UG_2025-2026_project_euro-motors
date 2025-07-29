import { NextResponse } from 'next/server';
import axios from 'axios';

// Type for the response
interface MakesResponse {
  makes: string[];
  sources: string[];
  errors?: string[];
  timestamp: string;
}

export async function GET() {
  const sources: string[] = [];
  const errors: string[] = [];
  let allMakes: string[] = [];

  // 1. CarQuery API
  try {
    const carQueryResp = await axios.get('https://www.carqueryapi.com/api/0.3/?cmd=getMakes');
    const data = carQueryResp.data;
    // CarQuery returns JSONP, so parse if needed
    interface CarQueryMake {
  make_id: string;
  make_display: string;
  make_is_common?: string;
  make_country?: string;
  make_name?: string;
}


let makes: string[] = [];
    if (typeof data === 'string') {
      // Remove JSONP wrapper
      const json = JSON.parse(data.replace(/^\?\((.*)\);?$/, '$1'));
      makes = (json.Makes as CarQueryMake[] || []).map((m) => m.make_display || m.make_name || '').filter(Boolean);
    } else if (data.Makes) {
      makes = (data.Makes as CarQueryMake[]).map((m) => m.make_display || m.make_name || '').filter(Boolean);
    }
    if (makes.length > 0) {
      allMakes = allMakes.concat(makes);
      sources.push('CarQueryAPI');
    }
  } catch (err) {
    errors.push('CarQueryAPI: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 2. NHTSA API
  try {
    const nhtsaResp = await axios.get('https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json');
    // NHTSA API types
interface NHTSAMake {
  Make_ID: number;
  Make_Name: string;
}
const makes = (nhtsaResp.data.Results as NHTSAMake[] || []).map((m) => m.Make_Name).filter(Boolean);
    if (makes.length > 0) {
      allMakes = allMakes.concat(makes);
      sources.push('NHTSA');
    }
  } catch (err) {
    errors.push('NHTSA: ' + (err instanceof Error ? err.message : String(err)));
  }

  // Deduplicate and sort
  allMakes = Array.from(new Set(allMakes.map(m => (m || '').trim()).filter(Boolean)));
  allMakes.sort((a, b) => a.localeCompare(b));

  // If no makes found, return error
  if (allMakes.length === 0) {
    return NextResponse.json({
      makes: [],
      sources,
      errors: errors.length ? errors : ['No makes found from any API'],
      timestamp: new Date().toISOString()
    } as MakesResponse, { status: 502 });
  }

  return NextResponse.json({
    makes: allMakes,
    sources,
    errors: errors.length ? errors : undefined,
    timestamp: new Date().toISOString()
  } as MakesResponse);

}
