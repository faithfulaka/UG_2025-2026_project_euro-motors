// src/context/CarContext.tsx - FIXED VERSION (No Any Types)
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BuyCar, RentalCar, SupercarData } from '@/types/cars';

interface CartItem {
  id: string;
  type: 'buy' | 'rent';
  car: BuyCar | RentalCar;
  quantity: number;
  selectedOptions?: string[];
  rentalDates?: {
    startDate: Date;
    endDate: Date;
    duration: 'HOURLY' | 'DAILY' | 'WEEKLY';
  };
}

interface CarFilters {
  make?: string;
  model?: string;
  yearRange?: { min: number; max: number };
  priceRange?: { min: number; max: number };
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
}

interface SPASearchResult {
  id: string;
  make: string;
  model: string;
  year: number;
  data: SupercarData; // Properly typed SPA data
  searchedAt: Date;
  source: 'carquery' | 'manufacturer' | 'mock';
}

interface TradeInData {
  registrationNumber: string;
  make?: string;
  model: string;
  year?: number;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  estimatedValue?: number;
  images?: string[];
  dvlaData?: {
    make?: string;
    model?: string;
    year?: number;
    fuelType?: string;
    engineCapacity?: number;
    co2Emissions?: number;
    taxStatus?: string;
    motStatus?: string;
  };
  userInputData?: {
    accidentHistory: boolean;
    numberOfAccidents?: number;
    previousOwners: number;
    fullServiceHistory: boolean;
    hasModifications: boolean;
    interiorCondition: number;
    exteriorCondition: number;
    conditionDetails?: string;
  };
}

interface CarContextType {
  // Cart Management
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;

  // Favorites Management
  favorites: string[];
  addToFavorites: (carId: string) => void;
  removeFromFavorites: (carId: string) => void;
  isFavorite: (carId: string) => boolean;

  // Search & Filters
  searchFilters: CarFilters;
  updateFilters: (filters: Partial<CarFilters>) => void;
  clearFilters: () => void;

  // SPA Integration
  spaSearchResults: SPASearchResult[];
  addSPAResult: (result: SPASearchResult) => void;
  clearSPAResults: () => void;

  // Recently Viewed
  recentlyViewed: string[];
  addToRecentlyViewed: (carId: string) => void;

  // Trade-in Data
  tradeInData: TradeInData | null;
  setTradeInData: (data: TradeInData) => void;
  clearTradeInData: () => void;

  // Loading States
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

export function CarProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<CarFilters>({});
  const [spaSearchResults, setSpaSearchResults] = useState<SPASearchResult[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [tradeInData, setTradeInDataState] = useState<TradeInData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('euroMotorsCart');
      const savedFavorites = localStorage.getItem('euroMotorsFavorites');
      const savedRecentlyViewed = localStorage.getItem('euroMotorsRecentlyViewed');
      
      if (savedCart) {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        setCartItems(parsedCart);
      }
      if (savedFavorites) {
        const parsedFavorites: string[] = JSON.parse(savedFavorites);
        setFavorites(parsedFavorites);
      }
      if (savedRecentlyViewed) {
        const parsedRecentlyViewed: string[] = JSON.parse(savedRecentlyViewed);
        setRecentlyViewed(parsedRecentlyViewed);
      }
    } catch (error) {
      console.error('Error loading saved car data:', error);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('euroMotorsCart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('euroMotorsFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('euroMotorsRecentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Cart Management
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `${item.type}-${item.car.id}-${Date.now()}`,
    };
    setCartItems(prev => [...prev, newItem]);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => {
    if (item.type === 'buy') {
      return total + (item.car as BuyCar).price * item.quantity;
    } else {
      const rentalCar = item.car as RentalCar;
      const { rentalDates } = item;
      if (rentalDates) {
        const days = Math.ceil(
          (rentalDates.endDate.getTime() - rentalDates.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        switch (rentalDates.duration) {
          case 'HOURLY':
            return total + rentalCar.hourlyRate * days * 24;
          case 'DAILY':
            return total + rentalCar.dailyRate * days;
          case 'WEEKLY':
            return total + rentalCar.weeklyRate * Math.ceil(days / 7);
          default:
            return total + rentalCar.dailyRate * days;
        }
      }
    }
    return total;
  }, 0);

  // Favorites Management
  const addToFavorites = (carId: string) => {
    setFavorites(prev => [...prev.filter(id => id !== carId), carId]);
  };

  const removeFromFavorites = (carId: string) => {
    setFavorites(prev => prev.filter(id => id !== carId));
  };

  const isFavorite = (carId: string) => {
    return favorites.includes(carId);
  };

  // Search & Filters
  const updateFilters = (filters: Partial<CarFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  };

  const clearFilters = () => {
    setSearchFilters({});
  };

  // SPA Integration
  const addSPAResult = (result: SPASearchResult) => {
    setSpaSearchResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 searches
  };

  const clearSPAResults = () => {
    setSpaSearchResults([]);
  };

  // Recently Viewed
  const addToRecentlyViewed = (carId: string) => {
    setRecentlyViewed(prev => [
      carId,
      ...prev.filter(id => id !== carId).slice(0, 9) // Keep last 10 viewed
    ]);
  };

  // Trade-in Data
  const setTradeInData = (data: TradeInData) => {
    setTradeInDataState(data);
  };

  const clearTradeInData = () => {
    setTradeInDataState(null);
  };

  return (
    <CarContext.Provider
      value={{
        // Cart Management
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,

        // Favorites Management
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,

        // Search & Filters
        searchFilters,
        updateFilters,
        clearFilters,

        // SPA Integration
        spaSearchResults,
        addSPAResult,
        clearSPAResults,

        // Recently Viewed
        recentlyViewed,
        addToRecentlyViewed,

        // Trade-in Data
        tradeInData,
        setTradeInData,
        clearTradeInData,

        // Loading States
        loading,
        setLoading,
      }}
    >
      {children}
    </CarContext.Provider>
  );
}

export function useCar() {
  const context = useContext(CarContext);
  if (context === undefined) {
    throw new Error('useCar must be used within a CarProvider');
  }
  return context;
}