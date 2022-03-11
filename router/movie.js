const express = require('express')
const router = express.Router()
const controller = require('../controller/movie.js')
const user = require('../models/user')
const movies = require('../models/movies')
const isAuth = (req, res, next) => {
    if (req.session.isloggedIn === true) {
        return next(); //make sure to return this next call
    } else {
        return res.redirect('/')
    }
}

router.get('/movie_form/:userId/:MovieId', isAuth, controller.Movie_form)
router.post('/movie_form_check', isAuth, controller.Movie_form_check)
router.get('/movie/:genre', isAuth, controller.Movies)
router.get('/delete/:movie_id', isAuth, controller.delete)
router.post('/search', controller.searchValue)
router.get('/moviePage/:movieId', isAuth, controller.moviePage);
router.get('/trending', isAuth, controller.trending);
router.get('/movieEdit/:movieId/:userID', isAuth, controller.movieEdit);
router.post('/review/:movieId/:userID', controller.review);
module.exports = router