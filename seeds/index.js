const mongoose = require('mongoose');
const Campground = require('../models/campground.js')
const cities = require('./cities.js')
const { places, descriptors } = require('./seedHelpers.js')

mongoose.connect("mongodb://localhost:27017/yelp-camp")
.then(() => {
  console.log("connected to db")
})
.catch((e) => {
  console.log(e)
}) 

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({})
  for(let i = 0; i < 500; i++){
    const random1000 = Math.floor(Math.random() * 1000)
    const camp = new Campground({
      author: '66fd23660d8f63b10825b5dc',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Obcaecati doloribus quaerat a, eaque incidunt cum, ipsa ad perferendis id debitis facere ducimus natus dicta aspernatur totam repellat recusandae ut sint?Lorem ipsum dolor sit amet consectetur, adipisicing elit. Obcaecati doloribus quaerat a, eaque incidunt cum, ipsa ad perferendis id debitis facere ducimus natus dicta aspernatur totam repellat recusandae ut sint',
      price: Math.floor(Math.random() * 20) + 10,
      geometry: {
        type: 'Point',
        coordinates: [ 
          cities[random1000].longitude,
          cities[random1000].latitude,
         ]
      },
    images:[
      {
        url: 'https://res.cloudinary.com/dyheuc8f9/image/upload/v1729171881/Campground/ke6tkgut9rg4wabvcas7.jpg',
        filename: 'Campground/ke6tkgut9rg4wabvcas7',
      },
      {
        url: 'https://res.cloudinary.com/dyheuc8f9/image/upload/v1729171895/Campground/ue9gimrsxmkm9e7fvdua.jpg',
        filename: 'Campground/ue9gimrsxmkm9e7fvdua',
      }
    ]
    })
    await camp.save();
  }
}

seedDB();