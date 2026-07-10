const token = 'eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc';

async function testApi() {
  const endpoints = [
    '/backend/api/v2/DriProfile',
    '/backend/api/v2/Practice',
    '/backend/api/v2/office',
    '/backend/api/v2/UpdateCar',
    '/backend/api/v2/StaffAndFacilities',
    '/backend/api/v2/RaceSetup',
    '/backend/api/v2/TrackProfile',
    '/backend/api/v2/Qualify2',
    '/backend/api/v2/TDProfile',
    '/backend/api/v2/Menu',
    '/backend/api/v2/Standings',
    '/backend/api/v2/MoneyLevels'
  ];

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };

  const results = {};
  for (const ep of endpoints) {
    try {
      const res = await fetch('https://gpro.net/gb' + ep, { method: 'GET', headers });
      if (res.ok) {
        results[ep] = await res.json();
      } else {
        results[ep] = `Error: ${res.status}`;
      }
    } catch (err) {
      results[ep] = `Exception: ${err.message}`;
    }
  }

  require('fs').writeFileSync('api-dump.json', JSON.stringify(results, null, 2));
  console.log('Done');
}

testApi();
