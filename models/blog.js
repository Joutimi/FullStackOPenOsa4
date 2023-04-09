const mongoose = require('mongoose')

// Skeema blogeille
const blogSchema = mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
  })
  
  // Muutetaan JSON muotoon, id stringiksi ja poistetaan turhaa tietoa: _id ja _v
  blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

module.exports = mongoose.model('Blog', blogSchema)