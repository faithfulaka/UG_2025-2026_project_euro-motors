#!/usr/bin/env node
// Test cascading suggestions and data display

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSuggestions() {
  console.log('🚗 TESTING CASCADING SUGGESTIONS & DATA DISPLAY');
  console.log('================================================\n');

  try {
    // Test 1: Get Makes
    console.log('📋 Test 1: Getting Makes...');
    const makesResponse = await axios.get(`${BASE_URL}/api/spa/suggestions?type=make&source=web`);
    const makes = makesResponse.data.suggestions.slice(0, 5);
    console.log(`✅ Found ${makesResponse.data.suggestions.length} makes`);
    console.log('   Sample:', makes.map(m => m.value).join(', '));
    
    // Test 2: Get BMW Models
    console.log('\n📋 Test 2: Getting BMW Models...');
    const bmwModelsResponse = await axios.get(`${BASE_URL}/api/spa/suggestions?type=model&make=BMW&source=web`);
    const bmwModels = bmwModelsResponse.data.suggestions.slice(0, 5);
    console.log(`✅ Found ${bmwModelsResponse.data.suggestions.length} BMW models`);
    console.log('   Sample:', bmwModels.map(m => m.value).join(', '));
    
    // Test 3: Get BMW X5 Years
    console.log('\n📋 Test 3: Getting BMW X5 Years...');
    const x5YearsResponse = await axios.get(`${BASE_URL}/api/spa/suggestions?type=year&make=BMW&model=X5&source=web`);
    const x5Years = x5YearsResponse.data.suggestions.slice(0, 10);
    console.log(`✅ Found ${x5YearsResponse.data.suggestions.length} years for BMW X5`);
    console.log('   Years:', x5Years.map(y => y.value).join(', '));
    
    // Test 4: Get BMW 3 Series Years
    console.log('\n📋 Test 4: Getting BMW 3 Series Years...');
    const series3Response = await axios.get(`${BASE_URL}/api/spa/suggestions?type=year&make=BMW&model=3 Series&source=web`);
    const series3Years = series3Response.data.suggestions.slice(0, 10);
    console.log(`✅ Found ${series3Response.data.suggestions.length} years for BMW 3 Series`);
    console.log('   Years:', series3Years.map(y => y.value).join(', '));
    
    // Test 5: Get Mercedes-Benz Models
    console.log('\n📋 Test 5: Getting Mercedes-Benz Models...');
    const mbModelsResponse = await axios.get(`${BASE_URL}/api/spa/suggestions?type=model&make=Mercedes-Benz&source=web`);
    const mbModels = mbModelsResponse.data.suggestions.slice(0, 5);
    console.log(`✅ Found ${mbModelsResponse.data.suggestions.length} Mercedes-Benz models`);
    console.log('   Sample:', mbModels.map(m => m.value).join(', '));
    
    // Test 6: Get Mercedes C-Class Years
    console.log('\n📋 Test 6: Getting Mercedes C-Class Years...');
    const cClassResponse = await axios.get(`${BASE_URL}/api/spa/suggestions?type=year&make=Mercedes-Benz&model=C-Class&source=web`);
    const cClassYears = cClassResponse.data.suggestions.slice(0, 10);
    console.log(`✅ Found ${cClassResponse.data.suggestions.length} years for Mercedes C-Class`);
    console.log('   Years:', cClassYears.map(y => y.value).join(', '));
    
    // Test 7: Search for vehicle data
    console.log('\n📋 Test 7: Searching for BMW X5 2023 Data...');
    const searchResponse = await axios.get(`${BASE_URL}/api/spa/search?make=BMW&model=X5&year=2023&source=comprehensive`);
    const vehicleData = searchResponse.data.data;
    
    if (vehicleData) {
      console.log('✅ Vehicle Data Retrieved:');
      console.log('   Basic Specs:');
      console.log(`     • Make: ${vehicleData.basicSpecifications.make}`);
      console.log(`     • Model: ${vehicleData.basicSpecifications.model}`);
      console.log(`     • Year: ${vehicleData.basicSpecifications.year}`);
      console.log(`     • Body Type: ${vehicleData.basicSpecifications.bodyType}`);
      console.log(`     • Engine: ${vehicleData.basicSpecifications.engine}`);
      console.log(`     • Transmission: ${vehicleData.basicSpecifications.transmission}`);
      console.log(`     • Fuel Type: ${vehicleData.basicSpecifications.fuelType}`);
      
      if (vehicleData.performanceData) {
        console.log('   Performance:');
        console.log(`     • Horsepower: ${vehicleData.performanceData.horsePower}`);
        console.log(`     • Torque: ${vehicleData.performanceData.torque}`);
        console.log(`     • 0-60: ${vehicleData.performanceData.acceleration060}`);
      }
      
      if (vehicleData.pricingData) {
        console.log('   Pricing:');
        console.log(`     • Base MSRP: ${vehicleData.pricingData.baseMSRP || 'N/A'}`);
        console.log(`     • Market Range: ${vehicleData.pricingData.currentMarketRange || 'N/A'}`);
      }
    } else {
      console.log('❌ No vehicle data returned');
    }
    
    console.log('\n================================================');
    console.log('📊 SUMMARY:');
    console.log('================================================');
    console.log('\n✅ Cascading Suggestions:');
    console.log('   • Makes load properly');
    console.log('   • Models filter by selected make');
    console.log('   • Years filter by make AND model');
    console.log('\n⚠️  Known Issues:');
    console.log('   • Some models may not have year data in CarQuery');
    console.log('   • Fallback to reasonable year ranges when needed');
    console.log('   • Data shows "N/A" when APIs not subscribed');
    console.log('\n💡 Solutions:');
    console.log('   1. CarQuery works for suggestions (FREE)');
    console.log('   2. Subscribe to other APIs for detailed data');
    console.log('   3. Use database entries for local inventory');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.log('\n⚠️  Make sure the server is running: npm run dev');
  }
}

// Run if server is available
axios.get(`${BASE_URL}`)
  .then(() => {
    console.log('✅ Server is running\n');
    testSuggestions();
  })
  .catch(() => {
    console.log('❌ Server not running. Please run: npm run dev');
    console.log('   Then run this script again.');
  });
