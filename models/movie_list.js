const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const movieListSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movies: [{
            type: Schema.Types.ObjectId,
            ref: 'Movie',
            required: true
        }, { collection: 'movies' }] //this is how we define an array of object ID in mongoose
        //need to specify the collection as well?
})

module.exports = mongoose.model('MovieList', movieListSchema)