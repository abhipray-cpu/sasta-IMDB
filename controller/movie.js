//in here we will be handling all the errors that can occur at server side
//by creating an error object and returning the next containing that error with the
//http status code of 500

/*
implementing async await improves the readibity of the code since the syntax now is more like synchronous approach
*/


const Movie = require('../models/movies')
const MovieList = require('../models/movie_list')
const Character = require('../models/chracters.js')
const Review = require('../models/reviews.js');
const mongoose = require('mongoose');
const { update } = require('../models/movies');
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
                            user: req.session.userId


                        })

                    }).catch(err => console.log(err))
            } else {
                Movie.find({ genre: data }).
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
                            user: req.session.userId


                        })

                    }).catch(err => console.log(err))
            }
        })
        .catch(err => {
            console.log(err);
            const error = new Error('Server side erorr failed to save details')
            error.httpStatusCode = 500;
            return next(error);
        })




}

//in this need to add a helper 2 helper functions
/*
function1: this will iterate through all the crew name and will call the second function with the value
function2: this will update the character entry with the movie id
*/
exports.Movie_form_check = async(req, res, next) => {

    if (req.query.edit === 'false') {
        try {
            const image = req.files[0].path;
            let cast = await processCast(req.body.cast);
            let tags = processTags(req.body.tags);
            let result = await new Movie({
                title: req.body.name,
                description: req.body.description,
                genre: req.body.genre,
                voted: req.session.userId,
                filePath: image,
                avgRating: 0.0,
                ratings: [],
                cast: cast,
                tags: tags,
                duration: req.body.duration,
                yearOfRelease: req.body.released,
                director: cast[0]['star']
            })
            let momment = await (result.save());
            res.redirect(`/moviePage/${momment._id}`);
        } catch (err) {
            console.log(err)
            res.render('500.ejs')
        }
    } else if (req.query.edit === 'true') {
        console.log('req is reaching in the else condition')
        try {
            const image = req.files[0].path;
            let tags = processTags(req.body.tags);
            console.log(tags);
            let result = await Movie.findOneAndUpdate({ title: req.body.name }, {
                $set: {
                    description: req.body.description,
                    genre: req.body.genre,
                    filePath: image,
                    tags: tags,
                    duration: req.body.duration,
                    yearOfRelease: req.body.released,
                }
            }, { new: true })
            await result.save();
            //later add the movie page redirection in here
            console.log('the result was updated successfully!')
        } catch (err) {
            console.log(err)
            res.render('500.ejs')
        }
    }
}

function processTags(tags) {
    try {
        let tagsArray = tags.split(',');
        return tagsArray;
    } catch (err) {
        console.log(err);
        return []
    }
}
//this function will return a dictionary of director and other crew
function processCast(cast) {
    try {
        var castArray = [];
        let stage1 = cast.split(';');
        stage1.forEach(crew => {
            let prop = crew.split(',');
            if (prop.length >= 3) {
                castArray.push({ "star": prop[0].trim(), "role": prop[1].trim(), "name": prop[2].trim() })
            }

        })
        return castArray;
    } catch (err) {
        console.log(err);
        return []
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

async function addMapping(movie) {
    let list = MovieList.find({ user: movie.voted });
    if (list.length > 0) {
        let movies = list[0].movies;
        movies.push(movie._id)
        let result = await MovieList.findOneAndUpdate({
            user: movie.voted
        }, { $set: { movies: movies } }, { new: true });
        await result.save()
    } else {
        let newList = new MovieList({
            user: movie.voted,
            movies: [movie._id]
        });
        await newList.save();
    }
    try {

    } catch (err) {
        console.log(err);
        return;
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
exports.movieEdit = (req, res, next) => {
        const user = mongoose.Types.ObjectId(req.params.userID);
        const movieId = mongoose.Types.ObjectId(req.params.movieId);

        Movie.findById(movieId)
            .then(movie => {
                if (movie.voted.toString() === user.toString()) {
                    res.render('movie_edit_form.ejs', {
                        movie: movie
                    })
                } else {
                    res.redirect('/user/' + user);
                }
            })
            .catch(err => {
                console.log(err);
                res.render('500.ejs');
            })
    }
    //adding movie needs to be updated so that a mapping of of star and movie can be made 
exports.moviePage = async(req, res, next) => {
    const movieId = mongoose.Types.ObjectId(req.params.movieId)
    let movie = await Movie.findById(movieId);
    let cast = await processCast(movie.cast);
    let director = await getDirector(movie.director)
        //console.log(movie)
        //console.log(cast)
        //console.log(director)
    const reviews = await fetchReviews(movieId)
    res.render('moviePage.ejs', {
        movieId: movie._id,
        wallpaper: movie.filePath,
        name: movie.title,
        rating: movie.avgRating,
        duration: movie.duration,
        plot: movie.description,
        yearOfRelease: movie.yearOfRelease,
        cast: cast,
        director: director[0],
        user: req.session.userId,
        reviews: reviews
    });
}
async function processCast(cast) {
    let arr2 = []
    let arr1 = [];
    let transit = [];
    cast.forEach(crew => {
        transit.push(crew['star'])
        arr2.push({ 'role': crew['role'], 'name': crew['name'] })
    })
    let result = await Character.find().select({ name: 1, images: 1 }).where('name').in(transit).exec();;
    for (let i = 0; i < result.length; i++) {
        arr1.push({ 'data': result[i], 'metaData': arr2[i] })
    }
    return arr1;
}
async function getDirector(dir) {
    let director = await Character.find({ name: dir }).select({ name: 1, images: 1, bio: 1 }).exec();
    return director;
}

//this is the fetch review function which basically fetches the reviews belonging to the movie
async function fetchReviews(movieId) {
    try {
        const reviews = await Review.find({ movie: movieId })
            .populate('user', { user: 1, _id: -1 })
        return reviews
    } catch (err) {
        console.log(err);
        return []
    }

}
exports.trending = async(req, res, next) => {
    //this can be improved by keeping track of likes at an interval of one week and
    //then sorting based on the differnce this will give an estimate of weekly likes and therfore trend
    try {
        let top = await Movie.find({}).sort({ 'avgRating': -1 }).limit(100);
        res.render('trending.ejs', {
            pageTitle: 'Movie',
            movies: top,
            user: req.session.userId


        })
    } catch (err) {
        console.log(err);
        res.render('500.ejs');
    }
}

//this is the review controller 
exports.review = async(req, res, next) => {
    const userId = mongoose.Types.ObjectId(req.params.userID);
    const movieId = mongoose.Types.ObjectId(req.params.movieId);
    const key = Object.keys(req.body)[1];
    const rating = parseFloat(req.body[key]);
    try {
        let review = await Review.find({
            user: userId,
            movie: movieId
        })
        if (review.length > 0)
            updateReview(userId, movieId, rating, req.body.content, res)
        else
            createReview(userId, movieId, rating, req.body.content, res)

    } catch (err) {
        console.log(err);
        res.redirect('500.ejs')
    }

}

async function createReview(userId, movieId, ratings, content, res) {
    try {
        let review = await new Review({
            user: userId,
            movie: movieId,
            rating: ratings,
            content: content
        })
        await review.save();
        try {
            await newRating(movieId, ratings)
            res.redirect(`/moviePage/${movieId}`);
        } catch (err) {
            console.log(err);
            res.redirect(`/moviePage/${movieId}`);
        }

    } catch (err) {
        console.log(err);
        res.render('500.ejs');
    }
}
async function updateReview(userId, movieId, rating, review, res) {
    console.log('review is being updated')
    try {

        const updateReview = await Review.findOneAndUpdate({ user: userId, movie: movieId }, {
            rating: rating,
            content: review
        }, { new: true })
        await updateReview.save();

        const ratings = await Review.find({ user: userId, movie: movieId })
        const count = ratings.length;
        let sum = 0;
        ratings.forEach(rating => {
            sum += rating.rating;
        })

        const avg = (parseFloat(sum).toFixed(1) / parseFloat(count).toFixed(1)).toFixed(1);
        const result = await Movie.findOneAndUpdate({ _id: movieId }, { rating: avg }, { new: true });
        await result.save();
        res.redirect(`/moviePage/${movieId}`);
    } catch (err) {
        console.log(err);
        res.render('500.ejs')
    }
}

async function newRating(movieId, new_rating) {
    const ratings = await Review.find({ movie: movieId })
    const count = ratings.length;
    let sum = 0;
    ratings.forEach(rating => {
        sum += rating.rating;
    })
    sum += new_rating;
    const avg = (parseFloat(sum).toFixed(1) / parseFloat(count + 1).toFixed(1)).toFixed(1);
    const result = await Movie.findOneAndUpdate({ _id: movieId }, { avgRating: avg }, { new: true });
    await result.save()
}