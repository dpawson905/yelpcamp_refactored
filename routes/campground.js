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
  isNotAuthenticated,
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
router.get('/:slug', isNotAuthenticated, asyncErrorHandler(getCampground));

/* GET edit campground */
router.get('/:slug/edit', isNotAuthenticated, asyncErrorHandler(checkCampgroundOwnership), asyncErrorHandler(getEditCampground));

/* PUT campground */
router.put('/:slug', isNotAuthenticated, asyncErrorHandler(checkCampgroundOwnership), asyncErrorHandler(putEditCampGround));

/* DELETE campground */
router.delete('/:slug', isNotAuthenticated, asyncErrorHandler(checkCampgroundOwnership), asyncErrorHandler(deleteCampground));

module.exports = router;
