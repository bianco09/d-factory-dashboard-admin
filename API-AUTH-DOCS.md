# 🔐 Authentication API Documentation

## Overview
This API provides a complete authentication system with role-based access control (RBAC) for the Aventur Journeys booking platform.

## Base URL
```
http://localhost:4000/api
```

## 🔑 Authentication Endpoints

### 1. User Registration
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-07-14T05:37:12.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login
**POST** `/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get User Profile
**GET** `/auth/profile`
🔒 **Requires Authentication**

Get the current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2025-07-14T05:37:12.000Z",
  "_count": {
    "bookings": 3
  }
}
```

### 4. Update Profile
**PUT** `/auth/profile`
🔒 **Requires Authentication**

Update the current user's profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

### 5. Change Password
**PUT** `/auth/change-password`
🔒 **Requires Authentication**

Change the current user's password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

## 👥 User Management Endpoints (Admin Only)

### 1. Get All Users
**GET** `/users`
🔒 **Requires Admin Role**

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "isActive": true,
    "createdAt": "2025-07-14T05:37:12.000Z",
    "_count": {
      "bookings": 3
    }
  }
]
```

### 2. Get Single User
**GET** `/users/:id`
🔒 **Requires Authentication** (Owner or Admin)

### 3. Update User Role
**PUT** `/users/:id/role`
🔒 **Requires Admin Role**

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

### 4. Activate/Deactivate User
**PUT** `/users/:id/status`
🔒 **Requires Admin Role**

**Request Body:**
```json
{
  "isActive": false
}
```

## 📝 Booking Endpoints

### 1. Create Booking
**POST** `/bookings`
🔒 **Requires Authentication**

**Request Body:**
```json
{
  "tourId": 1,
  "date": "2025-08-15T10:00:00.000Z",
  "people": 2
}
```

### 2. Get My Bookings
**GET** `/bookings/my-bookings`
🔒 **Requires Authentication**

### 3. Get All Bookings
**GET** `/bookings`
🔒 **Requires Admin Role**

### 4. Cancel Booking
**DELETE** `/bookings/:id`
🔒 **Requires Authentication** (Owner or Admin)

## 🎯 Tour Endpoints

### 1. Get All Tours
**GET** `/tours`
🌐 **Public Access**

### 2. Get Single Tour
**GET** `/tours/:id`
🌐 **Public Access**

### 3. Create Tour
**POST** `/tours`
🔒 **Requires Admin Role**

### 4. Update Tour
**PUT** `/tours/:id`
🔒 **Requires Admin Role**

### 5. Delete Tour
**DELETE** `/tours/:id`
🔒 **Requires Admin Role**

### 6. Get Tour Statistics
**GET** `/tours/:id/stats`
🔒 **Requires Admin Role**

## 🔐 Authentication & Authorization

### JWT Token
- **Expiration:** 7 days
- **Header:** `Authorization: Bearer <token>`
- **Claims:** `{ userId: number }`

### User Roles
- **USER:** Can create bookings, view own bookings, update own profile
- **ADMIN:** Full access to all endpoints, user management, tour management

### Default Users
After seeding the database:

**Admin User:**
- Email: `admin@aventur-journeys.com`
- Password: `admin123`
- Role: `ADMIN`

**Test User:**
- Email: `user@aventur-journeys.com`
- Password: `user123`
- Role: `USER`

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## 🛡️ Security Features

1. **Password Hashing:** bcrypt with 12 salt rounds
2. **JWT Authentication:** Secure token-based auth
3. **Role-Based Access Control:** USER and ADMIN roles
4. **Input Validation:** Comprehensive request validation
5. **Rate Limiting:** Ready for implementation
6. **CORS Configuration:** Configured for frontend origin
7. **Account Status:** Active/Inactive user control
8. **Password Requirements:** Minimum 6 characters

## 🧪 Testing

Run the authentication test script:
```bash
node test-auth.js
```

This will test all endpoints and verify the security implementation.
