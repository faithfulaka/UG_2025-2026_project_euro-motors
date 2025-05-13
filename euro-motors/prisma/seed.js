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

  // Create purchase cars
  const buyCars = [
    {
      id: 'car1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      price: 169990,
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
        'Bentley Online services'
      ],
      addedOptions: [
        'Touring Specification',
        'Bentley Dynamic Ride'
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
        'Self-levelling air suspension'
      ],
      addedOptions: [
        'Rear Theatre Configuration',
        'Bespoke Audio'
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
      price: 175000,
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
        'Bentley Online services'
      ],
      addedOptions: [
        'Touring Specification',
        'Bentley Dynamic Ride'
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

  // Create rental cars
  const rentalCars = [
    {
      id: 'rent1',
      make: 'Ferrari',
      model: '488 GTB',
      year: 2022,
      hourlyRate: 120,
      dailyRate: 1200,
      weeklyRate: 7000,
      specifications: {
        color: 'Red',
        interiorColor: 'Black',
        mileage: 5000,
        engine: '3.9L V8 Twin-Turbo',
        horsePower: 661,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Coupe',
        driveType: 'Rear-Wheel Drive',
        seats: 2,
        doors: 2
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control'
        ]
      },
      description: 'The Ferrari 488 GTB is a mid-engine sports car produced by the Italian automobile manufacturer Ferrari.',
      isAvailable: true,
    },
    {
      id: 'rent2',
      make: 'Lamborghini',
      model: 'Huracan',
      year: 2022,
      hourlyRate: 100,
      dailyRate: 1000,
      weeklyRate: 6000,
      specifications: {
        color: 'Blue',
        interiorColor: 'Black',
        mileage: 3500,
        engine: '5.2L V10',
        horsePower: 602,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Coupe',
        driveType: 'Rear-Wheel Drive',
        seats: 2,
        doors: 2
      },
      features: {
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System'
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control'
        ]
      },
      description: 'The Lamborghini Huracan is a high-performance sports car with a naturally aspirated V10 engine.',
      isAvailable: true,
    },
    {
      id: 'rent3',
      make: 'Rolls Royce',
      model: 'Ghost',
      year: 2023,
      hourlyRate: 150,
      dailyRate: 1500,
      weeklyRate: 9000,
      specifications: {
        color: 'Black',
        interiorColor: 'White',
        mileage: 2000,
        engine: '6.75L V12',
        horsePower: 563,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Sedan',
        driveType: 'Rear-Wheel Drive',
        seats: 5,
        doors: 4
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
          'LED Headlights'
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Adaptive Cruise Control'
        ]
      },
      description: 'The Rolls-Royce Ghost is a luxury sedan known for its refined elegance and smooth ride.',
      isAvailable: true,
    }
  ];

  for (const car of rentalCars) {
    await prisma.rentalCar.create({
      data: {
        ...car,
        specifications: JSON.stringify(car.specifications),
        features: JSON.stringify(car.features)
      }
    });
  }

  // Add rental car images
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