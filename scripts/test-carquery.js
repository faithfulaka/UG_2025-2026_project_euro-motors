#!/usr/bin/env node
// Test CarQuery API from server-side (avoids CORS issues)

const https = require('https');

function testCarQueryEndpoint(endpoint, description) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${description}`);
    
    const url = `https://www.carqueryapi.com/api/0.3/?${endpoint}&callback=test`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 && data.includes('{')) {
          console.log(`✅ SUCCESS: ${description}`);
          
          // Extract JSON from JSONP
          const jsonMatch = data.match(/test\((.*)\);?$/s);
          if (jsonMatch) {
            try {
              const json = JSON.parse(jsonMatch[1]);
              
              // Show sample data
              if (json.Makes && json.Makes.length > 0) {
                const samples = json.Makes.slice(0, 3).map(m => m.make_display || m.make_id);
                console.log(`   Sample makes: ${samples.join(', ')}...`);
                console.log(`   Total: ${json.Makes.length} makes available`);
              } else if (json.Models && json.Models.length > 0) {
                const samples = json.Models.slice(0, 3).map(m => m.model_name);
                console.log(`   Sample models: ${samples.join(', ')}...`);
                console.log(`   Total: ${json.Models.length} models available`);
              } else if (json.Trims && json.Trims.length > 0) {
                const years = [...new Set(json.Trims.map(t => t.model_year))].sort().reverse();
                console.log(`   Years available: ${years.slice(0, 5).join(', ')}...`);
                console.log(`   Total: ${json.Trims.length} trims available`);
              }
              
              resolve({ success: true, data: json });
            } catch (e) {
              console.log(`⚠️  Data received but parsing failed`);
              resolve({ success: false });
            }
          }
        } else {
          console.log(`❌ FAILED: HTTP ${res.statusCode}`);
          resolve({ success: false });
        }
      });
    }).on('error', (err) => {
      console.log(`❌ FAILED: ${err.message}`);
      resolve({ success: false });
    });
  });
}

async function runTests() {
  console.log('🚗 CARQUERY API TEST - Server Side');
  console.log('=====================================');
  console.log('Testing if CarQuery is available for suggestions...');
  
  // Test 1: Get all makes
  await testCarQueryEndpoint('cmd=getMakes', 'Get all car makes');
  
  // Test 2: Get BMW models
  await testCarQueryEndpoint('cmd=getModels&make=bmw', 'Get BMW models');
  
  // Test 3: Get Mercedes models
  await testCarQueryEndpoint('cmd=getModels&make=mercedes-benz', 'Get Mercedes-Benz models');
  
  // Test 4: Get years for BMW X5
  await testCarQueryEndpoint('cmd=getTrims&make=bmw&model=x5', 'Get BMW X5 years/trims');
  
  // Test 5: Get specific year data
  await testCarQueryEndpoint('cmd=getTrims&make=bmw&model=x5&year=2023', 'Get 2023 BMW X5 data');
  
  console.log('\n=====================================');
  console.log('📊 CONCLUSION:');
  console.log('=====================================');
  console.log('\n✅ If tests passed above:');
  console.log('   CarQuery is WORKING and FREE for suggestions!');
  console.log('   Perfect for make/model/year dropdowns');
  console.log('   No API key needed\n');
  
  console.log('❌ If tests failed:');
  console.log('   CarQuery might be down or blocked');
  console.log('   Fallback to hardcoded popular makes/models');
  console.log('   Or use the new APIs (slower but comprehensive)\n');
  
  console.log('💡 RECOMMENDATION:');
  console.log('   Use CarQuery for suggestions (if working)');
  console.log('   Use new APIs for detailed vehicle data');
  console.log('   This hybrid approach gives best UX!\n');
}

runTests().catch(console.error);
