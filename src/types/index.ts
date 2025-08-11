// src/types/index.ts - Main types export file

// Core car data types
export interface CarData {
  make: string;
  model: string;
  year: string;
  msrp: number;
  image?: string;
  summary?: string;
}

export interface SuggestionParams {
  make: string;
  model?: string;
  year?: string;
}

export interface SupercarData {
  make: string;
  model: string;
  year: string;
  msrp: number;
  image?: string;
  summary?: string;
}

// Re-export all SPA types
export * from './spa';
export * from './admin';
export * from './cars';
export * from './context';
