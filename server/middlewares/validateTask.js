const { check, validationResult } = require('express-validator');

exports.validateTask = [
  check('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long')
    .trim()
    .escape(),
  check('description')
    .notEmpty().withMessage('Description is required')
    .trim()
    .escape(),
  check('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
  check('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  check('dueDate')
    .optional()
    .isISO8601().toDate().withMessage('Invalid date format'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
