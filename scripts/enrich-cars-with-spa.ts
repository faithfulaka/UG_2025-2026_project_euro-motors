// scripts/enrich-cars-with-spa.ts
// Run with: npx tsx scripts/enrich-cars-with-spa.ts

import { prisma } from '../src/lib/prisma';
import type { SPASearchResponse } from '../src/types/spa';

async function enrichCarsWithSPAData() {
  console.log('Starting car enrichment with SPA data...');
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  let successCount = 0;
  let errorCount = 0;

  try {
    // Fetch all buy cars - get all and filter in-memory
    const buyCars = await prisma.buyCar.findMany();

    // Filter cars that need enrichment
    const needsEnrichment = buyCars.filter(car =>
      !car.supercarData || !car.performanceData || !car.pricingData
    );

    console.log(`Found ${needsEnrichment.length} cars to enrich`);

    for (const car of needsEnrichment) {
      try {
        console.log(`Enriching ${car.make} ${car.model} ${car.year}...`);
        
        // Fetch SPA data
        const response = await fetch(`${baseUrl}/api/spa/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            make: car.make,
            model: car.model,
            year: car.year.toString(),
            source: 'comprehensive'
          })
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const spaResult: SPASearchResponse = await response.json();
        
        if (spaResult.success && spaResult.data) {
          // Update car with SPA data
          await prisma.buyCar.update({
            where: { id: car.id },
            data: {
              supercarData: spaResult.data as any,
              performanceData: spaResult.data.performanceData as any,
              pricingData: spaResult.data.pricingData as any,
              baseMSRP: spaResult.data.pricingData?.baseMSRP || car.baseMSRP
            }
          });
          
          console.log(`✓ Successfully enriched ${car.make} ${car.model}`);
          successCount++;
        } else {
          console.log(`⚠ No SPA data found for ${car.make} ${car.model}`);
          errorCount++;
        }
        
        // Add delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`✗ Failed to enrich car ${car.id}:`, error);
        errorCount++;
      }
    }

    // Also enrich rental cars
    const allRentalCars = await prisma.rentalCar.findMany();
    const rentalCars = allRentalCars.filter(car =>
      !car.supercarData || !car.performanceData
    );

    console.log(`\nFound ${rentalCars.length} rental cars to enrich`);

    for (const car of rentalCars) {
      try {
        console.log(`Enriching rental ${car.make} ${car.model} ${car.year}...`);
        
        const response = await fetch(`${baseUrl}/api/spa/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            make: car.make,
            model: car.model,
            year: car.year.toString(),
            source: 'comprehensive'
          })
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const spaResult: SPASearchResponse = await response.json();
        
        if (spaResult.success && spaResult.data) {
          await prisma.rentalCar.update({
            where: { id: car.id },
            data: {
              supercarData: spaResult.data as any,
              performanceData: spaResult.data.performanceData as any,
              baseMSRP: spaResult.data.pricingData?.baseMSRP || car.baseMSRP
            }
          });
          
          console.log(`✓ Successfully enriched rental ${car.make} ${car.model}`);
          successCount++;
        } else {
          console.log(`⚠ No SPA data found for rental ${car.make} ${car.model}`);
          errorCount++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`✗ Failed to enrich rental car ${car.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Enrichment Complete ===');
    console.log(`✓ Successfully enriched: ${successCount} cars`);
    console.log(`✗ Failed to enrich: ${errorCount} cars`);
    
  } catch (error) {
    console.error('Fatal error during enrichment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the enrichment
enrichCarsWithSPAData()
  .then(() => {
    console.log('\nEnrichment process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nEnrichment process failed:', error);
    process.exit(1);
  });
