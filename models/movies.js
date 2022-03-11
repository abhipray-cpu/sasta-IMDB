const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({

    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    genre: [{
        required: true,
        type: String,
        enum: ['Comedy', 'Horror', 'Action', 'Thriller', 'SCIFI', 'Mythology', 'RomCom', 'Romance', 'Zombie',
            'Life situations', 'Horror Comedy', 'Monster', 'Inspirational', 'Documentaries', 'Sports', 'Crime', 'Drama', 'Superhero',
            'Martial Arts', 'Action comedy', 'Dark comedy', 'Super natural', 'fantasy', 'Musicals'
        ]

    }],
    voted: {
        type: Schema.Types.ObjectId, //we are decalring the type = ObjectID
        required: true,
        ref: 'User' // we need to referene the collection we will be deriving the data from

    },
    filePath: {
        type: String,
        required: true,
        unique: true,
    },
    avgRating: {
        type: Number,
        default: 0
    },
    ratings: [{

        type: mongoose.Types.ObjectId,
        ref: 'Review'

    }],
    //need to include the cast schema in this field
    cast: [{
        star: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true
        }
    }],
    //these tags will be used while searching for movies
    tags: [{
        type: String,
    }],
    duration: {
        type: String,
        required: true
    },
    yearOfRelease: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model('Movie', movieSchema)