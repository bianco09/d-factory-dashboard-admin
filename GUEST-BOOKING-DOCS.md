# 🎯 Guest Booking System - API Documentation

## 🌟 Overview
Our booking system now supports **both authenticated users and guest bookings** to maximize conversion and reduce friction. Users don't need an account to make bookings, but they get additional benefits if they create one.

## 🔄 Booking Flow Options

### Option 1: Guest Booking (No Account Required)
1. User browses tours (public)
2. User makes booking with contact info
3. User receives confirmation
4. User can lookup bookings by email
5. User can cancel with email verification

### Option 2: Authenticated Booking (With Account)
1. User creates account or logs in
2. User browses tours
3. User makes booking (linked to account)
4. User can view all bookings in profile
5. User can manage bookings

### Option 3: Guest → Account Conversion
1. User makes guest bookings
2. User later creates account
3. User links previous guest bookings to account
4. All bookings now in one place

## 📝 Guest Booking Endpoints

### 1. Create Booking (Public + Auth Hybrid)
**POST** `/bookings`
🌐 **Public Access** (Authentication Optional)

This endpoint works for both guest and authenticated users.

#### For Guest Bookings:
```json
{
  "tourId": 1,
  "date": "2025-08-15T10:00:00.000Z",
  "people": 2,
  "guestName": "Maria Garcia",
  "guestEmail": "maria@example.com",
  "guestPhone": "+1-555-0123",
  "notes": "First time visitor!"
}
```

#### For Authenticated Bookings:
Include `Authorization: Bearer <token>` header:
```json
{
  "tourId": 1,
  "date": "2025-08-15T10:00:00.000Z",
  "people": 2,
  "notes": "My booking"
}
```

#### Response:
```json
{
  "message": "Guest booking created successfully",
  "booking": {
    "id": 1,
    "tourId": 1,
    "date": "2025-08-15T10:00:00.000Z",
    "people": 2,
    "total": 200.00,
    "guestName": "Maria Garcia",
    "guestEmail": "maria@example.com",
    "guestPhone": "+1-555-0123",
    "status": "CONFIRMED",
    "bookingType": "guest",
    "tour": {
      "title": "City Walking Tour",
      "location": "Downtown"
    }
  }
}
```

### 2. Guest Booking Lookup
**POST** `/bookings/guest-lookup`
🌐 **Public Access**

Allows guests to find their bookings using their email.

```json
{
  "email": "maria@example.com"
}
```

**Response:**
```json
{
  "message": "Found 2 booking(s) for maria@example.com",
  "bookings": [
    {
      "id": 1,
      "date": "2025-08-15T10:00:00.000Z",
      "people": 2,
      "total": 200.00,
      "guestName": "Maria Garcia",
      "status": "CONFIRMED",
      "tour": {
        "title": "City Walking Tour"
      }
    }
  ]
}
```

### 3. Guest Booking Cancellation
**DELETE** `/bookings/:id`
🌐 **Public Access** (with email verification)

Cancel a guest booking by providing the booking ID and email.

```json
{
  "guestEmail": "maria@example.com"
}
```

**Response:**
```json
{
  "message": "Booking cancelled successfully",
  "reason": "Guest cancellation"
}
```

### 4. Link Guest Bookings to Account
**POST** `/bookings/link-guest-bookings`
🔒 **Requires Authentication**

Convert guest bookings to authenticated bookings when user creates account.

```json
{
  "guestEmail": "maria@example.com"
}
```

**Response:**
```json
{
  "message": "Successfully linked 2 booking(s) to your account",
  "linkedBookings": 2
}
```

## 🎯 Business Benefits

### 🚀 **Reduced Friction**
- No mandatory account creation
- Faster booking process
- Higher conversion rates
- Mobile-friendly experience

### 🔗 **Account Benefits**
- Booking history in one place
- Faster repeat bookings
- Personalized recommendations
- Loyalty program potential

### 📊 **Admin Benefits**
- All bookings visible in admin panel
- Guest vs authenticated metrics
- Email marketing opportunities
- Customer conversion tracking

## 🛡️ Security Features

### Guest Booking Protection
1. **Email Verification:** Required for cancellations
2. **Booking Ownership:** Only email owner can modify
3. **Input Validation:** Email format and data validation
4. **Cancellation Policy:** 24-hour minimum notice

### Data Privacy
1. **Minimal Data Collection:** Only booking essentials
2. **Account Linking:** Optional conversion
3. **Data Cleanup:** Guest info cleared when linked
4. **Secure Storage:** Same security as user accounts

## 🔄 Integration Examples

### Frontend Booking Form
```javascript
// Dynamic form that adapts to auth state
const BookingForm = ({ isAuthenticated, userToken }) => {
  const [bookingData, setBookingData] = useState({
    tourId: '',
    date: '',
    people: 1,
    notes: ''
  });

  const [guestInfo, setGuestInfo] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: ''
  });

  const submitBooking = async () => {
    const payload = { ...bookingData };
    
    // Add guest info if not authenticated
    if (!isAuthenticated) {
      Object.assign(payload, guestInfo);
    }

    const headers = { 'Content-Type': 'application/json' };
    if (isAuthenticated) {
      headers.Authorization = `Bearer ${userToken}`;
    }

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    // Handle response...
  };

  return (
    <form onSubmit={submitBooking}>
      {/* Tour, date, people fields */}
      
      {!isAuthenticated && (
        <div className="guest-info">
          <h3>Contact Information</h3>
          <input 
            placeholder="Full Name" 
            value={guestInfo.guestName}
            onChange={(e) => setGuestInfo({...guestInfo, guestName: e.target.value})}
            required 
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={guestInfo.guestEmail}
            onChange={(e) => setGuestInfo({...guestInfo, guestEmail: e.target.value})}
            required 
          />
          <input 
            type="tel" 
            placeholder="Phone (optional)" 
            value={guestInfo.guestPhone}
            onChange={(e) => setGuestInfo({...guestInfo, guestPhone: e.target.value})}
          />
        </div>
      )}
      
      <button type="submit">
        {isAuthenticated ? 'Book Tour' : 'Book as Guest'}
      </button>
    </form>
  );
};
```

### Guest Booking Lookup Component
```javascript
const GuestLookup = () => {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);

  const lookupBookings = async () => {
    const response = await fetch('/api/bookings/guest-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    setBookings(result.bookings || []);
  };

  return (
    <div className="guest-lookup">
      <h3>Find Your Bookings</h3>
      <input 
        type="email" 
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={lookupBookings}>Find Bookings</button>
      
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
};
```

## 📈 Metrics to Track

1. **Conversion Rates**
   - Guest booking vs abandoned bookings
   - Guest-to-account conversion rate
   - Repeat booking rates

2. **User Behavior**
   - Most popular booking type
   - Guest booking patterns
   - Account creation triggers

3. **Revenue Impact**
   - Revenue from guest bookings
   - Lifetime value comparison
   - Booking frequency by type

## 🎉 Summary

This flexible booking system:
- ✅ **Maximizes conversions** with guest bookings
- ✅ **Encourages account creation** with benefits
- ✅ **Maintains security** with proper validation
- ✅ **Provides admin control** over all bookings
- ✅ **Scales easily** for future features

Your customers can now book tours instantly without friction, while still having the option to create accounts for additional benefits! 🚀
