// src/types/index.ts

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

  