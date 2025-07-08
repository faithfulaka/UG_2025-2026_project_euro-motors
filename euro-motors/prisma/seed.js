// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@euromotors.com' },
    update: {},
    create: {
      email: 'admin@euromotors.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('User123!', 10);
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
    },
  });

  // Clear existing car data to prevent duplicates on re-seed
  await prisma.buyCarImage.deleteMany({});
  await prisma.buyCar.deleteMany({});
  await prisma.rentalCarImage.deleteMany({});
  await prisma.rentalCar.deleteMany({});

  // Create purchase cars with enhanced SPA data
  const buyCars = [
    {
      id: 'car1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      price: 169990, // Dealer Price from SPA
      baseMSRP: 175000, // Base MSRP from SPA
      specifications: {
        color: 'Pearl White',
        interiorColor: 'Red/Black',
        mileage: 0,
        engine: '6.0 L V8 Biturbo',
        horsePower: 542,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'SUV',
        driveType: 'All Wheel Drive',
        seats: 5,
        doors: 4,
        topSpeed: '290 KM/H',
        acceleration100: 'APPROXIMATELY 4.0 S',
        powerKW: '404 kW',
        powerPS: '549 PS',
        torque: '770 NM',
        weight: '2410 KG',
        wheelbase: '2.995 M',
        wheelSize: '22 Inch Ten Spoke',
        brakeColor: 'Red'
      },
      performanceData: {
        engine: '6.0L V8 Biturbo',
        horsePower: '542 hp @ 6,000 rpm',
        torque: '770 Nm @ 1,960-4,500 rpm',
        acceleration060: '4.0 seconds',
        topSpeed: '290 km/h',
        transmission: '8-speed automatic',
        driveType: 'All Wheel Drive',
        weight: '2410 kg'
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Heated Seats'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control'
        ]
      },
      standardEquipment: [
        'Engine start/stop button',
        'Bentley Online services',
        'Bentley Teleservices',
        'Brake force display',
        'Digital Radio',
        'Oil level indicator'
      ],
      addedOptions: [
        'Touring Specification',
        'Bentley Dynamic Ride',
        'Five Seat Comfort Specification',
        'Sports Exhaust',
        'Naim For Bentley',
        'Embroidered Bentley Emblems',
        'Heated, Acoustic, IR Front Screen',
        'Jewel Fuel Filler Cap'
      ],
      description: 'The Bentley Bentayga V8 BLACK EDITION luxury SUV experience.',
      isAvailable: true,
    },
    {
      id: 'car2',
      make: 'Rolls Royce',
      model: 'Cullinan V12',
      trim: 'BLACK BADGE',
      year: 2022,
      price: 380000,
      baseMSRP: 395000,
      specifications: {
        color: 'Dark Grey',
        interiorColor: 'Black',
        mileage: 0,
        engine: '6.75L V12',
        horsePower: 591,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'SUV',
        driveType: 'All Wheel Drive',
        seats: 5,
        doors: 4,
        topSpeed: '250 KM/H',
        acceleration100: 'APPROXIMATELY 5.0 S',
        powerKW: '441 kW',
        powerPS: '600 PS',
        torque: '850 NM',
        weight: '2735 KG',
        wheelbase: '3.295 M',
        wheelSize: '22 Inch Part Polished',
        brakeColor: 'Black'
      },
      performanceData: {
        engine: '6.75L V12',
        horsePower: '591 hp @ 5,000 rpm',
        torque: '850 Nm @ 1,600-4,000 rpm',
        acceleration060: '5.0 seconds',
        topSpeed: '250 km/h',
        transmission: '8-speed automatic',
        driveType: 'All Wheel Drive',
        weight: '2735 kg'
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Heated and Ventilated Seats'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Panoramic Sunroof'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Lane Departure Warning'
        ]
      },
      standardEquipment: [
        'Spirit of Ecstasy controller',
        'Self-levelling air suspension',
        'Bespoke Audio System',
        'Rear Theatre Configuration'
      ],
      addedOptions: [
        'Rear Theatre Configuration',
        'Bespoke Audio',
        'Panoramic Glass Roof',
        'Massage Seats',
        'Champagne Cooler',
        'Starlight Headliner'
      ],
      description: 'The Rolls Royce Cullinan V12 BLACK BADGE redefines luxury SUV performance.',
      isAvailable: true,
    },
    {
      id: 'car3',
      make: 'Bentley',
      model: 'Continental GT V8',
      trim: 'Continental GT V8',
      year: 2022,
      price: 174995, // Dealer Price from SPA data
      baseMSRP: 175000, // Base MSRP from SPA data
      specifications: {
        color: 'Blue',
        interiorColor: 'Cream',
        mileage: 0,
        engine: '4.0L V8 Twin-Turbo',
        horsePower: 542,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Coupe',
        driveType: 'All Wheel Drive',
        seats: 4,
        doors: 2,
        topSpeed: '318 KM/H',
        acceleration100: 'APPROXIMATELY 3.9 S',
        powerKW: '404 kW',
        powerPS: '542 PS',
        torque: '770 NM',
        weight: '2165 KG',
        wheelbase: '2.851 M',
        wheelSize: '21 Inch Five-Spoke',
        brakeColor: 'Red'
      },
      // Enhanced performance data from SPA
      performanceData: {
        engine: '4.0L V8 Twin-Turbo',
        horsePower: '542 hp @ 6,000 rpm',
        torque: '770 Nm @ 1,960-4,500 rpm',
        acceleration060: '3.9 seconds',
        topSpeed: '198 mph (318 km/h)',
        transmission: '8-speed dual-clutch',
        driveType: 'All-wheel drive',
        weight: '2,165 kg'
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control'
        ]
      },
      standardEquipment: [
        'Engine start/stop button',
        'Bentley Online services',
        'Bentley Teleservices',
        'Brake force display',
        'Digital Radio'
      ],
      // Popular configurations from SPA (without prices)
      addedOptions: [
        'Touring Specification',
        'Naim For Bentley Audio',
        'City Specification',
        'Rotating Display',
        'Front Seat Comfort Specification',
        'Contrast Stitching',
        'Bentley Dynamic Ride',
        'Sports Exhaust',
        'Mood Lighting'
      ],
      description: 'The Bentley Continental GT V8 is the ultimate expression of power and elegance.',
      isAvailable: true,
    }
  ];

  for (const car of buyCars) {
    await prisma.buyCar.create({
      data: {
        ...car,
        specifications: JSON.stringify(car.specifications),
        performanceData: JSON.stringify(car.performanceData),
        features: JSON.stringify(car.features),
        standardEquipment: JSON.stringify(car.standardEquipment),
        addedOptions: JSON.stringify(car.addedOptions)
      }
    });
  }

  // Add image references for purchase cars
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 11; j++) {
      await prisma.buyCarImage.create({
        data: {
          url: `car${i}/pov${j}.jpg`,
          carId: `car${i}`,
          isMain: j === 1
        }
      });
    }
  }

  // Create rental cars - NOW ALIGNED WITH BUY CARS (same makes/models)
  const rentalCars = [
    {
      id: 'rent1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      hourlyRate: 200,
      dailyRate: 2000,
      weeklyRate: 12000,
      baseMSRP: 175000,
      specifications: {
        color: 'Pearl White',
        interiorColor: 'Red/Black',
        mileage: 5000,
        engine: '6.0 L V8 Biturbo',
        horsePower: 542,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'SUV',
        driveType: 'All Wheel Drive',
        seats: 5,
        doors: 4
      },
      performanceData: {
        engine: '6.0L V8 Biturbo',
        horsePower: '542 hp @ 6,000 rpm',
        torque: '770 Nm @ 1,960-4,500 rpm',
        acceleration060: '4.0 seconds',
        topSpeed: '290 km/h',
        transmission: '8-speed automatic',
        driveType: 'All Wheel Drive',
        weight: '2410 kg'
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Heated Seats'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control'
        ]
      },
      description: 'The Bentley Bentayga V8 BLACK EDITION rental experience combines luxury with performance.',
      isAvailable: true,
    },
    {
      id: 'rent2',
      make: 'Rolls Royce',
      model: 'Cullinan V12',
      trim: 'BLACK BADGE',
      year: 2022,
      hourlyRate: 250,
      dailyRate: 2500,
      weeklyRate: 15000,
      baseMSRP: 395000,
      specifications: {
        color: 'Dark Grey',
        interiorColor: 'Black',
        mileage: 3500,
        engine: '6.75L V12',
        horsePower: 591,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'SUV',
        driveType: 'All Wheel Drive',
        seats: 5,
        doors: 4
      },
      performanceData: {
        engine: '6.75L V12',
        horsePower: '591 hp @ 5,000 rpm',
        torque: '850 Nm @ 1,600-4,000 rpm',
        acceleration060: '5.0 seconds',
        topSpeed: '250 km/h',
        transmission: '8-speed automatic',
        driveType: 'All Wheel Drive',
        weight: '2735 kg'
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Rear Seat Entertainment'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Panoramic Sunroof'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Adaptive Cruise Control'
        ]
      },
      description: 'The Rolls Royce Cullinan V12 BLACK BADGE rental offers unparalleled luxury and comfort.',
      isAvailable: true,
    },
    {
      id: 'rent3',
      make: 'Bentley',
      model: 'Continental GT V8',
      trim: 'Continental GT V8',
      year: 2022,
      hourlyRate: 180,
      dailyRate: 1800,
      weeklyRate: 10800,
      baseMSRP: 175000,
      specifications: {
        color: 'Blue',
        interiorColor: 'Cream',
        mileage: 2000,
        engine: '4.0L V8 Twin-Turbo',
        horsePower: 542,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Coupe',
        driveType: 'All Wheel Drive',
        seats: 4,
        doors: 2
      },
      performanceData: {
        engine: '4.0L V8 Twin-Turbo',
        horsePower: '542 hp @ 6,000 rpm',
        torque: '770 Nm @ 1,960-4,500 rpm',
        acceleration060: '3.9 seconds',
        topSpeed: '198 mph (318 km/h)',
        transmission: '8-speed dual-clutch',
        driveType: 'All-wheel drive',
        weight: '2,165 kg'
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Heated Seats'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control'
        ]
      },
      description: 'The Bentley Continental GT V8 rental delivers an exhilarating grand touring experience.',
      isAvailable: true,
    }
  ];

  for (const car of rentalCars) {
    await prisma.rentalCar.create({
      data: {
        ...car,
        specifications: JSON.stringify(car.specifications),
        performanceData: JSON.stringify(car.performanceData),
        features: JSON.stringify(car.features)
      }
    });
  }

  // Add rental car images (reusing same car images since they're the same models)
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 11; j++) {
      await prisma.rentalCarImage.create({
        data: {
          url: `car${i}/pov${j}.jpg`,
          carId: `rent${i}`,
          isMain: j === 1
        }
      });
    }
  }

  console.log('Database seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });