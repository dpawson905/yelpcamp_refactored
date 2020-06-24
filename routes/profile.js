const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const {
  asyncErrorHandler,
  isNotAuthenticated,
  checkProfileOwnership
} = require('../middleware');

const {
  getProfile,
  updateProfile
} = require('../controllers/profile');

/* GET profile */
router.get('/:username', isNotAuthenticated, checkProfileOwnership, asyncErrorHandler(getProfile));

/* PUT update profile */
router.put('/:username', upload.single('image'), isNotAuthenticated, checkProfileOwnership, asyncErrorHandler(updateProfile));

module.exports = router;