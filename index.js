const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
const flash = require('connect-flash')
const session = require('express-session')
const user = require('./models/user')
app.set('view engine', 'ejs')
app.set('/views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: 'notagoodsecret' }))
app.use(flash())


mongoose.set('strictQuery', false);
mongoose.connect('mongodb://0.0.0.0:27017/authDemo', { useNewUrlParser: true, useUnifiedTopology: true })

    .then(() => {
        console.log("Mongo Connection open !!")
    })
    .catch(err => {
        console.log("Mongo connection  Error")
        console.log(err)
    })
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {

        return res.redirect('/login')
    }
    next()

}


app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/', (req, res) => {
    res.send('this is the homepage')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {

    const { username, password } = req.body

    const User = new user({ username, password })
    await User.save()
    req.session.user_id = User._id
    res.redirect('/')

})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const foundUser = await user.findAndValidate(username, password)
    if (foundUser) {
        req.session.user_id = foundUser._id
        req.flash('success', 'logged in successfully')
        res.redirect('/secret')
    }
    else {
        req.flash('error', 'invalid username or password !')
        res.redirect('/login')
    }


})

app.post('/logout', (req, res) => {



    req.session.destroy()
    res.redirect('/login')

})

app.get('/secret', requireLogin, (req, res) => {

    res.render('secret')
})

app.get('/anotherSecret', requireLogin, (req, res) => {
    res.send('another secret page')
})





app.listen(3000, () => {
    console.log('Server reading on port 3000')
})
