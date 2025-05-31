import fetch from 'node-fetch';

async function testSuggestionsAPI() {
  try {
    console.log('Testing suggestions API...');
    const response = await fetch('http://localhost:8080/api/suggestions?q=hp');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Data type:', typeof data);
    console.log('Data length:', Array.isArray(data) ? data.length : 'not array');
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log('\nFirst item keys:', Object.keys(data[0]));
      console.log('\nFirst item:');
      for (const [key, value] of Object.entries(data[0])) {
        console.log(`${key}: ${typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testSuggestionsAPI();
