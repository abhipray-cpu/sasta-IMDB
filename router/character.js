//this file deals witj user routes
const express = require('express')
const router = express.Router()
const controller = require('../controller/character.js')
const isAuth = (req, res, next) => {
    if (req.session.isloggedIn === true) {
        return next(); //make sure to return this next call
    } else {
        return res.redirect('/')
    }
}
router.get('/star/:starId', isAuth, controller.starPage)
router.get('/star_form', isAuth, controller.star_form)
router.post('/star_form_check', isAuth, controller.star_form_check)
module.exports = router