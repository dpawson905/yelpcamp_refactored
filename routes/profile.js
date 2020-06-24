const express = require('express');
const router = express.Router();

const {
  asyncErrorHandler,
  isNotAuthenticated,
  checkProfileOwnership
} = require('../middleware');

const {
  getProfile
} = require('../controllers/profile');

/* GET profile */
router.get('/:username', isNotAuthenticated, checkProfileOwnership, asyncErrorHandler(getProfile));

module.exports = router;