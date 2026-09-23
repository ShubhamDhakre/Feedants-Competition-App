const { param, body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Middleware to check validation results.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      code: 'VALIDATION_ERROR',
    });
  }
  next();
};

// Validate competition ID parameter
const validateCompetitionId = [
  param('id')
    .notEmpty().withMessage('Competition ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid competition ID format');
      }
      return true;
    }),
  handleValidationErrors,
];

// Validate submission
const validateSubmission = [
  param('id')
    .notEmpty().withMessage('Competition ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid competition ID format');
      }
      return true;
    }),
  body('title')
    .trim()
    .notEmpty().withMessage('Submission title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('linkUrl')
    .optional({ values: 'falsy' })
    .trim()
    .isURL().withMessage('Please provide a valid URL'),
  handleValidationErrors,
];

module.exports = { validateCompetitionId, validateSubmission };
