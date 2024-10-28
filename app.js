if(process.env.NODE_ENV !=="production" ){
  require('dotenv').config();
}
console.log(process.env.SECRET);

const express = require('express');
const app = express();
const methodOverride = require('method-override');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/users.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const userRoutes = require('./routes/user.js');
const mongoSanitize = require('express-mongo-sanitize');
const helmet=require('helmet');

const MongoStore = require('connect-mongo');

// const dbUrl=process.env.DB_URL;
app.use(express.static(path.join(__dirname, 'public')));

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';


mongoose.connect(dbUrl)
  .then(() => {
    console.log("connected to db")
  })
  .catch((e) => {
    console.log(e)
  })

  const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret
  }
});

store.on("error",function(e){
  console.log("SESSION STORE ERROR",e)
  
})

app.use(session({
  store,
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly:true,
    // secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}))

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
})

// 


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(mongoSanitize());
app.engine('ejs', ejsMate);


const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.tiles.mapbox.com/",
  // "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.mapbox.com/",
  // "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
  "https://api.maptiler.com/", // add this
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dyheuc8f9/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// app.get('/test', async (req, res) => {
//   console.log(req.originalUrl)
//   const username = 'niranjan';
//   const password = 'monkey';
//   const email = 'niranjan@gmail.com'
//   const user = new User({ username: username, email: email })
//   const hashedUser = await User.register(user, password);
//   res.send(hashedUser);
// })

app.use('/campgrounds', campgroundRoutes)

app.get('/', (req, res) => {
  res.render('home')
})

app.use('/campgrounds/:id/reviews', reviewRoutes)

app.use('/', userRoutes);

app.all('*', (req, res, next) => {
  throw new ExpressError('Not found', 404)
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
})

const port=process.env.PORT ||3000;
app.listen(port, console.log(`Listening to port ${port}`))