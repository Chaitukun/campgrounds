const campground = require('../models/campground.js');
const Campground = require('../models/campground.js');
const {cloudinary} = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


module.exports.index= async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds })
  }

  module.exports.renderNewForm = (req, res) => {
    console.log(req.user)
    res.render('campgrounds/new.ejs')
  }

  module.exports.createCampground=async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    
    campground.images= req.files.map(f=>({url: f.path,filename:f.filename}));
    campground.author = req.user;
    await campground.save();
    console.log(campground);
    
    req.flash('success', 'Successfully saved')
    res.redirect(303, `/campgrounds/${campground._id}`)
  }

module.exports.showCampground=async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    }).populate('author')
    if (!campground) {
      req.flash('error', 'Cannot find that campground!');
      return res.redirect('/campgrounds');
    }
    console.log(campground.reviews)
    res.render('campgrounds/show.ejs', { campground })
  }
  module.exports.renderEditForm= async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash('error', 'Cannot find that campground!');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
  }
  module.exports.updateCampground=async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    

// Update the campground
await Campground.findByIdAndUpdate(id, { ...req.body.campground });

// Retrieve the updated campground object
const campground = await Campground.findById(id);

// Map the images and push them into the campground's images array
const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));

// Make sure the images array exists before pushing
if (!campground.images) {
    campground.images = [];
}

campground.images.push(...imgs);

// Save the campground after adding new images
await campground.save();
if(req.body.deleteImages){
  for(let filename of req.body.deleteImages){
    await cloudinary.uploader.destroy(filename);
  }
  await campground.updateOne({$pull: {images:{filename: {$in: req.body.deleteImages}}}})
console.log(campground);

}

// Flash success message and redirect
req.flash('success', 'Successfully updated the campground!');
res.redirect(303, `/campgrounds/${id}`);
  }
  module.exports.deleteCampground=async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
      req.flash('error', 'You do not have permission to do that');
      return res.redirect('/login')
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully updated campground.')
    res.redirect(303, "/campgrounds");
  }

