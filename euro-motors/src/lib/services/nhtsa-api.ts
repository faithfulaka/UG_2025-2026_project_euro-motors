// src/lib/services/nhtsa-api.ts
import fetch from 'node-fetch';

export interface NHTSABaseMSRP {
  vehicleType: string;
  msrp: number;
}

export async function getBaseMSRP(make: string, model: string, year: number): Promise<NHTSABaseMSRP | null> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleVariableValuesList/vehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  // parse JSON for MSRP field (if available)
  interface NHTSAResult { VariableName: string; VehicleTypeName: string; Value: string; }
  const results: NHTSAResult[] = json.Results;
  const msrpEntry = results.find(r => r.VariableName === 'BaseMSRP');
  return msrpEntry
    ? { vehicleType: msrpEntry.VehicleTypeName, msrp: Number(msrpEntry.Value) }
    : null;
}