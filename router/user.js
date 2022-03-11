const express = require('express')
const router = express.Router()
const controller = require('../controller/user.js');
const user = require('../models/user')
const movies = require('../models/movies')
const isAuth = (req, res, next) => {
    if (req.session.isloggedIn === true) {
        return next(); //make sure to return this next call
    } else {
        return res.redirect('/')
    }
}
const { check, body } = require('express-validator')
router.get('/', controller.login)
router.post('/login', controller.login_check)
router.get('/user/:userId', isAuth, controller.user)
router.get('/signup', controller.signup)
router.post('/signup', [check('email').isEmail().withMessage('Please enter a valid email')
    .custom((value, { req }) => {
        if (value === 'dumkaabhipray@gmail.com') {
            throw new Error('this email address is forbidden')
        }
        return true //we return true if the validation succeeded
    })
    .custom((value, { req }) => {
        return user.find({ where: { email: value } })
            .then(user => {
                if (user.length > 0) {
                    return Promise.reject('This email already exists!') // we are returning a promise with reject which is basically an error message
                }
            })
            //let's see the chain we are returning a find ooperation which in turn will return a promis reject if an entry is found
    })
    .normalizeEmail() //this is a sanitization method for email
    ,
    //validator will look for password field in the body of req
    body('password', 'Please enter a valid password which is atleast 10 characters long') //the second key is the default message we want for all the validators check
    .isLength({ min: 10 })
    .trim() //this is a sanitization method for password
    ,
    body('confirm').custom((value, { req }) => {
        if (value === req.body.password) {
            return true
        } else
            throw new Error('The passwords you entered does not match')
    })
], controller.signup_check)
router.get('/logout', isAuth, controller.logout)
router.get('/change_password', isAuth, controller.ChangingPassword)
router.post('/changePassword', isAuth, controller.changePassword)
router.get('/ConfirmChange/:userId/:token', controller.confirmPasswordChange)
router.post('/confirmChange', [
        check('password', 'Please enter a valid password which is atleast 10 characters long') //the second key is the default message we want for all the validators check
        .isLength({ min: 10 })
        .trim() //this is a sanitization method for password
        ,
        check('password')
        .custom((value, { req }) => {
            if (value != req.body.Confirm) {
                throw new Error('The passwords you entered do not match');
            } else {
                return true;
            }
        })
    ],
    controller.confirmChange)
router.get('/likedVideo/:userId/', isAuth, controller.likedVideo);
router.get('/savedVideo/:userId/', isAuth, controller.savedVideo);
router.get('/likeVideo/:userId/:movieId', isAuth, controller.likeVideo);
router.get('/saveVideo/:userId/:movieId', isAuth, controller.saveVideo);
module.exports = router