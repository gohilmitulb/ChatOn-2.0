const express = require('express');
const session = require('express-session');
const path = require("path");
const app = express();
const mongoose = require('mongoose');
const port = 21000;

mongoose.connect('mongodb://0.0.0.0:27017/ChatOn', { useNewUrlParser: true })
    .then(() => {
        console.log('connected to MongoDB.');
    }).catch((err) => {
        console.log('Failed to connect to MongoDB: ', err);
    });

//Mongoose schema
const RegisterSchema = new mongoose.Schema({
    profile: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});
const newUser = mongoose.model('newUser', RegisterSchema);

//session middleware
app.use(session({
    secret: '2143',
    resave: false,
    saveUninitialized: false
}));

//EXPRESS STUFF
app.use('/static', express.static('static')); //for serving static file
app.use(express.urlencoded({ extended: true }));
 //helps form data to express

//HTML STUFF
app.engine('html', require('ejs').renderFile); //set the template engine as html
app.set('view engine', 'html'); //set the template engine as html
app.set('views', path.join(__dirname, 'views')); //set the view directory

//ENDPOINTS
app.get('/', (req, res) => {
    res.status(200).render('login.html');
});
app.get('/login', (req, res) => {
    res.status(200).render('login.html');
});
app.get('/register', (req, res) => {
    res.status(200).render('register.html');
});
app.post('/register', (req, res) => {
    if (req.body.password !== req.body.confirmPassword) {
        const errorMsg = 'Password and confirm password do not match!';
        res.status(200).send(`<script>alert("${errorMsg}");window.location.href = '/register';</script>`);
    } else {
        var registerData = new newUser(req.body);
        registerData.save().then(() => {
            res.redirect('/login');
        }).catch((err) => {
            res.send(err.message);
        });
    }
});
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    newUser.findOne({ email: email })
        .then(user => {
            if (!user) {
                const nouser = 'User not found';
                res.send(`<script>alert("${nouser}");window.location.href = '/login';</script>`);
            } else if (password !== user.password) {
                const invalidpassword = 'Invalid password';
                res.send(`<script>alert("${invalidpassword}");window.location.href = '/login';</script>`);
            } else {
                req.session.loggedIn = true;    
                // console.log("username: ",user.username);
                // const profile_img = user.profile;
                // console.log(profile_img)
                res.send(`<script>localStorage.setItem("username", "${user.username}"); localStorage.setItem("profile", "${user.profile}"); window.location.href = '/home';</script>`);
            }
        })
        .catch(error => {
            console.error(error);
            return res.status(500).send('Internal server error');
        });
});
app.get('/home', (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
    } else {
        res.render('index.html');
    }
});
app.get('/logout', (req,res)=>{
    req.session.loggedIn = false;
    res.redirect('/login');
})

//start server
app.listen(port, () => {
    console.log(`The application is listing on http://localhost:${port}/ `);
});