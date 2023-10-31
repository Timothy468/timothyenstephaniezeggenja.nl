if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const path = require('path')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    name => users.find(user => user.name === name),
    id => users.find(user => user.id === id),
    password => users.find(user => user.password === password)
    )

const app = express()

const users = [{
  id: process.env.USER_ID,
  name: process.env.USER_NAME,
  password: process.env.USER_PASSWORD,
}, {
  id: process.env.USER_ID2,
  name: process.env.USER_NAME2,
  password: process.env.USER_PASSWORD2,
}]

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/',checkAuthenticated, (req, res) =>{
  res.render('index.ejs', { name: req.user.name })
})

app.get('/programma',checkAuthenticated, (req, res) =>{
  res.render('programma.ejs', { name: req.user.name })
})

app.get('/RSVP',checkAuthenticated, (req, res) =>{
  res.render('RSVP.ejs', { name: req.user.name })
})

app.get('/diner',checkAuthenticated, (req, res) =>{
  res.render('diner.ejs', { name: req.user.name })
})

app.get('/overnachting',checkAuthenticated, (req, res) =>{
  res.render('overnachting.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) =>{
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) =>{
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
          id: Date.now().toString(),
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword
        })
        res.redirect('/login')
      } catch {
        res.redirect('/register')
      }
      console.log(users)
    })

    app.delete('/logout', (req, res) => {
        req.logOut(function(err) {
            if (err) { return next(err)}
                res.redirect('/login')
            })
    })


    function checkAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return next()
        }
      
        res.redirect('/login')
      }
      
      function checkNotAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return res.redirect('/'),
          console.log('already logged in')
        }
        next()
      }

app.listen(3000, () => {
        console.log("Listening on port 3000");
      });