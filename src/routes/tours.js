const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sanitizeInput, validateTourData } = require('../middleware/sanitization');

const router = express.Router();
const prisma = new PrismaClient();

// Get all tours summary (Public - lightweight for cards)
router.get('/summary', async (req, res) => {
  try {
    const tours = await prisma.tour.findMany({
      select: {
        id: true,
        title: true,
        location: true,
        days: true,
        price: true,
        type: true,
        startDate: true,
        endDate: true,
        categories: true,
        status: true,
        createdAt: true,
        _count: {
          select: { bookings: true }
        }
      },
      where: {
        status: 'published' // Only show published tours to public
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tours);
  } catch (error) {
    console.error('Get tours summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tours (Admin only - full details)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tours = await prisma.tour.findMany({
      include: {
        _count: {
          select: { bookings: true }
        },
        tourPlans: {
          orderBy: { day: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });
    res.json(tours);
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single tour (Public - no authentication required)
router.get('/:id', async (req, res) => {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        _count: {
          select: { bookings: true }
        },
        tourPlans: {
          orderBy: { day: 'asc' }
        }
      }
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    res.json(tour);
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a tour (Admin only)
router.post('/', authenticateToken, requireAdmin, sanitizeInput, validateTourData, async (req, res) => {
  try {
    let { title, description, location, days, price, type, startDate, endDate, categories, included, excluded, status, completionPercentage, tourPlans } = req.body;

    // Validation
    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    // Set defaults and validate type
    type = type === "multi" ? "multi" : "single";
    days = type === "single" ? 1 : (days || 1);
    categories = Array.isArray(categories) ? categories : [];
    included = Array.isArray(included) ? included : [];
    excluded = Array.isArray(excluded) ? excluded : [];
    status = status || "draft";
    completionPercentage = completionPercentage || 0;

    if (type === "multi" && (!days || days < 2)) {
      return res.status(400).json({ error: 'Multi-day tours must have at least 2 days' });
    }

    // Validate tour plans if provided
    if (Array.isArray(tourPlans) && tourPlans.length > 0) {
      const invalidPlans = tourPlans.filter(plan => 
        !plan.day || !plan.title || !plan.description || 
        plan.day < 1 || plan.day > days
      );
      
      if (invalidPlans.length > 0) {
        return res.status(400).json({ error: 'All tour plans must have day, title, and description. Day must be between 1 and the total number of days.' });
      }

      // Check for duplicate days
      const dayNumbers = tourPlans.map(plan => plan.day);
      const uniqueDays = [...new Set(dayNumbers)];
      if (dayNumbers.length !== uniqueDays.length) {
        return res.status(400).json({ error: 'Duplicate day numbers found in tour plans' });
      }

      // Ensure included is an array for each plan
      tourPlans = tourPlans.map(plan => ({
        ...plan,
        included: Array.isArray(plan.included) ? plan.included : []
      }));
    }

    // Create the tour with tour plans
    const tour = await prisma.tour.create({
      data: { 
        title, 
        description: description || null, 
        location: location || null, 
        days, 
        price: parseFloat(price), 
        type,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        categories: categories || [],
        included: included || [],
        excluded: excluded || [],
        status: status || "draft",
        completionPercentage: completionPercentage || 0,
        tourPlans: Array.isArray(tourPlans) && tourPlans.length > 0 ? {
          create: tourPlans.map(plan => ({
            day: plan.day,
            title: plan.title,
            description: plan.description,
            included: plan.included || []
          }))
        } : undefined
      },
      include: {
        tourPlans: {
          orderBy: { day: 'asc' }
        }
      }
    });

    res.status(201).json({
      message: 'Tour created successfully',
      tour
    });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a tour (Admin only)
router.put('/:id', authenticateToken, requireAdmin, sanitizeInput, validateTourData, async (req, res) => {
  try {
    let { title, description, location, days, price, type, startDate, endDate, categories, included, excluded, status, completionPercentage, tourPlans } = req.body;

    // Check if tour exists
    const existingTour = await prisma.tour.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        tourPlans: true
      }
    });

    if (!existingTour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (Array.isArray(categories)) updateData.categories = categories;
    if (Array.isArray(included)) updateData.included = included;
    if (Array.isArray(excluded)) updateData.excluded = excluded;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;
    if (completionPercentage !== undefined) updateData.completionPercentage = completionPercentage;
    
    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({ error: 'Price must be greater than 0' });
      }
      updateData.price = parseFloat(price);
    }

    if (type !== undefined) {
      type = type === "multi" ? "multi" : "single";
      updateData.type = type;
      updateData.days = type === "single" ? 1 : (days || existingTour.days);
    } else if (days !== undefined) {
      updateData.days = days;
    }

    // Validate multi-day tours
    if (updateData.type === "multi" && updateData.days < 2) {
      return res.status(400).json({ error: 'Multi-day tours must have at least 2 days' });
    }

      // Validate tour plans if provided
      if (Array.isArray(tourPlans)) {
        const finalDays = updateData.days || existingTour.days;
        if (updateData.type === "multi" || existingTour.type === "multi") {
          const invalidPlans = tourPlans.filter(plan => 
            !plan.day || !plan.title || !plan.description || 
            plan.day < 1 || plan.day > finalDays
          );
          
          if (invalidPlans.length > 0) {
            return res.status(400).json({ error: 'All tour plans must have day, title, and description. Day must be between 1 and the total number of days.' });
          }

          // Check for duplicate days
          const dayNumbers = tourPlans.map(plan => plan.day);
          const uniqueDays = [...new Set(dayNumbers)];
          if (dayNumbers.length !== uniqueDays.length) {
            return res.status(400).json({ error: 'Duplicate day numbers found in tour plans' });
          }

          // Ensure included is an array for each plan
          tourPlans = tourPlans.map(plan => ({
            ...plan,
            included: Array.isArray(plan.included) ? plan.included : []
          }));
        }
      }    const tour = await prisma.tour.update({
      where: { id: Number(req.params.id) },
      data: updateData
    });

    // Update tour plans if provided
    if (Array.isArray(tourPlans)) {
      // Delete existing plans
      await prisma.tourPlan.deleteMany({
        where: { tourId: tour.id }
      });

      // Create new plans
      if (tourPlans.length > 0) {
        await prisma.tourPlan.createMany({
          data: tourPlans.map(plan => ({
            tourId: tour.id,
            day: plan.day,
            title: plan.title,
            description: plan.description,
            included: plan.included || []
          }))
        });
      }
    }

    // Fetch the complete updated tour with plans
    const completeTour = await prisma.tour.findUnique({
      where: { id: tour.id },
      include: {
        tourPlans: {
          orderBy: { day: 'asc' }
        }
      }
    });

    res.json({
      message: 'Tour updated successfully',
      tour: completeTour
    });
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a tour (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tourId = Number(req.params.id);

    // Check if tour exists
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Check if tour has bookings
    if (tour._count.bookings > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete tour with existing bookings. Cancel all bookings first.' 
      });
    }

    await prisma.tour.delete({ where: { id: tourId } });

    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tour statistics (Admin only)
router.get('/:id/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tourId = Number(req.params.id);

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        bookings: {
          select: {
            people: true,
            total: true,
            createdAt: true
          }
        }
      }
    });

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const stats = {
      totalBookings: tour.bookings.length,
      totalRevenue: tour.bookings.reduce((sum, booking) => sum + booking.total, 0),
      totalPeople: tour.bookings.reduce((sum, booking) => sum + booking.people, 0),
      averageBookingSize: tour.bookings.length > 0 
        ? tour.bookings.reduce((sum, booking) => sum + booking.people, 0) / tour.bookings.length 
        : 0
    };

    res.json({
      tour: {
        id: tour.id,
        title: tour.title,
        location: tour.location
      },
      stats
    });
  } catch (error) {
    console.error('Get tour stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
