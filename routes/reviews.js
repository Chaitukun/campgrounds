const express = require('express');
const router = express.Router({ mergeParams: true });
const ExpressError = require('../utils/ExpressError.js');
const Review = require('../models/reviews.js')
const catchAsync = require('../utils/catchAsync.js');
const Campground = require('../models/campground.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');
const reviews =require('../controllers/reviews');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;