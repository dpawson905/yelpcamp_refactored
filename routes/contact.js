const express = require('express');
const router = express.Router();

const {
  asyncErrorHandler,
  isAuthenticated,
  isNotAuthenticated,
  isNotVerified
} = require('../middleware');

const {
  getContact,
  postContact
} = require('../controllers/contact')

/* GET contact. */
router.get('/', getContact);

/* POST contact */
router.post('/', isNotAuthenticated, asyncErrorHandler(postContact));

module.exports = router;