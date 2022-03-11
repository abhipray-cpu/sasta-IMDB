//in here we will be handling all the errors that can occur at server side
//by creating an error object and returning the next containing that error with the
//http status code of 500

/*
implementing async await improves the readibity of the code since the syntax now is more like synchronous approach
*/

const crypto = require('crypto');
const User = require('./models/user')
const Movie = require('./models/movies')
const MovieList = require('./models/movie_list')
const bcrypt = require('bcryptjs')
const nodeMailer = require('nodeMailer')
var userEmail = 'puttanpal@gmail.com';
var userPassword = 'Kamalanita1@';
const nodemailer = require('nodemailer')
const { validationResult } = require('express-validator')
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'abhipraydumka33@gmail.com',
        pass: 'kamalanita1@'
    },
    tls: {
        rejectUnauthorized: false
    }
})
exports.login = (req, res, next) => {

    if (req.session.isloggedIn === true) {

        res.redirect(`/user/${req.session.userId}`)
    } else {

        res.render('login.ejs', {
            pageTitle: 'Login',
            errorMessage: req.flash('errorpswd'),
            value: {
                user: '',
                password: ''
            }

        })
    }
}
exports.signup = (req, res, next) => {

    res.render('signup.ejs', {
        pageTitle: 'Signup',
        errorMessage: req.flash('errorUser'), //we simply specify the
        errorPaswd: req.flash('errorMismatch'),
        value: {
            userName: '',
            Email: '',
            Password: '',
            Confirm: ''
        }

    })
}
exports.login_check = (req, res, next) => {
    const name = req.body.name;
    const password = req.body.password
    User.find({ user: name })
        .then(user => {
            if (user.length > 0) {
                req.body.id = user[0].id
                bcrypt.compare(password, user[0].password)
                    .then(matched => {
                        if (matched === true) {
                            const user_id = req.body.id;
                            req.body.id = -1;

                            req.session.isloggedIn = true
                            req.session.userId = user_id
                            res.redirect(`/user/${user_id}`)
                        } else {
                            //in this case the passwoed does not so we will flash this info
                            req.flash('errorpswd', 'The password you entere is wrong so fuck off!!') //this method is now available in our app
                                //this metod takes a key value pair
                                //new we need to register in the page which will be rendered
                            res.render('login.ejs', {
                                pageTitle: 'Login',


                                errorMessage: req.flash('errorpswd'), //we simply specify the key in here
                                value: {
                                    user: req.body.name,
                                    password: ''
                                }
                            })
                        }
                    })
            } else {
                req.flash('errorUser', 'No such user found so fuck off !!')
                res.redirect('/signup')
            }
        })
        .catch(err => {
            console.log(err);
            const error = new Error('Server side erorr failed to fetch details')
            error.httpStatusCode = 500;
            return next(error);
        })


}
exports.signup_check = (req, res, next) => {
        const name = req.body.name;
        const password = req.body.password
        const confirm = req.body.confirm //this is the confirmation password
        const errors = validationResult(req) //all the errors realted to this req which were caught by the check middleware will be addded to this validationResult
        if (!errors.isEmpty()) {

            return res.status(422).render('signup.ejs', {
                pageTitle: 'Signup',

                errorMessage: req.flash('errorUser'), //we simply specify the
                errorPaswd: errors.array()[0].msg,
                value: {
                    userName: req.body.name,
                    Email: req.body.email,
                    Password: '',
                    Confirm: ''
                }
            })


            //we are setting the status code to 422 which is a commom validation failed status code and then we are rendering the same page
        }
        if (password === confirm) {
            console.log('if condition is reached')
            return bcrypt.hash(password, 13) //second param is the salt value which specifies the rounds of hashing implemented security and time taken are directly proportional to salt value
                .then(
                    hashedPassword => {
                        User.create({
                                user: name,
                                password: hashedPassword,
                                email: req.body.email
                            }).then(person => {
                                console.log('user is created sucessfully!!')
                                res.redirect('/')
                                let mailOptions = {
                                        to: req.body.email,
                                        from: 'abhipraydumka33@gmail.com',
                                        subject: "Signup confirmation",
                                        text: " WE are so happy that you chose our service",
                                        html: `<h1>Hey user these are your credentials</h1>
                                <ul>
                                <li><h3>User name: ${req.body.name}</h3></li>
                                <li><h3>Email : ${req.body.email}</h3></li>
                                <li><h3>Password: ${req.body.password}</h3></li>
                                
                                </ul>`
                                    }
                                    //since this sending of email might take some time therefore processing it asynchronously
                                return transporter.sendMail(mailOptions)
                                    .then(result => {
                                        console.log('mail sent successfully')
                                    })
                                    .catch(err => {
                                        const error = new Error('Server side erorr failed to send mail')
                                        error.httpStatusCode = 500;
                                        return next(error);
                                    })
                            })
                            .catch(err => console.log(err))
                    }
                )
                //here catch the password mismatched error
                .catch(err => { console.log(err) })
        } else {
            console.log('else condition is reached')
            req.flash('errorMismatch', 'The password does not match')
            res.render('signup.ejs', {
                pageTitle: 'Signup',

                errorMessage: req.flash('errorUser'), //we simply specify the
                errorPaswd: req.flash('errorMismatch'),
                value: {
                    userName: req.body.name,
                    Email: req.body.email,
                    Password: req.body.password,
                    Confirm: ''
                }
            })
        }
    }
    //here we will be using magic association methods to fetch all the movies belonging to a user
exports.user = (req, res, next) => {

    const ID = req.params.userId;
    MovieList.find({ user: ID }, { movies: 1 })
        .populate('movies')
        .then(movie => {
            if (movie.length > 0)
                return req.body.movies = movie[0].movies;
            else
                return req.body.movies = []
        })
        .then(roopa => {
            User.find({ user_id: ID })
                .then(user => {
                    // console.log('%j', req.body.movies);
                    res.render('user.ejs', {
                        pageTitle: 'User',
                        movies: req.body.movies,
                        user: ID,
                        name: user[0].user
                    })


                })
        })
        .catch(err => {
            console.error(err)
            const error = new Error('Server side erorr failed to fetch details')
            error.httpStatusCode = 500;
            return next(error);
        })



}
exports.Movie_form = (req, res, next) => {

    if (req.query.edit == 'true') {
        const MovieId = req.params.MovieId;
        Movie.findById(MovieId)
            .populate('voted')
            .then(movie => {
                res.render('movie_form.ejs', {
                    pageTitle: `Edit ${movie.title}`,
                    userId: movie.voted._id,
                    name: movie.title,
                    movie_id: movie._id,
                    description: movie.description,
                    edit: true,
                    user: movie.voted.user,
                    genre: movie.genre,
                    error: req.flash('movieError'),
                    param: ''

                })
            })
            .catch(err => {
                console.log(err);
            })
    } else {

        res.render('movie_form.ejs', {
            pageTitle: 'Sharing Movie....',
            user: '',
            name: '',
            description: 'Add a description for this movie',
            edit: false,
            userId: req.params.userId,
            movie_id: -1,
            error: req.flash('movieError'),
            param: ''
        })
    }
}

var pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ]
exports.Movies = (req, res, next) => {
    const data = req.params.genre
    const pageNumber = req.query.page
    const nextPage = Number(pageNumber) + 1
    const row = req.query.row

    console.log(pageNumber, row)
    if ((pageNumber - 1) % 10 == 0 && pageNumber != 1 && row == 'next') {
        console.log('this is the increment condition')
        newPage = []
        pages.forEach(page => {
            newPage.push(page + 10)
        })
        pages = newPage
    }
    if ((pageNumber) % 10 == 0 && pageNumber != 1 && row == 'prev') {
        console.log('this is the decrement condition')
        newPage = []
        pages.forEach(page => {
            newPage.push(page - 10)
        })
        pages = newPage
    }



    Movie.find()
        .skip(12 * (pageNumber - 1))
        .count()
        .then(movieCount => {

            if (data === 'all') {
                Movie.find().
                skip((pageNumber - 1) * 12)
                    .limit(12).
                populate('voted', 'user') //this will populate only user subfield of the embedded id
                    .then(movies => {
                        console.log(movies);
                        res.render('movies.ejs', {
                            pageTitle: 'Movie',
                            movies: movies,
                            currPage: pageNumber,
                            hasPrevious: pageNumber,
                            hasNext: Math.ceil(movieCount / 6),
                            pages: pages,
                            next: nextPage,


                        })

                    }).catch(err => console.log(err))
            } else

            {
                if (data === 'Action') {
                    Movie.find({ genre: 'Action' }).
                    skip((pageNumber - 1) * 12)
                        .limit(12).
                    populate('voted', 'user') //this will populate only user subfield of the embedded id
                        .then(movies => {
                            console.log(movies);
                            res.render('movies.ejs', {
                                pageTitle: 'Movie',
                                movies: movies,
                                currPage: pageNumber,
                                hasPrevious: pageNumber,
                                hasNext: Math.ceil(movieCount / 6),
                                pages: pages,
                                next: nextPage,


                            })

                        }).catch(err => console.log(err))
                } else if (data === 'Comedy') {
                    Movie.find({ genre: 'Comedy' })
                        .populate('voted', 'user')
                        .then(movies => {

                            res.render('movies.ejs', {
                                pageTitle: 'Movie',
                                movies: movies,
                                currPage: pageNumber,
                                hasPrevious: pageNumber,
                                hasNext: Math.ceil(movieCount / 6),
                                pages: pages,
                                next: nextPage,


                            })
                        })
                        .catch(err => console.log(err))

                } else if (data === 'Horror') {
                    Movie.find({ genre: 'Horror' })
                        .populate('voted', 'user')
                        .then(movies => {

                            res.render('movies.ejs', {
                                pageTitle: 'Movie',
                                movies: movies,
                                currPage: pageNumber,
                                hasPrevious: pageNumber,
                                hasNext: Math.ceil(movieCount / 6),
                                pages: pages,
                                next: nextPage,


                            })
                        })
                        .catch(err => console.log(err))

                } else if (data === 'Thriller') {
                    Movie.find({ genre: 'Thriller' })
                        .populate('voted', 'user')
                        .then(movies => {

                            res.render('movies.ejs', {
                                pageTitle: 'Movie',
                                movies: movies,
                                currPage: pageNumber,
                                hasPrevious: pageNumber,
                                hasNext: Math.ceil(movieCount / 6),
                                pages: pages,
                                next: nextPage,


                            })
                        })
                        .catch(err => console.log(err))

                } else if (data === 'SCIFI') {
                    Movie.find({ genre: 'SCIFI' })
                        .populate('voted', 'user')
                        .then(movies => {

                            res.render('movies.ejs', {
                                pageTitle: 'Movie',
                                movies: movies,
                                currPage: pageNumber,
                                hasPrevious: pageNumber,
                                hasNext: Math.ceil(movieCount / 6),
                                pages: pages,
                                next: nextPage,


                            })
                        })
                        .catch(err => console.log(err))

                } else if (data === 'Mythology') {
                    Movie.find({ genre: 'Mythology' })
                        .populate('voted', 'user')
                        .then(movies => {

                            res.render('movies.ejs', {
                                pageTitle: 'Movie',
                                movies: movies,
                                currPage: pageNumber,
                                hasPrevious: pageNumber,
                                hasNext: Math.ceil(movieCount / 6),
                                pages: pages,
                                next: nextPage,


                            })
                        })
                        .catch(err => console.log(err))

                } else if (data === 'RomCom') {

                    Movie.find({ genre: 'RomCom' })
                        .populate('voted', 'user')
                        .then(movies => {

                            res.render('movies.ejs', {
                                pageTitle: 'Movie',
                                movies: movies,
                                currPage: pageNumber,
                                hasPrevious: pageNumber,
                                hasNext: Math.ceil(movieCount / 6),
                                pages: pages,
                                next: nextPage,


                            })
                        })
                        .catch(err => console.log(err))
                }


            }
        })
        .catch(err => {
            console.log(err);
            const error = new Error('Server side erorr failed to save details')
            error.httpStatusCode = 500;
            return next(error);
        })




}

exports.Movie_form_check = (req, res, next) => {

        const imageUrl = req.file; //now we access the file field in the incoming request
        console.log('*********************************************************************************');
        console.log('This is the image file data we have which is a buffer basically');
        console.log(imageUrl) //don't know for sure but you need to use some other name then the one you are using for file
        console.log('*********************************************************************************');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('movieError', errors.errors[0].msg)


            return res.status(422).render('movie_form.ejs', {
                pageTitle: 'Movie_form_create',
                user: req.body.voted,
                name: req.body.title,
                description: req.body.description,
                edit: false,
                movie_id: -1,
                csrfToken: req.csrfToken(),
                error: req.flash('movieError'),
                param: errors.errors[0].param



            })

        }
        if (imageUrl) {
            req.session.image = imageUrl.path;
            if (req.body.edit === 'true') {
                Movie.findById(req.body.movie_id)
                    .then(movie => {
                        movie.title = req.body.title,
                            movie.genre = req.body.genre,
                            movie.description = req.body.description
                        movie.filePath = req.session.image,
                            movie.avgRating = movie.avgRating,
                            movie.ratings = movie.ratings
                        return movie.save();
                    })
                    .then(result => {
                        res.redirect(`/user/${req.body.user_id}`)
                    })
                    .catch(err => console.log(err))

            } else {
                User.find({ user: req.body.voted })
                    .then(user => {
                        req.body.user_id = user[0]._id
                        var movie = new Movie({
                            voted: user[0]._id,
                            title: req.body.title,
                            genre: req.body.genre,
                            description: req.body.description,
                            filePath: req.session.image,
                            avgRating: 0,
                            ratings: []
                        })
                        return movie.save()
                    })
                    .then(result => {
                        req.body.movie = result

                        return MovieList.find({ user: req.body.user_id })
                    })
                    .then(user => {

                        if (user.length > 0) {

                            return user
                        } else {
                            movieId = req.body.movie_id
                            userMovie = new MovieList({
                                user: req.body.user_id,
                                movies: []

                            })
                            return userMovie.save()
                        }
                    })
                    //update the movies in this section
                    .then(user => {

                        if (user.length > 0) {
                            user = user[0]
                        }
                        new_movies = user.movies
                        new_movies.push(req.body.movie._id)
                        user.movies = new_movies
                        return user.save()

                    })
                    .then(
                        roopa => {
                            console.log('The movie was saved successfully!!')
                            res.redirect('/movie/all?page=1');
                        }
                    )

                .catch(err => {
                    console.log(err)
                    const error = new Error('Server side erorr failed to save your movie')
                    error.httpStatusCode = 500;
                    return next(error);
                })


            }

        } else {
            res.render('movie_form.ejs', {
                pageTitle: 'Movie_form_create',
                user: req.body.voted,
                name: req.body,
                title,
                description: req.body.description,
                edit: false,
                userId: req.session.userId,
                movie_id: -1,
                error: 'Plz enter a file of valid format',
                param: ''
            })
        }





    }
    //delete and update operations are left do them tommorow along with edit and cart 
exports.delete = (req, res, next) => {

    const movieId = req.params.movie_id;
    Movie.findById(movieId)
        .then(movie => {
            req.body.user = movie.voted;
            return Movie.deleteOne({ _id: movie._id })
        })
        .then(result => {
            console.log(result);
            res.redirect(`/user/${req.body.user}`);
        })
        .catch(err => { console.log(err); })


}
exports.logout = (req, res, next) => {
    //for logging out we simply delte a session
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/')
    });
}

exports.ChangingPassword = (req, res, next) => {
    //attaching the current user to the req
    res.render('passwordChange1.ejs', {
        user: req.session.userId,
        message: '',
        error: req.flash('passwordChange')
    })

}

exports.changePassword = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.status(422).res.render('passwordChange1.ejs', {
                user: req.session.userId,
                message: '',
                error: 'Something went wrong on our side'
            })
        }
        req.session.token = buffer.toString('hex');
    })
    error =
        User.findById(req.session.userId)
        .then(user => {
            if (user) {
                return user
            } else {
                req.flash('passwordChange', 'No such user was found');
                res.render('passwordChange1.ejs', {
                    user: req.session.userId,
                    message: '',
                    error: req.flash('passwordChange')
                })
            }
        })
        .then(user => {
            req.session.email = user.email;
            user.resetToken = req.session.token;
            user.resetTokenExpiration = Date.now() + 60000;
            return user.save();
        })
        .then(user => {
            bcrypt.compare(req.body.password, user.password)
                .then(matched => {
                    if (matched === true) {
                        let mailOptions = {
                                to: req.session.email,
                                from: 'abhipraydumka33@gmail.com',
                                subject: "Password Change",
                                text: "Use the link to change the password if not sent by you \n Then sorry my friend you are fucked",
                                html: `<h1>Use this link to change the password</h1>
                                <a href='http://localhost:4000/ConfirmChange/${req.session.userId}/${req.session.token}'>Change password</a>`
                            }
                            //since this sending of email might take some time therefore processing it asynchronously
                        return transporter.sendMail(mailOptions)
                            .then(result => {
                                console.log('mail sent successfully');
                                //render the same page with a message
                                res.render('passwordChange1.ejs', {
                                    user: req.session.userId,
                                    message: 'A mail has been sent to your email id with password reset link',
                                    error: ''
                                })
                            })
                            .catch(err => {
                                console.log('sending mail failed');
                                console.log(err);
                                res.render('passwordChange1.ejs', {
                                    user: req.session.userId,
                                    message: 'Sending mail failed please try again',
                                    error: ''
                                })
                            })

                    } else {
                        req.flash('passwordChange', 'Wrong Password');
                        res.render('passwordChange1.ejs', {
                            user: req.session.userId,
                            message: '',
                            error: req.flash('passwordChange')
                        })
                    }
                })
        })
        .catch(err => {
            const error = new Error('Server side erorr failed to fetch details')
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.confirmPasswordChange = (req, res, next) => {
    User.findById(req.params.userId)
        //if you want to include a time restraint you can do like this
        //User.find({resetToken:token,resetTokenExpiration:{$gt:Date.now()}})
        .then(user => {
            console.log(user)
            console.log(user.resetToken)

            if (user.resetToken == req.params.token) {
                let currDate = new Date();
                if (user.resetTokenExpiration.getTime() <= currDate.getTime()) {
                    res.render('passwordChange2.ejs', {
                        userId: user._id,
                        error: ''
                    })
                } else {
                    res.render('passwordChange1.ejs', {
                        user: req.session.userId,
                        message: '',
                        error: req.flash('Timeout error')
                    })
                }
            }
        })
        .catch(err => {
            console.log(err);
        })
}

exports.confirmChange = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('passwordChange2.ejs', {
            userId: req.body.userId,
            error: errors.errors[0].msg

        })
    } else {
        User.findById(req.body.userId)
            .then(user => {
                bcrypt.compare(req.body.password, user.password)
                    .then(matched => {
                        if (matched === true) {
                            return res.status(422).render('passwordChange2.ejs', {
                                userId: req.body.userId,
                                error: 'This is same as your old password'

                            })
                        } else {
                            return bcrypt.hash(req.body.password, 13)
                                .then(password => {
                                    req.session.currPassword = password;
                                    User.findById(req.body.userId)
                                        .then(user => {
                                            user.password = req.session.currPassword;
                                            req.session.currPassword = ''
                                            return user.save();
                                        })
                                        .then(result => {
                                            console.log(result);
                                            console.log('The password was changed successfully!!');
                                            res.render('login.ejs', {
                                                pageTitle: 'Login',
                                                errorMessage: '',
                                                value: {
                                                    user: '',
                                                    password: ''
                                                }

                                            })

                                        })
                                        .catch(err => {
                                            console.log(err);
                                            return res.status(422).render('passwordChange2.ejs', {
                                                userId: req.body.userId,
                                                error: 'Faield to update password'

                                            })
                                        })
                                })
                        }
                    })
            })
            .catch(err => {
                console.log(err);
                return res.status(422).render('passwordChange2.ejs', {
                    userId: req.body.userId,
                    error: 'Try again'

                })
            })
    }
}

//using this mechanism you just need to create UI now and wire up the data to display search results
exports.searchValue = (req, res, next) => {
    const searchVal = req.body.search_val;
    const words = searchVal.split(' ');
    const Categories = ['Comedy', 'Horror', 'Action', 'Thriller', 'SCIFI', 'Mythology', 'RomCom'];
    words.forEach(word => {
        if (word == 'Comedy' || word == 'comedy' || word == 'Funny' || word == 'funny' || word == 'parody' || word == 'Parody') {
            Movie.find({ genre: 'Comedy' })
                .then(movies => {
                    res.render('./search.ejs', {
                        movies: movies
                    })
                })
                .catch(err => { console.log(err) })

        } else if (word == 'Horror' || word == 'horror' || word == "haunted" || word == "Haunted" || word == "Paranormal" || word == "paranormal" || word == "Monster" || word == "monster") {
            Movie.find({ genre: 'Horror' })
                .then(movies => {
                    res.render('./search.ejs', {
                        movies: movies
                    })
                })
                .catch(err => { console.log(err) })


        } else if (word == 'Action' || word == 'action' || word == 'Fight' || word == "fight") {
            Movie.find({ genre: 'Action' })
                .then(movies => {
                    res.render('./search.ejs', {
                        movies: movies
                    })
                })
                .catch(err => { console.log(err) })


        } else if (word == 'Thirller' || word == 'thriller' || word == 'thrill' || word == "Thrill") {
            Movie.find({ genre: 'Thriller' })
                .then(movies => {
                    res.render('./search.ejs', {
                        movies: movies
                    })
                })
                .catch(err => { console.log(err) })


        } else if (word == 'SCIFI' || word == 'scifi' || word == 'science' || word == "scientific" || word == "technology" || word == "fantasy") {
            Movie.find({ genre: 'SCIFI' })
                .then(movies => {
                    res.render('./search.ejs', {
                        movies: movies
                    })
                })
                .catch(err => { console.log(err) })

        } else if (word == 'Mythology' || word == 'mythology' || word == 'myth' || word == "Myth" || word == 'ancient' || word == "Ancient") {
            Movie.find({ genre: 'Mythology' })
                .then(movies => {
                    res.render('./search.ejs', {
                        movies: movies
                    })
                })
                .catch(err => { console.log(err) })

        } else if (word == 'RomCom' || word == 'romcom' || word == 'romance' || word == 'Romance' || word == 'Teen Love' || word == 'teen love') {
            Movie.find({ genre: 'RomCom' })
                .then(movies => {
                    res.render('./search.ejs', {
                        movies: movies
                    })
                })
                .catch(err => { console.log(err) })

        } else {
            Movie.find({ title: searchVal })
                .then(movie => {
                    if (movie.length > 0) {
                        movie = movie[0];
                        res.render('./search.ejs', {
                            movies: movie
                        })
                    } else {
                        res.render('500.ejs')
                    }
                })
                .catch(err => {
                    console.log(err => {
                        err;
                        res.render('500.ejs');
                    })
                })
        }
    })

}

exports.moviePage = (req, res, next) => {
    console.log(req.params.movieId)
    res.render('moviePage.ejs');
}
exports.starPage = (req, res, next) => {
    console.log(req.params.starId)
    res.render('starPage.ejs');
}

exports.star_form = (req, res, next) => {
    res.render('star_form.ejs', {
        pageTitle: 'Add Star',
    });
}