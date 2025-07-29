// scripts/test-suggestions.ts
// Run with: npx ts-node scripts/test-suggestions.ts

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/spa/suggestions';

async function testSuggestions() {
  const makesQuery = `${BASE_URL}?type=makes&search=fer`;
  const modelsQuery = `${BASE_URL}?type=models&make=Ferrari&search=488`;
  const yearsQuery = `${BASE_URL}?type=years&make=Ferrari&model=488`;

  console.log('--- Testing Makes ---');
  const makesRes = await nodeFetch(makesQuery);
  const makes = await makesRes.json();
  console.dir(makes, { depth: 5 });

  console.log('\n--- Testing Models ---');
  const modelsRes = await nodeFetch(modelsQuery);
  const models = await modelsRes.json();
  console.dir(models, { depth: 5 });

  console.log('\n--- Testing Years ---');
  const yearsRes = await nodeFetch(yearsQuery);
  const years = await yearsRes.json();
  console.dir(years, { depth: 5 });
}

if (require.main === module) {
  testSuggestions().catch(err => {
    console.error('Test script failed:', err);
    process.exit(1);
  });
}
