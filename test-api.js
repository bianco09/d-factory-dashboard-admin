const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing tour creation...');
    
    const tourData = {
      title: "Mountain Adventure", 
      description: "Great mountain hiking experience", 
      location: "Swiss Alps", 
      days: 3, 
      price: 299.99, 
      type: "multi", 
      category: "adventure"
    };

    const response = await fetch('http://localhost:4000/api/tours', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tourData),
    });

    const result = await response.json();
    console.log('Create response:', result);

    // Now fetch all tours
    const getResponse = await fetch('http://localhost:4000/api/tours');
    const tours = await getResponse.json();
    console.log('All tours:', tours);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPI();
