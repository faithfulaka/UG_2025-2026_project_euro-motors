// src/lib/api-client.ts
// Centralized API Client - Ensures type safety and consistency for all API calls

import type { BuyCar, RentalCar, CarFormData, RentalCarFormData } from '@/types/cars';
import type { AdminDashboardStats } from '@/types/admin';
import type { SPASearchParams, SPASearchResponse, SPASuggestionResponse, SPAMakesResponse, SPAModelsResponse, ComprehensiveSPAData, SPASuggestion } from '@/types/spa';
import { validateAPIResponse, isAPIError } from '@/lib/type-validators';

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || '';

// Generic API Response Type
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  message?: string;
  timestamp?: string;
}

// Request Configuration
interface RequestConfig extends RequestInit {
  token?: string;
}

// Type for user object
interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
}

// Type for headers with Authorization
interface AuthHeaders extends Record<string, string> {
  Authorization?: string;
  'Content-Type': string;
}

/**
 * Base API client with error handling and type safety
 */
class APIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string = API_BASE) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make a typed API request
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const { token, headers, ...restConfig } = config;

    const finalHeaders: AuthHeaders = {
      'Content-Type': 'application/json',
      ...headers as Record<string, string>,
    };

    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...restConfig,
        headers: finalHeaders as HeadersInit,
      });

      const data = await response.json();

      if (!validateAPIResponse(data)) {
        throw new Error('Invalid API response structure');
      }

      if (!response.ok && !data.success) {
        return {
          success: false,
          error: isAPIError(data.error) ? data.error : {
            code: 'API_ERROR',
            message: data.message || `Request failed with status ${response.status}`,
            details: JSON.stringify(data)
          }
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
          details: String(error)
        }
      };
    }
  }

  /**
   * GET request helper
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request helper
   */
  async post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  async put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request helper
   */
  async patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request helper
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Create default client instance
const apiClient = new APIClient();

// Error type for batch operations
interface BatchError {
  carId: string;
  error: string;
}

/**
 * Admin API Methods
 */
export const adminAPI = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(token: string): Promise<APIResponse<AdminDashboardStats>> {
    return apiClient.get<AdminDashboardStats>('/api/admin/dashboard', { token });
  },

  /**
   * Get admin cars list
   */
  async getCars(token: string, type: 'buy' | 'rent' = 'buy'): Promise<APIResponse<BuyCar[] | RentalCar[]>> {
    return apiClient.get<BuyCar[] | RentalCar[]>(`/api/admin/cars?type=${type}`, { token });
  },

  /**
   * Get single car by ID
   */
  async getCar(token: string, id: string, type: 'buy' | 'rent' = 'buy'): Promise<APIResponse<BuyCar | RentalCar>> {
    return apiClient.get<BuyCar | RentalCar>(`/api/admin/cars/${id}?type=${type}`, { token });
  },

  /**
   * Create a new car
   */
  async createCar(
    token: string,
    data: CarFormData | RentalCarFormData,
    type: 'buy' | 'rent' = 'buy'
  ): Promise<APIResponse<BuyCar | RentalCar>> {
    return apiClient.post<BuyCar | RentalCar>('/api/admin/cars', { ...data, type }, { token });
  },

  /**
   * Update an existing car
   */
  async updateCar(
    token: string,
    id: string,
    data: Partial<CarFormData | RentalCarFormData>,
    type: 'buy' | 'rent' = 'buy'
  ): Promise<APIResponse<BuyCar | RentalCar>> {
    return apiClient.put<BuyCar | RentalCar>(`/api/admin/cars/${id}?type=${type}`, data, { token });
  },

  /**
   * Delete a car
   */
  async deleteCar(
    token: string,
    id: string,
    type: 'buy' | 'rent' = 'buy'
  ): Promise<APIResponse<{ success: boolean; message: string }>> {
    return apiClient.delete(`/api/admin/cars/${id}?type=${type}`, { token });
  },

  /**
   * Batch update cars with SPA data
   */
  async enrichCarsWithSPA(
    token: string,
    carIds: string[]
  ): Promise<APIResponse<{ updated: BuyCar[]; errors: BatchError[] }>> {
    return apiClient.patch('/api/cars', { carIds, enrichWithSPA: true }, { token });
  }
};

/**
 * SPA API Methods
 */
export const spaAPI = {
  /**
   * Search for comprehensive car data
   */
  async search(params: SPASearchParams): Promise<SPASearchResponse> {
    const response = await apiClient.post<ComprehensiveSPAData>('/api/spa/search', params);
    return response as unknown as SPASearchResponse;
  },

  /**
   * Get make suggestions
   */
  async getMakeSuggestions(query?: string): Promise<SPASuggestionResponse> {
    const params = new URLSearchParams({ type: 'make' });
    if (query) params.set('query', query);
    
    const response = await apiClient.get<SPASuggestion[]>(`/api/spa/suggestions?${params}`);
    return response as unknown as SPASuggestionResponse;
  },

  /**
   * Get model suggestions
   */
  async getModelSuggestions(make: string, query?: string): Promise<SPASuggestionResponse> {
    const params = new URLSearchParams({ type: 'model', make });
    if (query) params.set('query', query);
    
    const response = await apiClient.get<SPASuggestion[]>(`/api/spa/suggestions?${params}`);
    return response as unknown as SPASuggestionResponse;
  },

  /**
   * Get year suggestions
   */
  async getYearSuggestions(make: string, model: string): Promise<SPASuggestionResponse> {
    const params = new URLSearchParams({ type: 'year', make, model });
    
    const response = await apiClient.get<SPASuggestion[]>(`/api/spa/suggestions?${params}`);
    return response as unknown as SPASuggestionResponse;
  },

  /**
   * Get batch suggestions
   */
  async getBatchSuggestions(
    types: ('make' | 'model' | 'year')[],
    make?: string,
    model?: string
  ): Promise<APIResponse<Record<string, SPASuggestion[]>>> {
    return apiClient.post('/api/spa/suggestions', { types, make, model });
  },

  /**
   * Get CarQuery makes
   */
  async getCarQueryMakes(): Promise<SPAMakesResponse> {
    const response = await apiClient.get<string[]>('/api/spa/carquery/makes');
    return response as unknown as SPAMakesResponse;
  },

  /**
   * Get CarQuery models
   */
  async getCarQueryModels(make: string): Promise<SPAModelsResponse> {
    const response = await apiClient.get<string[]>(`/api/spa/carquery/models?make=${make}`);
    return response as unknown as SPAModelsResponse;
  }
};

/**
 * Public API Methods (no auth required)
 */
export const publicAPI = {
  /**
   * Get all available cars for purchase
   */
  async getCars(): Promise<APIResponse<BuyCar[]>> {
    return apiClient.get<BuyCar[]>('/api/cars');
  },

  /**
   * Get single car by ID
   */
  async getCar(id: string): Promise<APIResponse<BuyCar>> {
    return apiClient.get<BuyCar>(`/api/cars/${id}`);
  },

  /**
   * Get all available rental cars
   */
  async getRentalCars(): Promise<APIResponse<RentalCar[]>> {
    return apiClient.get<RentalCar[]>('/api/rentals');
  },

  /**
   * Get single rental car by ID
   */
  async getRentalCar(id: string): Promise<APIResponse<RentalCar>> {
    return apiClient.get<RentalCar>(`/api/rentals/${id}`);
  }
};

/**
 * Auth API Methods
 */
export const authAPI = {
  /**
   * Login user
   */
  async login(email: string, password: string): Promise<APIResponse<{ token: string; user: User }>> {
    return apiClient.post('/api/auth/login', { email, password });
  },

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<APIResponse<{ token: string; user: User }>> {
    return apiClient.post('/api/auth/register', data);
  },

  /**
   * Get current user
   */
  async getCurrentUser(token: string): Promise<APIResponse<User>> {
    return apiClient.get('/api/auth/me', { token });
  },

  /**
   * Logout user
   */
  async logout(token: string): Promise<APIResponse<{ success: boolean }>> {
    return apiClient.post('/api/auth/logout', {}, { token });
  }
};

/**
 * Helper functions for common operations
 */
export const apiHelpers = {
  /**
   * Check if response was successful
   */
  isSuccess<T>(response: APIResponse<T>): response is APIResponse<T> & { data: T } {
    return response.success === true && response.data !== undefined;
  },

  /**
   * Extract error message from response
   */
  getErrorMessage(response: APIResponse<unknown>): string {
    if (response.error) {
      return response.error.message;
    }
    return response.message || 'An unknown error occurred';
  },

  /**
   * Create a car with SPA enrichment
   */
  async createCarWithSPA(
    token: string,
    carData: CarFormData | RentalCarFormData,
    type: 'buy' | 'rent' = 'buy'
  ): Promise<APIResponse<BuyCar | RentalCar>> {
    // First, get SPA data
    const spaResponse = await spaAPI.search({
      make: carData.make,
      model: carData.model,
      year: carData.year,
      dataSource: 'comprehensive'
    });

    const enrichedData = { ...carData } as CarFormData & {
      supercarData?: ComprehensiveSPAData;
      performanceData?: unknown;
      pricingData?: unknown;
      baseMSRP?: number;
    };

    if (spaResponse.success && spaResponse.data) {
      // Enrich car data with SPA information
      if (spaResponse.data.performanceData) {
        enrichedData.specifications = {
          ...enrichedData.specifications,
          topSpeed: spaResponse.data.performanceData.topSpeed,
          acceleration60: spaResponse.data.performanceData.acceleration060,
          torque: spaResponse.data.performanceData.torque,
          powerPS: spaResponse.data.performanceData.horsePower,
          weight: spaResponse.data.performanceData.weight,
          fuelEconomy: spaResponse.data.performanceData.fuelEconomy
        };
      }

      // Add additional enrichment data
      enrichedData.supercarData = spaResponse.data;
      enrichedData.performanceData = spaResponse.data.performanceData;
      
      if (type === 'buy' && spaResponse.data.pricingData) {
        enrichedData.pricingData = spaResponse.data.pricingData;
        enrichedData.baseMSRP = spaResponse.data.pricingData.baseMSRP;
      }
    }

    // Create the car with enriched data
    return adminAPI.createCar(token, enrichedData, type);
  }
};

// Export the main client for custom use cases
export default apiClient;

// Export a configured instance for each API group
export const api = {
  admin: adminAPI,
  spa: spaAPI,
  public: publicAPI,
  auth: authAPI,
  helpers: apiHelpers
};
