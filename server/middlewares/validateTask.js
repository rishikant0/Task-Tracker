const { body, validationResult } = require('express-validator');

exports.validateTask = [
  // Title Validation
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),

  // Description Validation
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  // Status Validation
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Invalid status'),

  // Priority Validation
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority'),

  // Due Date Validation
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  // Return Validation Errors
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    next();
  },
];