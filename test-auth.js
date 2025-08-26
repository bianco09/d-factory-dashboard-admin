// Test script for authentication endpoints
const baseUrl = 'http://localhost:4000/api';

async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Endpoints\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      })
    });
    
    const registerData = await registerResponse.json();
    if (registerResponse.ok) {
      console.log('✅ Registration successful');
      console.log('📧 User:', registerData.user.email, '- Role:', registerData.user.role);
    } else {
      console.log('❌ Registration failed:', registerData.error);
    }

    // Test 2: Login with admin credentials
    console.log('\n2. Testing admin login...');
    const adminLoginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@aventur-journeys.com',
        password: 'admin123'
      })
    });
    
    const adminLoginData = await adminLoginResponse.json();
    if (adminLoginResponse.ok) {
      console.log('✅ Admin login successful');
      console.log('👤 Admin:', adminLoginData.user.email, '- Role:', adminLoginData.user.role);
      const adminToken = adminLoginData.token;

      // Test 3: Access admin-only endpoint
      console.log('\n3. Testing admin-only endpoint (get all users)...');
      const usersResponse = await fetch(`${baseUrl}/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      const usersData = await usersResponse.json();
      if (usersResponse.ok) {
        console.log('✅ Admin access successful');
        console.log('👥 Total users in database:', usersData.length);
      } else {
        console.log('❌ Admin access failed:', usersData.error);
      }
    } else {
      console.log('❌ Admin login failed:', adminLoginData.error);
    }

    // Test 4: Login with regular user
    console.log('\n4. Testing regular user login...');
    const userLoginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@aventur-journeys.com',
        password: 'user123'
      })
    });
    
    const userLoginData = await userLoginResponse.json();
    if (userLoginResponse.ok) {
      console.log('✅ User login successful');
      console.log('👤 User:', userLoginData.user.email, '- Role:', userLoginData.user.role);
      const userToken = userLoginData.token;

      // Test 5: Try to access admin endpoint with user token (should fail)
      console.log('\n5. Testing user access to admin endpoint (should fail)...');
      const forbiddenResponse = await fetch(`${baseUrl}/users`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      
      const forbiddenData = await forbiddenResponse.json();
      if (!forbiddenResponse.ok && forbiddenResponse.status === 403) {
        console.log('✅ Access properly denied for regular user');
        console.log('🚫 Error:', forbiddenData.error);
      } else {
        console.log('❌ Security issue: Regular user accessed admin endpoint');
      }
    } else {
      console.log('❌ User login failed:', userLoginData.error);
    }

    // Test 6: Test public endpoint (tours)
    console.log('\n6. Testing public endpoint (tours)...');
    const toursResponse = await fetch(`${baseUrl}/tours`);
    const toursData = await toursResponse.json();
    
    if (toursResponse.ok) {
      console.log('✅ Public access successful');
      console.log('🎯 Tours available:', toursData.length);
    } else {
      console.log('❌ Public access failed:', toursData.error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🎉 Authentication test completed!');
}

// Run the tests
testAuthEndpoints();
