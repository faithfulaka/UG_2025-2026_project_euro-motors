//src/lib/services/dvla-api.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
// src/lib/services/dvla-api.ts

export interface OwnershipCosts {
  annualTax: number;
  insuranceGroup: number;
  fuelCostPerYear: number;
}

export async function getOwnershipCosts(
  make: string,
  model: string,
  year: number
): Promise<OwnershipCosts> {
  void make;
  void model;
  void year;
  return {
    annualTax: 580,
    insuranceGroup: 50,
    fuelCostPerYear: 4200,
  };
}