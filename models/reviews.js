const mongoose = require('mongoose'); //
const Schema = mongoose.Schema;

const reviewsSchema = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,

    },
    movie: {
        type: mongoose.Types.ObjectId,
        ref: "Movie",
        required: true,
    },
    content: {
        type: String,
        required: true

    },
    rating: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Review', reviewsSchema)