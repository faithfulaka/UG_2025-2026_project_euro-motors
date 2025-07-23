// src/context/CarContext.tsx - FIXED WITH PROPER SPA TYPES
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BuyCar, RentalCar } from '@/types/cars';
import { 
  CartItem, 
  CarFilters, 
  ContextSPAResult, 
  TradeInVehicle 
} from '@/types/context';

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

  // SPA Integration (FIXED TYPES)
  spaSearchResults: ContextSPAResult[];
  addSPAResult: (result: ContextSPAResult) => void;
  clearSPAResults: () => void;

  // Recently Viewed
  recentlyViewed: string[];
  addToRecentlyViewed: (carId: string) => void;

  // Trade-in Data
  tradeInData: TradeInVehicle | null;
  setTradeInData: (data: TradeInVehicle) => void;
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
  const [spaSearchResults, setSpaSearchResults] = useState<ContextSPAResult[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [tradeInData, setTradeInDataState] = useState<TradeInVehicle | null>(null);
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
    if (cartItems.length > 0) {
      localStorage.setItem('euroMotorsCart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('euroMotorsFavorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    if (recentlyViewed.length > 0) {
      localStorage.setItem('euroMotorsRecentlyViewed', JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed]);

  // Cart Management
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `${item.type}-${item.carId}-${Date.now()}`,
    };
    setCartItems(prev => [...prev, newItem]);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('euroMotorsCart');
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
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

  // SPA Integration (FIXED)
  const addSPAResult = (result: ContextSPAResult) => {
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
  const setTradeInData = (data: TradeInVehicle) => {
    setTradeInDataState(data);
  };

  const clearTradeInData = () => {
    setTradeInDataState(null);
  };

  const contextValue: CarContextType = {
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
  };

  return (
    <CarContext.Provider value={contextValue}>
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