// src/context/CarContext.tsx 
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {
  CartItem,
  CarFilters,
  ContextSPAResult,
  TradeInVehicle
} from '@/types/context';

interface CarContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;

  favorites: string[];
  addToFavorites: (carId: string) => void;
  removeFromFavorites: (carId: string) => void;
  isFavorite: (carId: string) => boolean;

  searchFilters: CarFilters;
  updateFilters: (filters: Partial<CarFilters>) => void;
  clearFilters: () => void;

  spaSearchResults: ContextSPAResult[];
  addSPAResult: (result: ContextSPAResult) => void;
  clearSPAResults: () => void;

  recentlyViewed: string[];
  addToRecentlyViewed: (carId: string) => void;

  tradeInData: TradeInVehicle | null;
  setTradeInData: (data: TradeInVehicle) => void;
  clearTradeInData: () => void;

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

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('euroMotorsCart');
      if (savedCart) setCartItems(JSON.parse(savedCart));
      const savedFav = localStorage.getItem('euroMotorsFavorites');
      if (savedFav) setFavorites(JSON.parse(savedFav));
      const savedRV = localStorage.getItem('euroMotorsRecentlyViewed');
      if (savedRV) setRecentlyViewed(JSON.parse(savedRV));
    } catch (e) {
      console.error('Failed to load localStorage data', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('euroMotorsCart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('euroMotorsFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('euroMotorsRecentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = { ...item, id: `${item.type}-${item.carId}-${Date.now()}` };
    setCartItems(prev => [...prev, newItem]);
  };
  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => { setCartItems([]); localStorage.removeItem('euroMotorsCart'); };
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addToFavorites = (carId: string) => setFavorites(prev => [...prev.filter(id => id !== carId), carId]);
  const removeFromFavorites = (carId: string) => setFavorites(prev => prev.filter(id => id !== carId));
  const isFavorite = (carId: string) => favorites.includes(carId);

  const updateFilters = (filters: Partial<CarFilters>) => setSearchFilters(prev => ({ ...prev, ...filters }));
  const clearFilters = () => setSearchFilters({});

  const addSPAResult = (r: ContextSPAResult) => setSpaSearchResults(prev => [r, ...prev.slice(0, 9)]);
  const clearSPAResults = () => setSpaSearchResults([]);

  const addToRecentlyViewed = (carId: string) =>
    setRecentlyViewed(prev => [carId, ...prev.filter(id => id !== carId)].slice(0, 9));

  const setTradeInData = (data: TradeInVehicle) => setTradeInDataState(data);
  const clearTradeInData = () => setTradeInDataState(null);

  return (
    <CarContext.Provider value={{
      cartItems, addToCart, removeFromCart, clearCart, cartTotal,
      favorites, addToFavorites, removeFromFavorites, isFavorite,
      searchFilters, updateFilters, clearFilters,
      spaSearchResults, addSPAResult, clearSPAResults,
      recentlyViewed, addToRecentlyViewed,
      tradeInData, setTradeInData, clearTradeInData,
      loading, setLoading,
    }}>
      {children}
    </CarContext.Provider>
  );
}

export function useCar() {
  const ctx = useContext(CarContext);
  if (!ctx) throw new Error("useCar must be used within CarProvider");
  return ctx;
}