const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const characterSchema = new Schema({
    name: {
        type: 'string',
        required: true
    },
    images: {
        type: Array,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    gender: {
        required: true,
        type: String,
        enum: ['Male', 'Female', 'Transgender']
    },
    movies: [{
        type: Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
    }, { collection: 'movies' }],
    age: {
        type: String,
    },
    height: {
        type: String
    },
    //these are some of the tags related to the star this will be useful while searching
    tags: {
        type: Array,
        default: []
    }
})

module.exports = mongoose.model('Character', characterSchema);