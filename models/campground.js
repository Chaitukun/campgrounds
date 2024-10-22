const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews.js');

const imageSchema=new Schema(
  {
    url:String,
    filename:String
  }
);

imageSchema.virtual('thumbnail').get(function(){
  return this.url.replace('/upload','/upload/w_200');
})

const opts={toJSON:{virtuals:true}};

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  images: [imageSchema],
  geometry: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }]
},opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0,20)}... </p>`;
})

CampgroundSchema.post('findOneAndDelete', async function(campground){
  if(campground){
    await Review.deleteMany({_id: {$in: campground.reviews}})
  }
})

module.exports = mongoose.model('Campground', CampgroundSchema);