//in here we will be handling all the errors that can occur at server side
//by creating an error object and returning the next containing that error with the
//http status code of 500

/*
implementing async await improves the readibity of the code since the syntax now is more like synchronous approach
*/
const Character = require('../models/chracters.js')
const Movie = require('../models/movies')
const { validationResult } = require('express-validator')
exports.starPage = async(req, res, next) => {
    try {
        let star = await Character.findById(req.params.starId).populate('movies')
        res.render('starPage.ejs', {
            name: star.name,
            age: star.age,
            height: star.height,
            description: star.bio,
            movies: star.movies,
            images: star.images,
        })
    } catch (err) {
        console.log(err);
        res.render('500.ejs');
    }
}

exports.star_form = (req, res, next) => {
    res.render('star_form.ejs', {
        pageTitle: 'Add Star',
    });
}

exports.star_form_check = async(req, res, next) => {
    try {
        const imageObj = req.files;
        let images = await processImage(imageObj)
        let tags = await processTags(req.body.tags)
        let star = await new Character({
            name: req.body.name,
            images: images,
            bio: req.body.description,
            gender: req.body.gender,
            age: req.body.age,
            movies: [],
            height: req.body.height,
            tags: tags


        })
        let result = await star.save();
        res.redirect(`/star/${result._id}`)

    } catch (err) {
        console.log(err);
        res.render('500.ejs');
    }

}

function processImage(images) {
    try {
        imagePath = []
        images.forEach(image => {
            imagePath.push(image.path)
        })
        return imagePath;
    } catch (err) {
        console.log(err);
        return []
    }

}

function processTags(tags) {
    try {
        tagList = [];
        newTags = tags.split(',');
        newTags.forEach(tag => {
            tagList.push(tag.trim())
        })
        return tagList;
    } catch (err) {
        console.log(err);
        return []
    }
}