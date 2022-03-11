const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Userschema = new Schema({
    user: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    liked: [{
        type: mongoose.Types.ObjectId,
        ref: 'Movie'
    }],
    saved: [{
        type: mongoose.Types.ObjectId,
        ref: 'Movie'
    }],
    resetToken: String,
    resetTokenExpiration: Date
})

module.exports = mongoose.model('User', Userschema)