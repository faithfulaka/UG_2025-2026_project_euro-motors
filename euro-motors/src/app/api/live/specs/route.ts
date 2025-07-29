import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// --- Types ---
export interface CarSpec {
  make: string;
  model: string;
  year?: string;
  trim?: string;
  body?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
  horsepower?: string;
  torque?: string;
  zeroToSixty?: string;
  topSpeed?: string;
  msrp?: string;
  weight?: string;
  mpgCity?: string;
  mpgHighway?: string;
  [key: string]: unknown; // for extra fields
}

interface SpecsResponse {
  specs: CarSpec[];
  sources: string[];
  errors?: string[];
  timestamp: string;
}

// --- Handler ---
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';
  const year = url.searchParams.get('year') || '';
  const sources: string[] = [];
  const errors: string[] = [];
  let allSpecs: CarSpec[] = [];

  if (!make || !model) {
    return NextResponse.json({ specs: [], sources, errors: ['Missing make or model'], timestamp: new Date().toISOString() }, { status: 400 });
  }

  // 1. CarQuery API (getTrims)
  try {
    const carQueryResp = await axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${year ? `&year=${encodeURIComponent(year)}` : ''}`);
    const data = carQueryResp.data;
    interface CarQueryTrim {
  make: string;
  make_display: string;
  model_name: string;
  year: number;
  model_trim?: string;
  model_body?: string;
  model_engine_l?: string;
  model_engine_cc?: string;
  model_engine_type?: string;
  model_transmission_type?: string;
  model_drive?: string;
  model_engine_fuel?: string;
  model_engine_power_ps?: string;
  model_engine_torque_nm?: string;
  model_0_to_100_kph?: string;
  model_top_speed_kph?: string;
  model_msrp?: string;
  model_weight_kg?: string;
  model_lkm_city?: string;
  model_lkm_hwy?: string;
  [key: string]: unknown;
}

let trims: CarQueryTrim[] = [];
    if (typeof data === 'string') {
      const json = JSON.parse(data.replace(/^\?\((.*)\);?$/, '$1'));
      trims = json.Trims as CarQueryTrim[] || [];
    } else if (data.Trims) {
      trims = data.Trims as CarQueryTrim[];
    }
    if (trims.length > 0) {
      allSpecs = allSpecs.concat(trims.map(trim => ({
        make: trim.make_display || trim.make,
        model: String(trim.model_name || trim.model),
        year: trim.year ? String(trim.year) : undefined,
        trim: trim.model_trim,
        body: trim.model_body,
        engine: trim.model_engine_l || trim.model_engine_cc ? `${trim.model_engine_l || ''}L ${trim.model_engine_type || ''}`.trim() : undefined,
        transmission: trim.model_transmission_type,
        drivetrain: trim.model_drive,
        fuelType: trim.model_engine_fuel,
        horsepower: trim.model_engine_power_ps ? `${trim.model_engine_power_ps} PS` : undefined,
        torque: trim.model_engine_torque_nm ? `${trim.model_engine_torque_nm} Nm` : undefined,
        zeroToSixty: trim.model_0_to_100_kph ? `${trim.model_0_to_100_kph} sec` : undefined,
        topSpeed: trim.model_top_speed_kph ? `${trim.model_top_speed_kph} kph` : undefined,
        msrp: trim.model_msrp ? `$${trim.model_msrp}` : undefined,
        weight: trim.model_weight_kg ? `${trim.model_weight_kg} kg` : undefined,
        mpgCity: trim.model_lkm_city ? `${trim.model_lkm_city} l/100km` : undefined,
        mpgHighway: trim.model_lkm_hwy ? `${trim.model_lkm_hwy} l/100km` : undefined,
      })));
      sources.push('CarQueryAPI');
    }
  } catch (err) {
    errors.push('CarQueryAPI: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 2. NHTSA API (Get vehicle details by make/model/year)
  if (year) {
    try {
      const nhtsaResp = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${encodeURIComponent(year)}?format=json`);
      // NHTSA API types
interface NHTSAModelYear {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}
const nhtsaModels = (nhtsaResp.data.Results as NHTSAModelYear[] || []).filter((m) => m.Model_Name.toLowerCase() === model.toLowerCase());
      for (const nhtsaModel of nhtsaModels) {
        // NHTSA Vehicle Details (using Model_ID)
        if (nhtsaModel.Model_ID) {
          try {
            const detailsResp = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeModel/${encodeURIComponent(make)}/${encodeURIComponent(model)}?format=json`);
            const details = detailsResp.data.Results || [];
            // NHTSA Vehicle Type
interface NHTSAVehicleType {
  VehicleTypeId: number;
  VehicleTypeName: string;
}
details.forEach((det: NHTSAVehicleType) => {
              allSpecs.push({
                make,
                model,
                year,
                body: det.VehicleTypeName,
                // NHTSA does not provide engine/specs, but we include body type
              });
            });
            sources.push('NHTSA');
          } catch (err) {
            errors.push('NHTSA details: ' + (err instanceof Error ? err.message : String(err)));
          }
        }
      }
    } catch (err) {
      errors.push('NHTSA: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  // 3. Wikipedia/Wikidata API (optional enrichment, not blocking)
  // TODO: Implement optional enrichment for additional specs if needed

  // Deduplicate by make/model/year/trim/body
  const seen = new Set<string>();
  allSpecs = allSpecs.filter(spec => {
    const key = `${spec.make}|${spec.model}|${spec.year || ''}|${spec.trim || ''}|${spec.body || ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (allSpecs.length === 0) {
    return NextResponse.json({ specs: [], sources, errors: errors.length ? errors : ['No specs found from any API'], timestamp: new Date().toISOString() }, { status: 502 });
  }

  return NextResponse.json({
    specs: allSpecs,
    sources,
    errors: errors.length ? errors : undefined,
    timestamp: new Date().toISOString(),
  } as SpecsResponse);
}
