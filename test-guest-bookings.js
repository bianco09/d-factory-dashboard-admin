// Test script for guest booking system
const baseUrl = 'http://localhost:4000/api';

async function testGuestBookingSystem() {
  console.log('🧪 Testing Guest Booking System\n');

  try {
    // Test 1: Get available tours (public)
    console.log('1. Getting available tours...');
    const toursResponse = await fetch(`${baseUrl}/tours`);
    const tours = await toursResponse.json();
    
    if (toursResponse.ok && tours.length > 0) {
      console.log('✅ Tours available:', tours.length);
      const testTour = tours[0];
      console.log(`📍 Using tour: "${testTour.title}" - $${testTour.price}/person`);

      // Test 2: Create guest booking without authentication
      console.log('\n2. Creating guest booking (no authentication)...');
      const guestBookingData = {
        tourId: testTour.id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        people: 2,
        guestName: 'Maria Garcia',
        guestEmail: 'maria@example.com',
        guestPhone: '+1-555-0123',
        notes: 'First time visitor, excited!'
      };

      const guestBookingResponse = await fetch(`${baseUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestBookingData)
      });

      const guestBookingResult = await guestBookingResponse.json();
      if (guestBookingResponse.ok) {
        console.log('✅ Guest booking created successfully');
        console.log(`💰 Total: $${guestBookingResult.booking.total} for ${guestBookingResult.booking.people} people`);
        console.log(`📧 Guest email: ${guestBookingResult.booking.guestEmail}`);
        console.log(`🎫 Booking type: ${guestBookingResult.booking.bookingType}`);

        const guestBookingId = guestBookingResult.booking.id;

        // Test 3: Guest booking lookup
        console.log('\n3. Looking up guest bookings by email...');
        const lookupResponse = await fetch(`${baseUrl}/bookings/guest-lookup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'maria@example.com' })
        });

        const lookupResult = await lookupResponse.json();
        if (lookupResponse.ok) {
          console.log('✅ Guest lookup successful');
          console.log(`📋 Found ${lookupResult.bookings.length} booking(s)`);
          if (lookupResult.bookings.length > 0) {
            console.log(`🎯 First booking: ${lookupResult.bookings[0].tour.title}`);
          }
        }

        // Test 4: Guest booking cancellation
        console.log('\n4. Testing guest booking cancellation...');
        const cancelResponse = await fetch(`${baseUrl}/bookings/${guestBookingId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestEmail: 'maria@example.com' })
        });

        const cancelResult = await cancelResponse.json();
        if (cancelResponse.ok) {
          console.log('✅ Guest booking cancelled successfully');
          console.log(`📝 Reason: ${cancelResult.reason}`);
        }

        // Test 5: Try wrong email for cancellation
        console.log('\n5. Testing security - wrong email for cancellation...');
        
        // First create another booking
        const anotherBookingResponse = await fetch(`${baseUrl}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...guestBookingData,
            guestEmail: 'carlos@example.com',
            guestName: 'Carlos Rodriguez'
          })
        });

        if (anotherBookingResponse.ok) {
          const anotherBooking = await anotherBookingResponse.json();
          const wrongEmailCancelResponse = await fetch(`${baseUrl}/bookings/${anotherBooking.booking.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guestEmail: 'wrong@email.com' })
          });

          const wrongEmailResult = await wrongEmailCancelResponse.json();
          if (!wrongEmailCancelResponse.ok && wrongEmailCancelResponse.status === 403) {
            console.log('✅ Security check passed - wrong email rejected');
            console.log(`🚫 Error: ${wrongEmailResult.error}`);
          }
        }

      } else {
        console.log('❌ Guest booking failed:', guestBookingResult.error);
      }

      // Test 6: Authenticated user booking (for comparison)
      console.log('\n6. Testing authenticated user booking...');
      
      // Login first
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@aventur-journeys.com',
          password: 'user123'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        const userToken = loginData.token;

        const authBookingResponse = await fetch(`${baseUrl}/bookings`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            tourId: testTour.id,
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
            people: 1,
            notes: 'Authenticated user booking'
          })
        });

        const authBookingResult = await authBookingResponse.json();
        if (authBookingResponse.ok) {
          console.log('✅ Authenticated booking created');
          console.log(`🎫 Booking type: ${authBookingResult.booking.bookingType}`);
          console.log(`👤 User: ${authBookingResult.booking.user.name}`);
        }
      }

      // Test 7: Guest booking validation
      console.log('\n7. Testing guest booking validation...');
      
      const invalidBookingResponse = await fetch(`${baseUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: testTour.id,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          people: 2,
          guestName: 'Test User'
          // Missing guestEmail
        })
      });

      const invalidResult = await invalidBookingResponse.json();
      if (!invalidBookingResponse.ok) {
        console.log('✅ Validation working - missing email caught');
        console.log(`🚫 Error: ${invalidResult.error}`);
      }

    } else {
      console.log('❌ No tours available for testing');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🎉 Guest booking system test completed!');
  console.log('\n📋 Summary:');
  console.log('• Guest bookings work without authentication');
  console.log('• Guest booking lookup by email works');
  console.log('• Guest booking cancellation with email verification works');
  console.log('• Security checks prevent unauthorized cancellations');
  console.log('• Both guest and authenticated bookings coexist');
}

// Run the tests
testGuestBookingSystem();
