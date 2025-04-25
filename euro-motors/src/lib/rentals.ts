// lib/rentals.ts
import { prisma } from './prisma';

// Helper function to parse JSON fields
function parseRentalData(rental: any) {
  return {
    ...rental,
    specifications: JSON.parse(rental.specifications),
    features: JSON.parse(rental.features)
  };
}

export async function getAllRentals() {
  const rentals = await prisma.rentalCar.findMany({
    where: { isAvailable: true },
    include: { images: true },
    orderBy: { make: 'asc' }
  });
  
  return rentals.map(rental => parseRentalData(rental));
}

export async function getRentalById(id: string) {
  const rental = await prisma.rentalCar.findUnique({
    where: { id },
    include: { images: true }
  });
  
  if (!rental) return null;
  return parseRentalData(rental);
}

// Add createRental, updateRental, and deleteRental functions similar to the cars.ts file