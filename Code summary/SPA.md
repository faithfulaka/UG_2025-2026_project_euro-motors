
I'll give you a quick rundown of the project. The user can buy a car by getting a quote first for all the cars in the database. I want the admin to be able to add and delete cars (both rental and purchased) in the database and on the website simultaneously by just adding them from their admin page. I also want the admin to be able to add information from a scraper that will be set up for them, allowing them to use this info when searching for a car. They should be able to add a new car with this information and any additional info manually (we will discuss the code for that later).

Users can buy a car and trade in their current car for one we have on the site, so data like the price of my car needs to be able to be fetched directly when I want to calculate the deposit and monthly payment.

If a user wants to buy or rent a particular car, the request is sent to the admin along with the email of the logged-in user. If they decide to trade in, all their trade-in info will be sent, along with the car they want to buy.

THE ABOVE IS ONLY FOR YOU TO HAVE A BETTER UNDRSTANDING THAT IS ALL

First, I want to confirm the full info below is the same one the Supercar Pricing Aggregator would give was to get full info, not just price-related ones, as said in the MD file. 

🔍 COMPREHENSIVE DATA: Bentley Continental GT V8

=== BASIC SPECIFICATIONS ===
Make: Bentley
Model: Continental GT V8
Year: 2022
Body Type: Coupe
Colour Options: 16 standard, 85+ bespoke options
VIN Pattern: SCBXX***CX***

=== PERFORMANCE ===
Engine: 4.0L V8 Twin-Turbo
Horsepower: 542 hp @ 6,000 rpm
Torque: 770 Nm @ 1,960-4,500 rpm
0-60 mph: 3.9 seconds
Top Speed: 198 mph (318 km/h)
Transmission: 8-speed dual-clutch
Drive Type: All-wheel drive
Weight: 2,165 kg
Fuel Economy: 23.3 mpg combined

=== PRICING DATA ===
Base MSRP: £175,000
Current Market Range: £170,500 - £182,000
Average Dealer Price: £174,995
Dealer Inventory Count: 8 vehicles nationwide
Price Trend: Stable (±1.5% last 30 days)

=== AUCTION HISTORY ===
Recent Sales: 5 in last 6 months
Average Auction Price: £155,200
Highest Sale: £168,500 (1,200 miles)
Lowest Sale: £142,000 (12,500 miles)
Common Auction Notes: "Mulliner Driving Specification," "First Edition"

=== POPULAR CONFIGURATIONS ===
Base Price: £175,000
Most Selected Options:
  - Touring Specification: £6,500
  - Naim For Bentley Audio: £8,800
  - City Specification: £4,200
  - Rotating Display: £5,100
  - Front Seat Comfort Specification: £3,900
  - Contrast Stitching: £1,800
Most Popular Exterior Color: Glacier White
Most Popular Interior: Beluga/Linen two-tone

=== DEPRECIATION & VALUE ===
Year 1: -15% (Est. Value: £148,750)
Year 3: -35% (Est. Value: £113,750)
Year 5: -48% (Est. Value: £91,000)
Residual Value Rating: Good (compared to segment)
Rare Options That Improve Resale: Rotating Display, First Edition

=== DEALER DATA ===
Average Days on Market: 42
Current UK Inventory: 14 units
Most Common Dealer Add-Ons: Ceramic Coating, Extended Warranty

=== COMPETING MODELS ===
Primary Competitors:
  - Aston Martin DB11 (Avg. Price: £159,000)
  - Ferrari Roma (Avg. Price: £201,000)
  - McLaren GT (Avg. Price: £169,000)
  - Porsche 911 Turbo (Avg. Price: £155,000)
Price Position: Mid-range for the segment

=== WARRANTY & MAINTENANCE ===
Factory Warranty: 3 years/unlimited mileage
Extended Options: Up to 5 years available
Est. Annual Maintenance: £3,500-£5,000
Common Service Items: Brake pads (£1,800), Annual service (£1,200)

=== OWNERSHIP COSTS ===
Insurance Group: 50
Annual Road Tax: £580 (luxury vehicle tax)
Typical Financing: 4.9% APR (£3,120/month with 20% down, 48 months)
Fuel Cost: Approx. £4,200/year (10,000 miles)




Firstly, I want stand stand-alone Supercar Pricing Aggregator page where the full  COMPREHENSIVE DATA so the admin can get full information on the cars. I also want the user  to be able to do this, but FOR NOW, FOCUS ON JUST THE ADMIN

using ONLY the info I extracted, COMPREHENSIVE DATA SHOWN BELOW , I want us to do 4 things Secondly. I want to integrate the relevant info from the Supercar Pricing Aggregator to the schema, seed.js, and all relevant files and folders as well database just the project as while adding and changing what is need in types and in the codes as well. 



=== BASIC SPECIFICATIONS ===
Make: Bentley
Model: Continental GT V8
Year: 2022
Body Type: Coupe 
=== PERFORMANCE ===
Engine: 4.0L V8 Twin-Turbo
Horsepower: 542 hp @ 6,000 rpm
Torque: 770 Nm @ 1,960-4,500 rpm
0-60 mph: 3.9 seconds
Top Speed: 198 mph (318 km/h)
Transmission: 8-speed dual-clutch
Drive Type: All-wheel drive
Weight: 2,165 kg

=== PRICING DATA === Base MSRP: Dealer Price: £174,995 (It is the same thing as price in the database, so integrate it with that)

=== POPULAR CONFIGURATIONS ===
Base Price: £175,000
Most Selected Options:
  - Touring Specification: £6,500
  - Naim For Bentley Audio: £8,800
  - City Specification: £4,200
  - Rotating Display: £5,100
  - Front Seat Comfort Specification: £3,900
  - Contrast Stitching: £1,800
(Remove the prices  included  in POPULAR CONFIGURATIONS and get as many as you can so the output  can be integrated with added options, so everything under Most Selected Options:, will be under added options instead)



NOTE: ALL CARS ON THIS WEBSITE ARE NEW SO  NEED TO ASK ANYWHERE
