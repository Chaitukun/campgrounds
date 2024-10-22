const express = require('express');
const router = express.Router();
const User = require('../models/users.js');
const users=require('../controllers/users.js');
const catchAsync = require('../utils/catchAsync.js');
const passport = require('passport');
const { storeReturnTo } = require('../middleware.js');

router.route('/register')
    .get( users.renderRegister)
    .post( catchAsync(users.register));

    router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout);

module.exports = router;