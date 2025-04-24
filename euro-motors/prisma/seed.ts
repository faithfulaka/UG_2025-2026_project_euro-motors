// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - use with caution in production)
  await prisma.buyCarImage.deleteMany();
  await prisma.buyCar.deleteMany();
  await prisma.rentalCarImage.deleteMany();
  await prisma.rentalCar.deleteMany();

  console.log('Cleared existing data');

  // ====================================
  // === BUY CARS ===
  // ====================================
  
  // Bentley Bentayga
  await prisma.buyCar.create({
    data: {
      id: 'car1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      price: 169990,
      specifications: JSON.stringify({
        color: "Pearl White",
        interiorColor: "Red/Black",
        mileage: 0,
        colorOptions: 3,
        engine: "6.0 L V8 Biturbo",
        horsePower: 542,
        torque: "770 NM",
        fuelType: "Petrol",
        transmission: "Automatic",
        driveType: "All Wheel Drive",
        fuelEconomy: "21.7 mpg combined",
        topSpeed: "290 KM/H",
        acceleration100: "APPROXIMATELY 4.0 S",
        acceleration60: "APPROXIMATELY 1.9 S",
        powerKW: "404 kW",
        powerPS: "549 PS",
        powerRPM: "6,000 rpm",
        torqueRange: "1,960-4,500 rpm",
        bodyType: "SUV",
        seats: 5,
        doors: 4,
        weight: "2410 KG",
        wheelbase: "2.995 M",
        wheelSize: "22 Inch Ten Spoke",
        brakeColor: "Red",
        steeringType: "Left Hand Drive (LHD)"
      }),
      features: JSON.stringify({
        interior: ["Leather Seats", "Climate Control", "Navigation System", "Heated Seats", "Ventilated Seats", "Panoramic Roof"],
        exterior: ["Alloy Wheels", "LED Headlights", "Parking Sensors", "Power Tailgate", "Roof Rails", "Privacy Glass"],
        safety: ["ABS", "Airbags", "Traction Control", "Lane Departure Warning", "Blind Spot Monitor", "Adaptive Cruise Control"]
      }),
      standardEquipment: JSON.stringify([
        "Engine start/stop button", 
        "Bentley Online services", 
        "Bentley Teleservices", 
        "Brake force display", 
        "Digital Radio", 
        "Oil level indicator", 
        "Bentley Rear Entertainment", 
        "On board diagnostics", 
        "Temperature Display", 
        "Hands Free Tailgate"
      ]),
      addedOptions: JSON.stringify([
        "Touring Specification", 
        "Embroidered Bentley Emblems", 
        "Bentley Dynamic Ride", 
        "Gloss Black Matrix Style Grille to Lower Bumper Apertures", 
        "Five Seat Comfort Specification", 
        "Heated, Acoustic, IR Front Screen", 
        "Sports Exhaust", 
        "Jewel Fuel Filler Cap", 
        "Naim For Bentley", 
        "Heated, Duo Tone, 3 Spoke, Hide Trimmed Steering Wheel", 
        "Mood Lighting", 
        "Comfort Headrests to Rear Outer Seats", 
        "LED Welcome Lamps", 
        "Deep Pile Overmats to Front and Rear", 
        "Top View Camera", 
        "Electrically Operated Blinds for Rear Side Windows"
      ]),
      description: 'The Bentley Bentayga V8 BLACK EDITION offers an unparalleled luxury SUV experience with its powerful 6.0L V8 Biturbo engine, delivering 542 horsepower and a top speed of 290 km/h. This brand new 2022 model features pearl white exterior with a striking red/black interior and comes with premium options including the Touring Specification and Naim audio system.',
      isAvailable: true,
      images: {
        create: [
          {
            id: 'img1',
            url: '/images/gallery/component5.jpg',
            isMain: true,
            imageType: 'exterior'
          },
          {
            id: 'img4',
            url: '/images/gallery/bentayga-interior.jpg',
            isMain: false,
            imageType: 'interior'
          }
        ]
      }
    }
  });

  // Rolls Royce Cullinan
  await prisma.buyCar.create({
    data: {
      id: 'car2',
      make: 'Rolls Royce',
      model: 'Cullinan V12',
      trim: 'BLACK BADGE',
      year: 2022,
      price: 380000,
      specifications: JSON.stringify({
        color: "Dark Grey",
        interiorColor: "Black",
        mileage: 0,
        colorOptions: 20,
        engine: "6.75L V12",
        horsePower: 591,
        torque: "900 NM",
        fuelType: "Petrol",
        transmission: "Automatic",
        driveType: "All Wheel Drive",
        fuelEconomy: "18.8 mpg combined",
        topSpeed: "250 KM/H (limited)",
        acceleration100: "APPROXIMATELY 4.9 S",
        acceleration60: "APPROXIMATELY 2.5 S",
        powerKW: "441 kW",
        powerPS: "600 PS",
        powerRPM: "5,250 rpm",
        torqueRange: "1,700-4,500 rpm",
        bodyType: "SUV",
        seats: 5,
        doors: 4,
        weight: "2660 KG",
        wheelbase: "3.295 M",
        wheelSize: "22 Inch Black Alloy",
        brakeColor: "Black",
        steeringType: "Right Hand Drive (RHD)"
      }),
      features: JSON.stringify({
        interior: ["Hand-Crafted Leather", "Starlight Headliner", "Bespoke Audio System", "Refrigerator", "Champagne Cooler", "Lambswool Floor Mats"],
        exterior: ["Pantheon Grille", "Coach Doors", "Illuminated Front Grille", "Electric Retracting Spirit of Ecstasy", "Self-leveling Wheel Centers", "Bespoke Paint Finish"],
        safety: ["Night Vision", "Wildlife & Pedestrian Warning", "Active Cruise Control", "Collision Mitigation", "Traffic Sign Recognition", "Driver Alertness Monitoring"]
      }),
      standardEquipment: JSON.stringify([
        "Satellite Aided Transmission", 
        "Rolls-Royce Connect", 
        "Panoramic Glass Sunroof", 
        "Head-Up Display", 
        "Wifi Hotspot", 
        "Bespoke Clock", 
        "Spirit of Ecstasy Rotary Controller", 
        "Automatic Climate Control", 
        "Air Purification System", 
        "Rear Theatre Configuration"
      ]),
      addedOptions: JSON.stringify([
        "Black Badge Styling Package", 
        "Technical Fibre Trim", 
        "Contrast Stitching", 
        "Bespoke Interior Package", 
        "Extended Leather Headliner", 
        "Shooting Star Headliner", 
        "Night Vision Enhancement", 
        "Bespoke Audio System", 
        "Rear Entertainment System", 
        "Drink Cabinet with Whisky Glasses", 
        "Refrigerator Compartment", 
        "Lambswool Floor Mats", 
        "Umbrellas in Rear Door Storage", 
        "Bespoke Luggage Set", 
        "Rear Privacy Glass", 
        "Illuminated Treadplates"
      ]),
      description: 'The Rolls-Royce Cullinan BLACK BADGE represents the pinnacle of luxury SUVs. With its powerful 6.75L V12 engine, this vehicle delivers effortless performance with 591 horsepower and sophisticated all-wheel drive. The 2022 model features dark grey exterior with black accent details and a hand-crafted interior that sets new standards for luxury and comfort.',
      isAvailable: true,
      images: {
        create: [
          {
            id: 'img2',
            url: '/images/gallery/component4.jpg',
            isMain: true,
            imageType: 'exterior'
          },
          {
            id: 'img5',
            url: '/images/gallery/cullinan-interior.jpg',
            isMain: false,
            imageType: 'interior'
          }
        ]
      }
    }
  });

  // Bentley Continental GT
  await prisma.buyCar.create({
    data: {
      id: 'car3',
      make: 'Bentley',
      model: 'Continental GT V8',
      trim: 'Continental GT V8',
      year: 2022,
      price: 174995,
      specifications: JSON.stringify({
        color: "Blue",
        interiorColor: "Cream",
        mileage: 0,
        colorOptions: 16,
        engine: "4.0L V8 Twin-Turbo",
        horsePower: 542,
        torque: "770 NM",
        fuelType: "Petrol",
        transmission: "8-speed dual-clutch",
        driveType: "All Wheel Drive",
        fuelEconomy: "23.3 mpg combined",
        topSpeed: "318 KM/H",
        acceleration100: "APPROXIMATELY 3.9 S",
        acceleration60: "APPROXIMATELY 1.8 S",
        powerKW: "404 kW",
        powerPS: "542 PS",
        powerRPM: "6,000 rpm",
        torqueRange: "1,960-4,500 rpm",
        bodyType: "Coupe",
        seats: 4,
        doors: 2,
        weight: "2165 KG",
        wheelbase: "2.851 M",
        wheelSize: "21 Inch Five-Spoke",
        brakeColor: "Red",
        steeringType: "Left Hand Drive (LHD)"
      }),
      features: JSON.stringify({
        interior: ["Leather Seats", "Rotating Display", "Panoramic Roof", "Digital Dashboard", "Ambient Lighting", "Diamond Quilted Upholstery"],
        exterior: ["Matrix LED Headlamps", "Chrome Grille", "Power Boot", "Active Rear Spoiler", "Elliptical Tail Lamps", "Sports Exhaust"],
        safety: ["360-degree Camera", "Night Vision", "Lane Assist", "Traffic Sign Recognition", "Pre-sense Safety System", "Adaptive Cruise Control"]
      }),
      standardEquipment: JSON.stringify([
        "Engine start/stop button", 
        "Bentley Online services", 
        "Bentley Teleservices", 
        "Brake force display", 
        "Digital Radio", 
        "Oil level indicator", 
        "Bentley Rear Entertainment", 
        "On board diagnostics", 
        "Temperature Display", 
        "Adaptive Cruise Control"
      ]),
      addedOptions: JSON.stringify([
        "Touring Specification", 
        "Bentley Dynamic Ride", 
        "Sports Exhaust", 
        "Naim For Bentley", 
        "Rotating Display", 
        "Mood Lighting", 
        "City Specification", 
        "Front Seat Comfort Specification", 
        "Contrast Stitching", 
        "Deep Pile Overmats", 
        "LED Welcome Lamps", 
        "Heated 3-Spoke Steering Wheel", 
        "Bentley Signature Audio", 
        "Carbon Ceramic Brakes", 
        "Blackline Specification", 
        "Illuminated Door Sills"
      ]),
      description: 'The Bentley Continental GT V8 is the perfect grand tourer, combining breathtaking performance with exquisite luxury and cutting-edge technology. This 2022 model features a stunning blue exterior finish with a cream leather interior, delivering an unmatched driving experience with its powerful 4.0L V8 Twin-Turbo engine producing 542 horsepower.',
      isAvailable: true,
      images: {
        create: [
          {
            id: 'img3',
            url: '/images/gallery/component6.jpg',
            isMain: true,
            imageType: 'exterior'
          },
          {
            id: 'img6',
            url: '/images/gallery/continental-interior.jpg',
            isMain: false,
            imageType: 'interior'
          }
        ]
      }
    }
  });
  
  // ====================================
  // === RENTAL CARS ===
  // ====================================
  
  // Bentley Bentayga Rental
  await prisma.rentalCar.create({
    data: {
      id: 'rental1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      hourlyRate: 95,
      dailyRate: 950,
      weeklyRate: 5500,
      specifications: JSON.stringify({
        color: "Pearl White",
        interiorColor: "Red/Black",
        mileage: 1500,
        colorOptions: 3,
        engine: "6.0 L V8 Biturbo",
        horsePower: 542,
        torque: "770 NM",
        fuelType: "Petrol",
        transmission: "Automatic",
        driveType: "All Wheel Drive",
        fuelEconomy: "21.7 mpg combined",
        topSpeed: "290 KM/H",
        acceleration100: "APPROXIMATELY 4.0 S",
        acceleration60: "APPROXIMATELY 1.9 S",
        powerKW: "404 kW",
        powerPS: "549 PS",
        powerRPM: "6,000 rpm",
        torqueRange: "1,960-4,500 rpm",
        bodyType: "SUV",
        seats: 5,
        doors: 4,
        weight: "2410 KG",
        wheelbase: "2.995 M",
        wheelSize: "22 Inch Ten Spoke",
        brakeColor: "Red",
        steeringType: "Left Hand Drive (LHD)"
      }),
      features: JSON.stringify({
        interior: ["Leather Seats", "Climate Control", "Navigation System", "Heated Seats", "Ventilated Seats", "Panoramic Roof"],
        exterior: ["Alloy Wheels", "LED Headlights", "Parking Sensors", "Power Tailgate", "Roof Rails", "Privacy Glass"],
        safety: ["ABS", "Airbags", "Traction Control", "Lane Departure Warning", "Blind Spot Monitor", "Adaptive Cruise Control"]
      }),
      description: 'Experience the unparalleled luxury of the Bentley Bentayga V8 BLACK EDITION. This premium SUV features a powerful 6.0L V8 Biturbo engine, delivering 542 horsepower and a top speed of 290 km/h. Available for hourly, daily, or weekly rental.',
      isAvailable: true,
      images: {
        create: [
          {
            id: 'rimg1',
            url: '/images/gallery/component5.jpg',
            isMain: true,
            imageType: 'exterior'
          },
          {
            id: 'rimg4',
            url: '/images/gallery/bentayga-interior.jpg',
            isMain: false,
            imageType: 'interior'
          }
        ]
      }
    }
  });

  // Rolls Royce Cullinan Rental
  await prisma.rentalCar.create({
    data: {
      id: 'rental2',
      make: 'Rolls Royce',
      model: 'Cullinan V12',
      trim: 'BLACK BADGE',
      year: 2022,
      hourlyRate: 150,
      dailyRate: 1500,
      weeklyRate: 9000,
      specifications: JSON.stringify({
        color: "Dark Grey",
        interiorColor: "Black",
        mileage: 800,
        colorOptions: 20,
        engine: "6.75L V12",
        horsePower: 591,
        torque: "900 NM",
        fuelType: "Petrol",
        transmission: "Automatic",
        driveType: "All Wheel Drive",
        fuelEconomy: "18.8 mpg combined",
        topSpeed: "250 KM/H (limited)",
        acceleration100: "APPROXIMATELY 4.9 S",
        acceleration60: "APPROXIMATELY 2.5 S",
        powerKW: "441 kW",
        powerPS: "600 PS",
        powerRPM: "5,250 rpm",
        torqueRange: "1,700-4,500 rpm",
        bodyType: "SUV",
        seats: 5,
        doors: 4,
        weight: "2660 KG",
        wheelbase: "3.295 M",
        wheelSize: "22 Inch Black Alloy",
        brakeColor: "Black",
        steeringType: "Right Hand Drive (RHD)"
      }),
      features: JSON.stringify({
        interior: ["Hand-Crafted Leather", "Starlight Headliner", "Bespoke Audio System", "Refrigerator", "Champagne Cooler", "Lambswool Floor Mats"],
        exterior: ["Pantheon Grille", "Coach Doors", "Illuminated Front Grille", "Electric Retracting Spirit of Ecstasy", "Self-leveling Wheel Centers", "Bespoke Paint Finish"],
        safety: ["Night Vision", "Wildlife & Pedestrian Warning", "Active Cruise Control", "Collision Mitigation", "Traffic Sign Recognition", "Driver Alertness Monitoring"]
      }),
      description: 'Indulge in the epitome of luxury with the Rolls-Royce Cullinan BLACK BADGE. With its powerful 6.75L V12 engine, this rental offers effortless performance with 591 horsepower and sophisticated all-wheel drive. Experience the pinnacle of automotive excellence.',
      isAvailable: true,
      images: {
        create: [
          {
            id: 'rimg2',
            url: '/images/gallery/component4.jpg',
            isMain: true,
            imageType: 'exterior'
          },
          {
            id: 'rimg5',
            url: '/images/gallery/cullinan-interior.jpg',
            isMain: false,
            imageType: 'interior'
          }
        ]
      }
    }
  });

  // Bentley Continental GT Rental
  await prisma.rentalCar.create({
    data: {
      id: 'rental3',
      make: 'Bentley',
      model: 'Continental GT V8',
      trim: 'Continental GT V8',
      year: 2022,
      hourlyRate: 100,
      dailyRate: 1000,
      weeklyRate: 6000,
      specifications: JSON.stringify({
        color: "Blue",
        interiorColor: "Cream",
        mileage: 1200,
        colorOptions: 16,
        engine: "4.0L V8 Twin-Turbo",
        horsePower: 542,
        torque: "770 NM",
        fuelType: "Petrol",
        transmission: "8-speed dual-clutch",
        driveType: "All Wheel Drive",
        fuelEconomy: "23.3 mpg combined",
        topSpeed: "318 KM/H",
        acceleration100: "APPROXIMATELY 3.9 S",
        acceleration60: "APPROXIMATELY 1.8 S",
        powerKW: "404 kW",
        powerPS: "542 PS",
        powerRPM: "6,000 rpm",
        torqueRange: "1,960-4,500 rpm",
        bodyType: "Coupe",
        seats: 4,
        doors: 2,
        weight: "2165 KG",
        wheelbase: "2.851 M",
        wheelSize: "21 Inch Five-Spoke",
        brakeColor: "Red",
        steeringType: "Left Hand Drive (LHD)"
      }),
      features: JSON.stringify({
        interior: ["Leather Seats", "Rotating Display", "Panoramic Roof", "Digital Dashboard", "Ambient Lighting", "Diamond Quilted Upholstery"],
        exterior: ["Matrix LED Headlamps", "Chrome Grille", "Power Boot", "Active Rear Spoiler", "Elliptical Tail Lamps", "Sports Exhaust"],
        safety: ["360-degree Camera", "Night Vision", "Lane Assist", "Traffic Sign Recognition", "Pre-sense Safety System", "Adaptive Cruise Control"]
      }),
      description: 'Rent the perfect grand tourer with the Bentley Continental GT V8. This rental combines breathtaking performance with exquisite luxury and cutting-edge technology. With its powerful 4.0L V8 Twin-Turbo engine producing 542 horsepower, this is the ultimate driving experience.',
      isAvailable: true,
      images: {
        create: [
          {
            id: 'rimg3',
            url: '/images/gallery/component6.jpg',
            isMain: true,
            imageType: 'exterior'
          },
          {
            id: 'rimg6',
            url: '/images/gallery/continental-interior.jpg',
            isMain: false,
            imageType: 'interior'
          }
        ]
      }
    }
  });

  // Count how many records we've created
  const buyCarsCount = await prisma.buyCar.count();
  const rentalCarsCount = await prisma.rentalCar.count();

  console.log('✅ Database seed completed successfully!');
  console.log(`Created ${buyCarsCount} buy cars and ${rentalCarsCount} rental cars`);
}

main()
  .catch((e) => {
    console.error('❌ Database seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });