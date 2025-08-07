// src/lib/services/new-apis/edmunds-api.ts
import axios from 'axios';

const EDMUNDS_BASE_URL = 'https://community-edmunds.p.rapidapi.com/api';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  console.warn('RAPIDAPI_KEY not found in environment variables');
}

const edmundsClient = axios.create({
  baseURL: EDMUNDS_BASE_URL,
  headers: {
    'x-rapidapi-host': 'community-edmunds.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY || '',
  },
  timeout: 10000,
});

// Types for Edmunds API responses
export interface EdmundsVehicleGrade {
  id: string;
  name: string;
  category: string;
  fuel: {
    city: number;
    combined: number;
    highway: number;
  };
  engine: {
    cylinder: number;
    displacement: number;
    horsepower: number;
    torque: number;
    type: string;
  };
  transmission: {
    type: string;
    numberOfSpeeds: number;
  };
  drivenWheels: string;
  price: {
    baseMSRP: number;
    baseInvoice: number;
    deliveryCharges: number;
  };
  years: number[];
}

export interface EdmundsMake {
  id: string;
  name: string;
  niceName: string;
}

export interface EdmundsModel {
  id: string;
  name: string;
  niceName: string;
  years: Array<{
    year: number;
    id: string;
  }>;
}

export interface EdmundsSpecification {
  make: string;
  model: string;
  year: number;
  bodyType: string;
  drivetrain: string;
  engine: {
    type: string;
    cylinders: number;
    displacement: number;
    horsepower: number;
    torque: number;
    fuelType: string;
  };
  transmission: string;
  mpg: {
    city: number;
    highway: number;
    combined: number;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    wheelbase: number;
  };
  weight: number;
  price: {
    msrp: number;
    invoice: number;
  };
}

/**
 * Get vehicle grade details by ID
 */
export async function getVehicleGrade(gradeId: string): Promise<EdmundsVehicleGrade | null> {
  try {
    const response = await edmundsClient.get(`/vehicle/v2/grade/${gradeId}`, {
      params: { fmt: 'json' }
    });

    if (response.data && response.data.grade) {
      return response.data.grade;
    }

    return response.data;
  } catch (error) {
    console.error('Edmunds API error (getVehicleGrade):', error);
    return null;
  }
}

/**
 * Get all available makes
 */
export async function getMakes(): Promise<EdmundsMake[]> {
  try {
    const response = await edmundsClient.get('/vehicle/v2/makes', {
      params: { fmt: 'json', state: 'new' }
    });

    return response.data?.makes || [];
  } catch (error) {
    console.error('Edmunds API error (getMakes):', error);
    return [];
  }
}

/**
 * Get models for a specific make
 */
export async function getModels(makeNiceName: string): Promise<EdmundsModel[]> {
  try {
    const response = await edmundsClient.get(`/vehicle/v2/${makeNiceName}/models`, {
      params: { fmt: 'json', state: 'new' }
    });

    return response.data?.models || [];
  } catch (error) {
    console.error('Edmunds API error (getModels):', error);
    return [];
  }
}

/**
 * Get vehicle specifications
 */
export async function getVehicleSpecs(
  make: string,
  model: string,
  year: number
): Promise<EdmundsSpecification | null> {
  try {
    // Normalize make/model names for Edmunds API
    const makeNice = make.toLowerCase().replace(/\s+/g, '');
    const modelNice = model.toLowerCase().replace(/\s+/g, '');

    const response = await edmundsClient.get(
      `/vehicle/v2/${makeNice}/${modelNice}/${year}`,
      {
        params: { fmt: 'json', state: 'new' }
      }
    );

    if (response.data && response.data.years && response.data.years.length > 0) {
      const yearData = response.data.years.find((y: any) => y.year === year);
      if (yearData && yearData.styles && yearData.styles.length > 0) {
        const style = yearData.styles[0];
        
        return {
          make: response.data.make.name,
          model: response.data.model.name,
          year,
          bodyType: style.submodel?.body || '',
          drivetrain: style.engine?.drivenWheels || '',
          engine: {
            type: style.engine?.type || '',
            cylinders: style.engine?.cylinder || 0,
            displacement: style.engine?.displacement || 0,
            horsepower: style.engine?.horsepower || 0,
            torque: style.engine?.torque || 0,
            fuelType: style.engine?.fuelType || ''
          },
          transmission: style.transmission?.type || '',
          mpg: {
            city: style.mpg?.city || 0,
            highway: style.mpg?.highway || 0,
            combined: style.mpg?.combined || 0
          },
          dimensions: {
            length: style.dimensions?.length || 0,
            width: style.dimensions?.width || 0,
            height: style.dimensions?.height || 0,
            wheelbase: style.dimensions?.wheelbase || 0
          },
          weight: style.weight || 0,
          price: {
            msrp: style.price?.baseMSRP || 0,
            invoice: style.price?.baseInvoice || 0
          }
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Edmunds API error (getVehicleSpecs):', error);
    return null;
  }
}

/**
 * Search for vehicles with filters
 */
export async function searchVehicles(filters: {
  make?: string;
  model?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
}): Promise<EdmundsSpecification[]> {
  try {
    const params: any = { fmt: 'json', state: 'new' };
    
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    let endpoint = '/vehicle/v2';
    if (filters.make) {
      endpoint += `/${filters.make.toLowerCase()}`;
      if (filters.model) {
        endpoint += `/${filters.model.toLowerCase()}`;
        if (filters.year) {
          endpoint += `/${filters.year}`;
        }
      }
    }

    const response = await edmundsClient.get(endpoint, { params });

    // Process response based on endpoint structure
    let vehicles: EdmundsSpecification[] = [];
    
    if (response.data) {
      // Handle different response structures
      if (response.data.years) {
        // Single make/model response
        response.data.years.forEach((yearData: any) => {
          if (yearData.styles) {
            yearData.styles.forEach((style: any) => {
              vehicles.push({
                make: response.data.make.name,
                model: response.data.model.name,
                year: yearData.year,
                bodyType: style.submodel?.body || '',
                drivetrain: style.engine?.drivenWheels || '',
                engine: {
                  type: style.engine?.type || '',
                  cylinders: style.engine?.cylinder || 0,
                  displacement: style.engine?.displacement || 0,
                  horsepower: style.engine?.horsepower || 0,
                  torque: style.engine?.torque || 0,
                  fuelType: style.engine?.fuelType || ''
                },
                transmission: style.transmission?.type || '',
                mpg: {
                  city: style.mpg?.city || 0,
                  highway: style.mpg?.highway || 0,
                  combined: style.mpg?.combined || 0
                },
                dimensions: {
                  length: style.dimensions?.length || 0,
                  width: style.dimensions?.width || 0,
                  height: style.dimensions?.height || 0,
                  wheelbase: style.dimensions?.wheelbase || 0
                },
                weight: style.weight || 0,
                price: {
                  msrp: style.price?.baseMSRP || 0,
                  invoice: style.price?.baseInvoice || 0
                }
              });
            });
          }
        });
      }
    }

    return vehicles;
  } catch (error) {
    console.error('Edmunds API error (searchVehicles):', error);
    return [];
  }
}

/**
 * Get vehicle reviews and ratings
 */
export async function getVehicleReviews(make: string, model: string, year: number) {
  try {
    const makeNice = make.toLowerCase().replace(/\s+/g, '');
    const modelNice = model.toLowerCase().replace(/\s+/g, '');

    const response = await edmundsClient.get(
      `/vehicle/v2/${makeNice}/${modelNice}/${year}/reviews`,
      {
        params: { fmt: 'json' }
      }
    );

    return response.data || null;
  } catch (error) {
    console.error('Edmunds API error (getVehicleReviews):', error);
    return null;
  }
}

export const edmundsService = {
  getVehicleGrade,
  getMakes,
  getModels,
  getVehicleSpecs,
  searchVehicles,
  getVehicleReviews,
};