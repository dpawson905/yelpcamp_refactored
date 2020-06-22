const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const router = express.Router({ mergeParams: true });

const {
  cloudinary
} = require('../cloudinary/');

const { 
  deleteProfileImage
} = require('../middleware');

const {
  asyncErrorHandler,
  isAuthenticated,
  isNotAuthenticated,
  isNotVerified,
  checkCampgroundOwnership,
  isPaid
} = require('../middleware');

router.use(isPaid)

const {
  getCampgrounds,
  getNewCampground,
  postNewCampground,
  getCampground,
  getEditCampground,
  putEditCampGround,
  deleteCampground
} = require('../controllers/campground');

/* GET campgrounds */
router.get('/', isNotAuthenticated, asyncErrorHandler(getCampgrounds));

/* POST new campground */
router.post('/', upload.single('image'), isNotAuthenticated, asyncErrorHandler(postNewCampground));

/* GET new campground */
router.get('/new', isNotAuthenticated, getNewCampground);

/* GET campground */
router.get('/:id', isNotAuthenticated, asyncErrorHandler(checkCampgroundOwnership), asyncErrorHandler(getCampground));

/* PUT campground */
router.put('/:id', isAuthenticated, asyncErrorHandler(checkCampgroundOwnership), asyncErrorHandler(putEditCampGround));

/* DELETE campground */
router.delete('/:id', isAuthenticated, asyncErrorHandler(checkCampgroundOwnership), asyncErrorHandler(deleteCampground));

module.exports = router;
