// src/app/api/rentals/route.ts
import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { RentalCar }    from '@/types/cars'

export async function GET() {
  try {
    const raw = await prisma.rentalCar.findMany({
      where:      { isAvailable: true },
      include:    { images: true },
      orderBy:    { createdAt: 'desc' },
    })

    const cars: RentalCar[] = raw.map(car => ({
      id:            car.id,
      make:          car.make,
      model:         car.model,
      year:          car.year,
      baseMSRP:      car.baseMSRP ?? undefined,
      specifications:
        typeof car.specifications === 'string'
          ? JSON.parse(car.specifications)
          : car.specifications,
      features:
        typeof car.features === 'string'
          ? JSON.parse(car.features)
          : car.features,
      images:        car.images,
      isAvailable:   car.isAvailable,
      createdAt:     car.createdAt,
      updatedAt:     car.updatedAt,
    }))

    return NextResponse.json(cars)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch rentals' }, { status: 500 })
  }
}