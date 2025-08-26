const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin, requireOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all bookings (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        tour: {
          select: { id: true, title: true, location: true, price: true, days: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add booking type indicator
    const bookingsWithType = bookings.map(booking => ({
      ...booking,
      bookingType: booking.userId ? 'authenticated' : 'guest',
      customerName: booking.userId ? booking.user.name : booking.guestName,
      customerEmail: booking.userId ? booking.user.email : booking.guestEmail
    }));

    res.json(bookingsWithType);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a booking (Public endpoint - supports both guest and authenticated users)
router.post('/', async (req, res) => {
  try {
    const { tourId, people, guestName, guestEmail, guestPhone, notes } = req.body;
    
    // Check if user is authenticated
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = null;
    let isAuthenticated = false;

    // Try to authenticate user if token provided
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, isActive: true }
        });

        if (user && user.isActive) {
          userId = user.id;
          isAuthenticated = true;
        }
      } catch (error) {
        // Invalid token - treat as guest booking
        console.log('Invalid token, treating as guest booking');
      }
    }

    // Validation
    if (!tourId || !date || !people) {
      return res.status(400).json({ error: 'Tour ID, date, and number of people are required' });
    }

    if (people < 1) {
      return res.status(400).json({ error: 'Number of people must be at least 1' });
    }

    // For guest bookings, require contact information
    if (!isAuthenticated) {
      if (!guestName || !guestEmail) {
        return res.status(400).json({ 
          error: 'For guest bookings, name and email are required' 
        });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }
    }

    // Check if tour exists
    const tour = await prisma.tour.findUnique({ where: { id: Number(tourId) } });
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Calculate total price
    const total = tour.price * people;
    const bookingDate = new Date();

    // Check if booking date is in the future
    if (bookingDate <= new Date()) {
      return res.status(400).json({ error: 'Booking date must be in the future' });
    }

    // Create booking data
    const bookingData = {
      tourId: Number(tourId), 
      date: bookingDate, 
      people: Number(people), 
      total,
      notes: notes || null,
      status: 'CONFIRMED'
    };

    // Add user or guest information
    if (isAuthenticated) {
      bookingData.userId = userId;
    } else {
      bookingData.guestName = guestName;
      bookingData.guestEmail = guestEmail;
      bookingData.guestPhone = guestPhone || null;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        tour: {
          select: { id: true, title: true, location: true, price: true, days: true }
        },
        ...(isAuthenticated && {
          user: {
            select: { id: true, name: true, email: true }
          }
        })
      }
    });

    const responseMessage = isAuthenticated 
      ? 'Booking created successfully for your account'
      : 'Guest booking created successfully. You will receive a confirmation email.';

    res.status(201).json({
      message: responseMessage,
      booking: {
        ...booking,
        bookingType: isAuthenticated ? 'authenticated' : 'guest'
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bookings by user (Owner or Admin only)
router.get('/user/:userId', authenticateToken, requireOwnerOrAdmin('userId'), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: Number(req.params.userId) },
      include: {
        tour: {
          select: { id: true, title: true, location: true, price: true, days: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        tour: {
          select: { id: true, title: true, location: true, price: true, days: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bookings by tour (Admin only)
router.get('/tour/:tourId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { tourId: Number(req.params.tourId) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Get tour bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single booking (Owner or Admin only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        tour: {
          select: { id: true, title: true, location: true, price: true, days: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel/Delete a booking (Owner, Guest with email verification, or Admin)
router.delete('/:id', async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const { guestEmail } = req.body; // For guest booking cancellation

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    let canCancel = false;
    let cancelReason = '';

    // Check authentication
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // User is authenticated
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, role: true, isActive: true }
        });

        if (user && user.isActive) {
          // Admin can cancel any booking
          if (user.role === 'ADMIN') {
            canCancel = true;
            cancelReason = 'Admin cancellation';
          }
          // User can cancel their own bookings
          else if (booking.userId === user.id) {
            canCancel = true;
            cancelReason = 'User cancellation';
          }
        }
      } catch (error) {
        // Invalid token, continue to check guest cancellation
      }
    }

    // If not authenticated or not owner, check if it's a guest cancellation
    if (!canCancel && booking.userId === null) {
      if (!guestEmail) {
        return res.status(400).json({ 
          error: 'Email is required to cancel guest bookings' 
        });
      }

      if (booking.guestEmail === guestEmail) {
        canCancel = true;
        cancelReason = 'Guest cancellation';
      } else {
        return res.status(403).json({ 
          error: 'Email does not match the booking record' 
        });
      }
    }

    if (!canCancel) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check cancellation policy (24 hours before tour for non-admins)
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const hoursUntilTour = (bookingDate - now) / (1000 * 60 * 60);

    if (hoursUntilTour < 24 && !cancelReason.includes('Admin')) {
      return res.status(400).json({ 
        error: 'Bookings can only be cancelled at least 24 hours before the tour date' 
      });
    }

    // Update booking status instead of deleting (for record keeping)
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    });

    res.json({ 
      message: 'Booking cancelled successfully',
      reason: cancelReason
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get guest bookings by email (Public endpoint)
router.post('/guest-lookup', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const guestBookings = await prisma.booking.findMany({
      where: { 
        guestEmail: email,
        userId: null // Only guest bookings
      },
      include: {
        tour: {
          select: { id: true, title: true, location: true, price: true, days: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: `Found ${guestBookings.length} booking(s) for ${email}`,
      bookings: guestBookings
    });
  } catch (error) {
    console.error('Guest lookup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Link guest bookings to user account (Authenticated endpoint)
router.post('/link-guest-bookings', authenticateToken, async (req, res) => {
  try {
    const { guestEmail } = req.body;
    const userId = req.user.id;

    if (!guestEmail) {
      return res.status(400).json({ error: 'Guest email is required' });
    }

    // Find guest bookings with this email
    const guestBookings = await prisma.booking.findMany({
      where: { 
        guestEmail: guestEmail,
        userId: null // Only unlinked guest bookings
      }
    });

    if (guestBookings.length === 0) {
      return res.status(404).json({ 
        error: 'No guest bookings found for this email address' 
      });
    }

    // Link the bookings to the user account
    const updatedBookings = await prisma.booking.updateMany({
      where: { 
        guestEmail: guestEmail,
        userId: null 
      },
      data: { 
        userId: userId,
        // Clear guest info since it's now linked to account
        guestName: null,
        guestEmail: null,
        guestPhone: null
      }
    });

    res.json({
      message: `Successfully linked ${updatedBookings.count} booking(s) to your account`,
      linkedBookings: updatedBookings.count
    });
  } catch (error) {
    console.error('Link guest bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
