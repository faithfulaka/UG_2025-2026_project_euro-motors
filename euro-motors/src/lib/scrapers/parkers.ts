// Parkers depreciation and ownership cost scraper (stub)
// This will be extended to fetch and parse depreciation and TCO for a given make/model/year

export interface DepreciationData {
  year1?: string;
  year3?: string;
  year5?: string;
  residualValueRating?: string;
  notes?: string[];
}

export interface OwnershipCosts {
  insuranceGroup?: string;
  annualRoadTax?: string;
  typicalFinancing?: string;
  fuelCost?: string;
  maintenanceCost?: string;
  notes?: string[];
}

/**
 * Scrape Parkers for depreciation and ownership costs for a given car
 * @param make e.g. 'Bentley'
 * @param model e.g. 'Continental GT V8'
 * @param year e.g. '2022'
 */
export async function getParkersDepreciationAndOwnership(make: string, model: string, year?: string): Promise<{ depreciation: DepreciationData, ownership: OwnershipCosts }> {
  // For now, just return a stub. Next: implement real scraping logic.
  if (
    make.toLowerCase() === 'bentley' &&
    model.toLowerCase().includes('continental') &&
    year === '2022'
  ) {
    return {
      depreciation: {
        year1: '-15% (Est. Value: £148,750)',
        year3: '-35% (Est. Value: £113,750)',
        year5: '-48% (Est. Value: £91,000)',
        residualValueRating: 'Good (compared to segment)',
        notes: ['Rotating Display, First Edition improve resale']
      },
      ownership: {
        insuranceGroup: '50',
        annualRoadTax: '£580 (luxury vehicle tax)',
        typicalFinancing: '4.9% APR (£3,120/month with 20% down, 48 months)',
        fuelCost: 'Approx. £4,200/year (10,000 miles)',
        maintenanceCost: '£3,500-£5,000/year',
        notes: ['Brake pads (£1,800), Annual service (£1,200)']
      }
    };
  }
  return {
    depreciation: {},
    ownership: {}
  };
}
