// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  // Create cars for sale
  const buyCarData = [
    {
      id: 'car1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      color: 'Pearl White',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 169990,
      specifications: JSON.stringify({
        color: 'Pearl White',
        interiorColor: 'Red/Black',
        mileage: 0,
        engine: '6.0 L V8 Biturbo',
        horsePower: 542,
        torque: '770 NM',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        driveType: 'All Wheel Drive',
        topSpeed: '290 KM/H',
        acceleration100: 'APPROXIMATELY 4.0 S',
        acceleration60: 'APPROXIMATELY 1.9 S',
        bodyType: 'SUV',
        seats: 5,
        doors: 4,
        weight: '2410 KG',
        wheelbase: '2.995 M',
        wheelSize: '22 Inch Ten Spoke',
        brakeColor: 'Red',
        powerKW: '404 kW',
        powerPS: '549 PS',
        steeringType: 'Left Hand Drive (LHD)',
      }),
      features: JSON.stringify({
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Heated Seats',
          'Ventilated Seats',
          'Premium Sound System',
          'Sunroof',
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors',
          'Power Liftgate',
          'Panoramic Roof',
          'Adaptive Suspension',
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Lane Departure Warning',
          'Blind Spot Monitoring',
          'Adaptive Cruise Control',
        ],
      }),
      standardEquipment: JSON.stringify([
        'Engine start/stop button',
        'Bentley Online services',
        'Bentley Teleservices',
        'Brake force display',
        'Digital Radio',
        'Oil level indicator',
        'Bentley Rear Entertainment',
        'On board diagnostics',
        'Temperature Display',
        'Hands Free Tailgate',
      ]),
      addedOptions: JSON.stringify([
        'Touring Specification',
        'Bentley Dynamic Ride',
        'Five Seat Comfort Specification',
        'Sports Exhaust',
        'Naim For Bentley',
        'Embroidered Bentley Emblems',
        'Heated, Acoustic, IR Front Screen',
        'Jewel Fuel Filler Cap',
        'Heated, Duo Tone, 3 Spoke, Hide Trimmed Steering Wheel',
        'Deep Pile Overmats to Front and Rear',
      ]),
      description: 'The Bentley Bentayga V8 BLACK EDITION offers an unparalleled luxury SUV experience with its powerful 6.0L V8 Biturbo engine, delivering 542 horsepower and a top speed of 290 km/h. This brand new 2022 model features pearl white exterior with a striking red/black interior and comes with premium options including the Touring Specification and Naim audio system.',
      isAvailable: true,
    },
    {
      id: 'car2',
      make: 'Rolls Royce',
      model: 'Cullinan V12',
      trim: 'BLACK BADGE',
      year: 2022,
      color: 'Dark Grey',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 380000,
      specifications: JSON.stringify({
        color: 'Dark Grey',
        interiorColor: 'Black',
        mileage: 0,
        engine: '6.75L V12',
        horsePower: 591,
        torque: '900 NM',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        driveType: 'All Wheel Drive',
        topSpeed: '250 KM/H',
        acceleration100: 'APPROXIMATELY 4.9 S',
        bodyType: 'SUV',
        seats: 5,
        doors: 4,
        weight: '2660 KG',
        wheelbase: '3.295 M',
        wheelSize: '22 Inch Alloy',
        brakeColor: 'Black',
        powerKW: '441 kW',
        powerPS: '600 PS',
        steeringType: 'Right Hand Drive (RHD)',
      }),
      features: JSON.stringify({
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Heated Seats',
          'Ventilated Seats',
          'Premium Sound System',
          'Starlight Headliner',
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors',
          'Power Liftgate',
          'Panoramic Roof',
          'Adaptive Suspension',
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Lane Departure Warning',
          'Blind Spot Monitoring',
          'Adaptive Cruise Control',
          'Night Vision',
        ],
      }),
      standardEquipment: JSON.stringify([
        'Engine start/stop button',
        'Rolls-Royce Connect',
        'Brake force display',
        'Digital Radio',
        'Oil level indicator',
        'Rear Entertainment',
        'On board diagnostics',
        'Temperature Display',
        'Umbrellas in rear doors',
      ]),
      addedOptions: JSON.stringify([
        'Black Badge Package',
        'Technical Fiber Trim',
        'Bespoke Audio',
        'Rear Theatre Configuration',
        'Picnic Tables',
        'Lambswool Floor Mats',
        'Illuminated Treadplates',
        'Shooting Star Headliner',
      ]),
      description: 'The Rolls-Royce Cullinan BLACK BADGE is the most capable luxury SUV in the world. With the 6.75L V12 engine producing 591 horsepower, this all-terrain vehicle delivers effortless luxury in any environment. The Dark Grey exterior paired with a sumptuous black interior creates an imposing presence on the road.',
      isAvailable: true,
    },
    {
      id: 'car3',
      make: 'Bentley',
      model: 'Continental GT V8',
      trim: 'Continental GT V8',
      year: 2022,
      color: 'Blue',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 175000,
      specifications: JSON.stringify({
        color: 'Blue',
        interiorColor: 'Cream',
        mileage: 0,
        engine: '4.0L V8 Twin-Turbo',
        horsePower: 542,
        torque: '770 NM',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        driveType: 'All Wheel Drive',
        topSpeed: '318 KM/H',
        acceleration100: 'APPROXIMATELY 3.9 S',
        bodyType: 'Coupe',
        seats: 4,
        doors: 2,
        weight: '2165 KG',
        wheelbase: '2.851 M',
        wheelSize: '21 Inch Five-Spoke',
        brakeColor: 'Red',
        powerKW: '404 kW',
        powerPS: '542 PS',
        steeringType: 'Left Hand Drive (LHD)',
      }),
      features: JSON.stringify({
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Heated Seats',
          'Ventilated Seats',
          'Premium Sound System',
          'Rotating Display',
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors',
          'Panoramic Roof',
          'Adaptive Suspension',
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Lane Departure Warning',
          'Blind Spot Monitoring',
          'Adaptive Cruise Control',
        ],
      }),
      standardEquipment: JSON.stringify([
        'Engine start/stop button',
        'Bentley Online services',
        'Bentley Teleservices',
        'Brake force display',
        'Digital Radio',
        'Oil level indicator',
        'On board diagnostics',
        'Temperature Display',
        'Adaptive Cruise Control',
      ]),
      addedOptions: JSON.stringify([
        'Touring Specification',
        'Bentley Dynamic Ride',
        'Sports Exhaust',
        'Naim For Bentley',
        'Rotating Display',
        'Mood Lighting',
        'City Specification',
        'Front Seat Comfort Specification',
        'Contrast Stitching',
        'Deep Pile Overmats',
      ]),
      description: 'The Bentley Continental GT V8 is the perfect grand tourer, combining breathtaking performance with exquisite luxury and cutting-edge technology. This 2022 model features a stunning blue exterior finish and a cream leather interior, delivering an unmatched driving experience with its powerful 4.0L V8 Twin-Turbo engine and sophisticated all-wheel drive system.',
      isAvailable: true,
    },
  ];

  // Insert cars for sale and create image references
  for (const carData of buyCarData) {
    const car = await prisma.buyCar.create({
      data: {
        id: carData.id,
        make: carData.make,
        model: carData.model,
        trim: carData.trim,
        year: carData.year,
        price: carData.price,
        specifications: carData.specifications,
        features: carData.features,
        standardEquipment: carData.standardEquipment,
        addedOptions: carData.addedOptions,
        description: carData.description,
        isAvailable: carData.isAvailable,
      },
    });

    // For each car, create 11 image references (pov1.jpg to pov11.jpg)
    for (let i = 1; i <= 11; i++) {
      await prisma.buyCarImage.create({
        data: {
          url: `/${carData.id}/pov${i}.jpg`,
          carId: car.id,
          isMain: i === 1, // First image is the main one
        },
      });
    }
  }

  // Create rental cars
  const rentalCarData = [
    {
      id: 'car1',
      make: 'Ferrari',
      model: '488 GTB',
      year: 2022,
      color: 'Red',
      mileage: 5000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      hourlyRate: 120,
      dailyRate: 1200,
      weeklyRate: 7000,
      specifications: JSON.stringify({
        color: 'Red',
        interiorColor: 'Black',
        mileage: 5000,
        engine: '3.9L V8 Twin-Turbo',
        horsePower: 661,
        torque: '760 NM',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        driveType: 'Rear-Wheel Drive',
        topSpeed: '330 KM/H',
        acceleration100: 'APPROXIMATELY 3.0 S',
        bodyType: 'Coupe',
        seats: 2,
        doors: 2,
        weight: '1475 KG',
        wheelbase: '2.650 M',
        wheelSize: '20 Inch Forged',
        brakeColor: 'Red',
        powerKW: '492 kW',
        powerPS: '670 PS',
        steeringType: 'Left Hand Drive (LHD)',
      }),
      features: JSON.stringify({
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Carbon Fiber Trim',
          'Sports Steering Wheel',
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors',
          'Carbon Fiber Accents',
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Electronic Stability Control',
        ],
      }),
      description: 'The Ferrari 488 GTB is a mid-engine sports car produced by the Italian automobile manufacturer Ferrari. Experience the thrill of driving this incredible machine with its twin-turbocharged V8 engine producing 660 horsepower.',
      isAvailable: true,
    },
    {
      id: 'car2',
      make: 'Lamborghini',
      model: 'Huracan',
      year: 2022,
      color: 'Blue',
      mileage: 3500,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      hourlyRate: 100,
      dailyRate: 1000,
      weeklyRate: 6000,
      specifications: JSON.stringify({
        color: 'Blue',
        interiorColor: 'Black/Blue',
        mileage: 3500,
        engine: '5.2L V10',
        horsePower: 610,
        torque: '560 NM',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        driveType: 'All Wheel Drive',
        topSpeed: '325 KM/H',
        acceleration100: 'APPROXIMATELY 3.2 S',
        bodyType: 'Coupe',
        seats: 2,
        doors: 2,
        weight: '1422 KG',
        wheelbase: '2.620 M',
        wheelSize: '20 Inch',
        brakeColor: 'Black',
        powerKW: '449 kW',
        powerPS: '610 PS',
        steeringType: 'Left Hand Drive (LHD)',
      }),
      features: JSON.stringify({
        interior: [
          'Alcantara Seats',
          'Climate Control',
          'Navigation System',
          'Carbon Fiber Trim',
          'Flat-Bottom Steering Wheel',
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors',
          'Rear Wing',
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Electronic Stability Control',
        ],
      }),
      description: 'The Lamborghini Huracán is a sports car manufactured by Italian automotive manufacturer Lamborghini. Experience the incredible performance of its naturally aspirated V10 engine, delivering a thrilling driving experience.',
      isAvailable: true,
    },
    {
      id: 'car3',
      make: 'Rolls Royce',
      model: 'Ghost',
      year: 2023,
      color: 'Black',
      mileage: 2000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      hourlyRate: 150,
      dailyRate: 1500,
      weeklyRate: 9000,
      specifications: JSON.stringify({
        color: 'Black',
        interiorColor: 'White',
        mileage: 2000,
        engine: '6.75L V12 Twin-Turbo',
        horsePower: 563,
        torque: '850 NM',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        driveType: 'All Wheel Drive',
        topSpeed: '250 KM/H',
        acceleration100: 'APPROXIMATELY 4.8 S',
        bodyType: 'Sedan',
        seats: 5,
        doors: 4,
        weight: '2490 KG',
        wheelbase: '3.295 M',
        wheelSize: '21 Inch',
        brakeColor: 'Silver',
        powerKW: '420 kW',
        powerPS: '571 PS',
        steeringType: 'Right Hand Drive (RHD)',
      }),
      features: JSON.stringify({
        interior: [
          'Leather Seats',
          'Climate Control',
          'Navigation System',
          'Heated Seats',
          'Ventilated Seats',
          'Premium Sound System',
          'Starlight Headliner',
        ],
        exterior: [
          'Alloy Wheels',
          'LED Headlights',
          'Parking Sensors',
          'Power Doors',
        ],
        safety: [
          'ABS',
          'Airbags',
          'Traction Control',
          'Lane Departure Warning',
          'Blind Spot Monitoring',
          'Adaptive Cruise Control',
          'Night Vision',
        ],
      }),
      description: 'The Rolls-Royce Ghost is a full-sized luxury car manufactured by Rolls-Royce Motor Cars. Experience the height of automotive luxury with its exquisite craftsmanship, refined performance, and state-of-the-art technology.',
      isAvailable: true,
    },
  ];

  // Insert rental cars and create image references
  for (const carData of rentalCarData) {
    const car = await prisma.rentalCar.create({
      data: {
        id: carData.id,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        hourlyRate: carData.hourlyRate,
        dailyRate: carData.dailyRate,
        weeklyRate: carData.weeklyRate,
        specifications: carData.specifications,
        features: carData.features,
        description: carData.description,
        isAvailable: carData.isAvailable,
      },
    });

    // For each car, create 11 image references (pov1.jpg to pov11.jpg)
    for (let i = 1; i <= 11; i++) {
      await prisma.rentalCarImage.create({
        data: {
          url: `/${carData.id}/pov${i}.jpg`,
          carId: car.id,
          isMain: i === 1, // First image is the main one
        },
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