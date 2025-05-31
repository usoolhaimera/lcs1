import fetch from 'node-fetch';

async function testSuggestionsAPI() {
  try {
    const response = await fetch('http://localhost:8080/api/suggestions?q=hp');
    const data = await response.json();
    console.log('Suggestions API Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\nFirst item structure:');
    if (data && data.length > 0) {
      console.log('Keys:', Object.keys(data[0]));
      console.log('First item:', data[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testSuggestionsAPI();
