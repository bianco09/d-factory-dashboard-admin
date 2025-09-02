const { body, validationResult } = require('express-validator');
const xss = require('xss');

// XSS protection options for regular text
const xssOptions = {
  whiteList: {}, // No HTML tags allowed
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

// XSS protection options for rich text content (like tour descriptions)
const richTextXssOptions = {
  whiteList: {
    // Basic formatting
    'p': [],
    'br': [],
    'div': [],
    'span': [],
    // Text formatting
    'strong': [],
    'b': [],
    'em': [],
    'i': [],
    'u': [],
    's': [],
    'strike': [],
    // Lists
    'ul': [],
    'ol': [],
    'li': [],
    // Headings
    'h1': [],
    'h2': [],
    'h3': [],
    'h4': [],
    'h5': [],
    'h6': [],
    // Tables
    'table': ['style'],
    'thead': [],
    'tbody': [],
    'tr': [],
    'th': [],
    'td': [],
    // Links
    'a': ['href', 'title', 'target'],
    // Images
    'img': ['src', 'alt', 'title', 'width', 'height'],
    // Line breaks
    'hr': []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
  allowCommentTag: false
};

// Sanitize text input to prevent XSS
const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return xss(text.trim(), xssOptions);
};

// Sanitize rich text content (allows safe HTML)
const sanitizeRichText = (text) => {
  if (typeof text !== 'string') return text;
  return xss(text.trim(), richTextXssOptions);
};

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Log suspicious activity middleware
const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /sql\s*(insert|delete|update|select)/i,
    /(union|select).*from/i,
    /<embed/i,
    /<object/i
  ];

  const requestBody = JSON.stringify(req.body || {});
  const requestQuery = JSON.stringify(req.query || {});
  const requestParams = JSON.stringify(req.params || {});
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestBody) || pattern.test(requestQuery) || pattern.test(requestParams)) {
      console.log('🚨 SUSPICIOUS ACTIVITY DETECTED:', {
        timestamp: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        pattern: pattern.toString(),
        body: req.body,
        query: req.query,
        params: req.params
      });
      // Don't block the request, just log it
      break;
    }
  }
  
  next();
};

// Middleware to sanitize all string inputs in request body
const sanitizeInputs = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeText(req.body[key]);
      }
    }
  }
  next();
};

// Special middleware for tour inputs that preserves HTML in description
const sanitizeTourInputs = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        if (key === 'description') {
          // Allow safe HTML in description
          req.body[key] = sanitizeRichText(req.body[key]);
        } else {
          // Regular sanitization for other fields
          req.body[key] = sanitizeText(req.body[key]);
        }
      }
    }
    
    // Handle tour plans descriptions
    if (Array.isArray(req.body.tourPlans)) {
      req.body.tourPlans = req.body.tourPlans.map(plan => ({
        ...plan,
        description: typeof plan.description === 'string' 
          ? sanitizeRichText(plan.description) 
          : plan.description
      }));
    }
  }
  next();
};

// Validation rules for booking creation
const validateBookingInput = [
  body('guestName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s\u00C0-\u017F\u0100-\u024F]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('guestEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email is too long')
    .normalizeEmail(),
  
  body('guestPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
    .isLength({ max: 20 })
    .withMessage('Phone number is too long'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
    .custom((value) => {
      // Extra check for malicious content
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<embed/i,
        /<object/i
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          throw new Error('Invalid content detected in notes');
        }
      }
      return true;
    }),
  
  body('tourId')
    .isInt({ min: 1 })
    .withMessage('Valid tour ID is required'),
  
  body('people')
    .isInt({ min: 1, max: 50 })
    .withMessage('Number of people must be between 1 and 50'),
    
  handleValidationErrors
];

// Validation rules for guest lookup
const validateGuestLookup = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  handleValidationErrors
];

// Validation for tour data
const validateTourInput = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .matches(/^[a-zA-Z0-9\s\u00C0-\u017F\u0100-\u024F.,\-()]+$/)
    .withMessage('Title contains invalid characters'),
  
  body('description')
    .optional()
    .isLength({ max: 5000 }) // Increased from 2000 to accommodate HTML markup
    .withMessage('Description must be less than 5000 characters'),
  
  body('location')
    .optional()
    .matches(/^[a-zA-Z0-9\s\u00C0-\u017F\u0100-\u024F.,\-()]+$/)
    .withMessage('Location contains invalid characters'),
  
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .custom(value => value > 0)
    .withMessage('Price must be greater than 0'),
  
  handleValidationErrors
];

// Validation for authentication data
const validateAuthInput = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\u00C0-\u017F\u0100-\u024F.,\-()]+$/)
    .withMessage('Name contains invalid characters'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];

module.exports = {
  sanitizeInput: sanitizeInputs, // Add alias for consistency
  sanitizeInputs,
  sanitizeTourInputs, // New middleware for tour-specific sanitization
  validateBookingData: validateBookingInput,
  validateBookingInput,
  validateGuestLookup,
  validateTourData: validateTourInput,
  validateTourInput,
  validateAuthData: validateAuthInput,
  validateAuthInput,
  handleValidationErrors,
  logSuspiciousActivity, // Now properly exports the middleware
  sanitizeText,
  sanitizeRichText // Export the new rich text sanitizer
};
