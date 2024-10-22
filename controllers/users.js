const User = require('../models/users.js');

module.exports.renderRegister=(req, res) => {
    console.log(req.originalUrl);
    res.render('users/register.ejs');
  }
  module.exports.register=async (req, res, next) => {
    try {
      const { username, password, email } = req.body;
      const user = new User({ username: username, email: email });
      const hashedUser = await User.register(user, password);
      req.login(hashedUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash('success', 'Welcome to yelp camp');
        res.redirect('/campgrounds');
      })
    } catch (e) {
      req.flash('error', e.message);
      res.redirect('/register')
    }
  }

  module.exports.renderLogin=(req, res) => {
    res.render('users/login')
  }
  module.exports.login=(req, res) => {
    req.flash('success', 'Logged in successfully!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
  }

  module.exports.logout=(req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Goodbye!');
      res.redirect('/campgrounds');
    });
  }