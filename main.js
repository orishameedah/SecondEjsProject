//CLOUDINARY DATABASE CONNECTION
//=============================
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const router = require('./routes/routes');
const path = require('path')

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.DB_ATLAS, {
    useNewUrlParser: true,     
    useUnifiedTopology: true, 
    useFindAndModify: false, 
});

const db = mongoose.connection;
db.on("error", (error)=> console.log(error));   
db.once('open',()=> console.log("connected to database!"));  


app.use(express.urlencoded({ extended: false })) 
app.use(express.json()) 
app.use(session({
    secret: 'mysecret ejs',
    saveUninitialized: true,
    resave: false,
}))

//for saving session message onto the req object
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// add this to view the images on the ejs page
// app.use(express.static('public'))
// app.use(express.static(path.join(__dirname, './public/uploads')))

// set the template engines which is EJS
app.set('view engine', 'ejs')

// app.get('/', (req, res)=> {
//     res.send('Hello world');
// })

//route prefix
app.use('', router);

app.listen(PORT, ()=>{
    console.log(`server running at http://localhost ${PORT}`);
})