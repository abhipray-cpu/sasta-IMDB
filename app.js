const express = require('express')
const multer = require('multer')
const path = require('path')
const bodyParser = require('body-parser')
const app = express();
require('dotenv').config()
    //this is a storage engine which we can use with multer
const fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'imageData'); //null is bascally the error and images is the name of teh folder where we want to store the files
        },
        filename: (req, file, cb) => {
            //this replace is requried only for windows since windows storage path does not allow :
            cb(null, Math.round(Math.floor(new Date() / 1000)) + '-' + file.originalname) //file name is the hex encooding and original name is the original name of the file
        }
    })
    //this will filter only the requried files and will discard all other types of files

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } //will return the call back with a true value
    else {
        cb(null, false); //else will return false
    }
}
const csrf = require('csurf')
const mongoose = require('mongoose')
const MONGO_URI = process.env.MONGO_URI
const session = require('express-session')
const mongoSession = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
app.use(bodyParser.urlencoded({ extended: false }));
// we will using storage since it provides a lot more confifguration then dest
//dest: 'images'
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).array('image')) // we can alos add a destination which will tell the multer where to store the incoming file
    // multer needs to be executed as a function and single since we will be expectign a single file
    //if you want to use multiple files use the multiple option and image is the name we are using in our
    //input field
    /*
    we also need to cofigure multer for getting and storing the file in a proper file format
    */
app.use(express.static(path.join(__dirname, 'public')));
//now we also need to server the images folder statically so that we can display our images
//static files/folders are handled automatically by the express and all the heavy lifting in handled by express as well

//note we need to specify the starting clasuse of the route here since the static folders files are seved 
//like they are in the root folder
app.use('/imageData', express.static(path.join(__dirname, 'imageData')))
app.use('/images', express.static(path.join(__dirname, 'images')))
    //need to add /images to handle only /images 
app.set('view engine', 'ejs');
app.set('views', 'views');

// so now since we are also dealing with large files data in our forms
//they are no more simple form which we can handle and parse rateher they are multipart data
/*
which we need to handle that is we will be handling different types of input data in the same
form and hence need to parse the different types of data

right now we are handling/parsing only URL text encoded data i.e only text data but we also need
to parse biunary data since large files like images are not in form of tect but are binary files
we neeed to add anothe package multer that can parse the binary files like images and etc
we also need to change the form type in the view
multer is a middlware that will be executed on all the incoming requests
*/


const Store = new mongoSession({
    uri: MONGO_URI,
    collection: 'session'
})

const csrfProtection = csrf()
app.use(session({
    secret: process.env.SESSION_SECRET, // always make sure this key is a good and strong string
    resave: false,
    saveUninitialized: false,
    store: Store,

}))
app.use(csrfProtection);
//note for every post request there should be a valid csrf token for the request to get executed

app.use((req, res, next) => {

    res.locals.csrfToken = req.csrfToken();
    next();
    //now for every req rendered these two field will be included
})
app.use(flash())
const user = require('./router/user')
const movie = require('./router/movie')
const character = require('./router/character');
app.use(user);
app.use(movie)
app.use(character);
app.use((error, req, res, next) => {
    console.log(error);
    res.render('500.ejs') //if you want you can also add a field of error to 
        //display the error message
})
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(user => {
        console.log("The connection was successful!!")
        app.listen(4000)
    })
    .catch(err => console.log(err))

//what are errors here is some theory
/*
for synchronous code we can use try and catch
and for async code we are and will be using try and catch blocks
we can add a page and serve it with 500 status code which indicates
that some server side error has occured

usig the express middleware to handle the error

we can create new error object:
const error = new Error(some message or error object)
error.httpStatusCode=500 //since this will be a server side error
return next(error) // we will be returning the next object while passing an error to it

we can use a special middleware provided by node to catch the errors we will be throwing
app.use(errpr,req,res,next)=>{
    herer we can render the 505 error view with the mesage we want to show to the
    user passed as an argument
}

*/