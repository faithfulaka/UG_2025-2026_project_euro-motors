// src/lib/spa-services/carquery-api.ts
interface CarQueryResponse {
  Years?: { min_year: string; max_year: string };
  Makes?: Array<{ make_id: string; make_display: string; make_is_common: string; make_country: string }>;
  Models?: Array<{ model_name: string; model_make_id: string }>;
  Trims?: Array<{
    model_id: string;
    model_make_id: string;
    model_name: string;
    model_trim: string;
    model_year: string;
    model_body: string;
    model_engine_position: string;
    model_engine_cc: string;
    model_engine_cyl: string;
    model_engine_type: string;
    model_engine_valves_per_cyl: string;
    model_engine_power_ps: string;
    model_engine_power_rpm: string;
    model_engine_torque_nm: string;
    model_engine_torque_rpm: string;
    model_top_speed_kph: string;
    model_0_to_100_kph: string;
    model_drive: string;
    model_transmission_type: string;
    model_seats: string;
    model_doors: string;
    model_weight_kg: string;
    model_length_mm: string;
    model_width_mm: string;
    model_height_mm: string;
    model_wheelbase_mm: string;
    model_lkm_hwy: string;
    model_lkm_mixed: string;
    model_lkm_city: string;
    model_fuel_cap_l: string;
    model_sold_in_us: string;
    model_co2: string;
    model_make_display: string;
  }>;
}

// FIXED: Define proper return types instead of using 'any'
interface CarQueryTrim {
  model_make_display: string;
  model_name: string;
  model_year: string;
  model_body: string;
  model_engine_cc: string;
  model_engine_type: string;
  model_engine_power_ps: string;
  model_engine_power_rpm: string;
  model_engine_torque_nm: string;
  model_engine_torque_rpm: string;
  model_0_to_100_kph: string;
  model_top_speed_kph: string;
  model_transmission_type: string;
  model_drive: string;
  model_weight_kg: string;
  model_lkm_mixed: string;
  model_seats: string;
  model_doors: string;
}

interface SPAFormatData {
  make: string;
  model: string;
  year: number;
  bodyType: string;
  performanceData: {
    engine: string;
    horsePower: string;
    torque: string;
    acceleration060: string;
    topSpeed: string;
    transmission: string;
    driveType: string;
    weight: string;
    fuelEconomy: string;
  };
  specifications: {
    engine: string;
    horsePower: number;
    transmission: string;
    bodyType: string;
    driveType: string;
    seats: number;
    doors: number;
    weight: string;
    topSpeed: string;
    acceleration100: string;
  };
}

class CarQueryAPI {
  private baseUrl = 'https://www.carqueryapi.com/api/0.3/';

  async getMakes(): Promise<CarQueryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}?callback=?&cmd=getMakes`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('CarQuery API getMakes error:', error);
      throw error;
    }
  }

  async getModels(makeId: string): Promise<CarQueryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}?callback=?&cmd=getModels&make=${makeId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('CarQuery API getModels error:', error);
      throw error;
    }
  }

  async getTrims(make: string, model: string, year?: string): Promise<CarQueryResponse> {
    try {
      let url = `${this.baseUrl}?callback=?&cmd=getTrims&make=${make}&model=${model}`;
      if (year) url += `&year=${year}`;
      
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('CarQuery API getTrims error:', error);
      throw error;
    }
  }

  // FIXED: Convert CarQuery data to our SPA format with proper typing
  convertToSPAFormat(carQueryData: { Trims?: CarQueryTrim[] }): SPAFormatData | null {
    const trim = carQueryData.Trims?.[0];
    if (!trim) return null;

    return {
      // Basic Specifications
      make: trim.model_make_display,
      model: trim.model_name,
      year: parseInt(trim.model_year),
      bodyType: trim.model_body,
      
      // Performance Data
      performanceData: {
        engine: `${trim.model_engine_cc}cc ${trim.model_engine_type}`,
        horsePower: `${trim.model_engine_power_ps} PS @ ${trim.model_engine_power_rpm} rpm`,
        torque: `${trim.model_engine_torque_nm} Nm @ ${trim.model_engine_torque_rpm} rpm`,
        acceleration060: trim.model_0_to_100_kph ? `${(parseFloat(trim.model_0_to_100_kph) * 0.6214).toFixed(1)} seconds` : 'N/A',
        topSpeed: trim.model_top_speed_kph ? `${Math.round(parseFloat(trim.model_top_speed_kph) * 0.6214)} mph` : 'N/A',
        transmission: trim.model_transmission_type,
        driveType: trim.model_drive,
        weight: `${trim.model_weight_kg} kg`,
        fuelEconomy: trim.model_lkm_mixed ? `${(100 / parseFloat(trim.model_lkm_mixed) * 2.352).toFixed(1)} mpg` : 'N/A'
      },
      
      // Additional specs
      specifications: {
        engine: `${trim.model_engine_cc}cc ${trim.model_engine_type}`,
        horsePower: parseInt(trim.model_engine_power_ps) || 0,
        transmission: trim.model_transmission_type,
        bodyType: trim.model_body,
        driveType: trim.model_drive,
        seats: parseInt(trim.model_seats) || 0,
        doors: parseInt(trim.model_doors) || 0,
        weight: `${trim.model_weight_kg} kg`,
        topSpeed: trim.model_top_speed_kph ? `${Math.round(parseFloat(trim.model_top_speed_kph) * 0.6214)} mph` : 'N/A',
        acceleration100: trim.model_0_to_100_kph ? `${trim.model_0_to_100_kph} seconds` : 'N/A'
      }
    };
  }
}

export const carQueryAPI = new CarQueryAPI();