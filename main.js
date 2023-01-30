//basic structure of backend server
// require('dotenv').config(); //it enables access to environment inside .env
// const express = require('express');
// const mongoose = require('mongoose');
// const session = require('express-session');

// const app = express();
// const PORT = process.env.PORT || 4000;

// app.get('/', (req, res)=> {
//     res.send('Hello world');
// })

// app.listen(PORT, ()=>{
//     console.log(`server running at http://localhost ${PORT}`);
// })

//=============================
//database connection

// require('dotenv').config(); //it enables access to environment inside .env
// const express = require('express');
// const mongoose = require('mongoose');
// const session = require('express-session');

// const app = express();
// const PORT = process.env.PORT || 4000;

// mongoose.connect(process.env.DB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.on("error", (error)=> console.log(error));
// db.once('open',()=> console.log("connected to database!"));

// app.get('/', (req, res)=> {
//     res.send('Hello world');
// })

// app.listen(PORT, ()=>{
//     console.log(`server running at http://localhost ${PORT}`);
// })

//=============================
//add middleware (is a function that has three arguments which all the arguments are object (req, res, next))
require('dotenv').config(); //it enables access to environment inside .env
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const router = require('./routes/routes');
const path = require('path')

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.DB_ATLAS, {
    useNewUrlParser: true,     //this will ensure the connection of our application and mongodb
    useUnifiedTopology: true,  
});

const db = mongoose.connection;
db.on("error", (error)=> console.log(error));   //on means when it is disconnected it should throw an error
db.once('open',()=> console.log("connected to database!"));  //once means successful connection

//middleware is a function that has three arguments which all the arguments are object (req, res, next)
app.use(express.urlencoded({ extended: false })) //it enables user to send and receive data from frontend to backend
app.use(express.json()) //send information from javascript format to json format to be reable in our server application
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
app.use(express.static('public'))
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