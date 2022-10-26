const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { attoid } = require('attoid');

const app = express();
const port = 3000;

const users = [{
    username: 'Felix',
    email: 'felix@the.cat',
    password: '123456',
    avatar: 'https://placekitten.com/128/128',
}];

let tokens = {};

app.use(cors({
    origin: 'null',
    credentials: true,
}));
app.use(cookieParser('s3cr3t'));
app.use(express.urlencoded({ extended: false }));

app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

const getUserForToken = (token) => {
    if (!token) {
        return;
    }

    const username = tokens[token];
    if (username === undefined) {
        return;
    }

    return users.find(u => u.username === username);
};

// Serve home
app.get('/', (req, res) => {
    const user = getUserForToken(req.cookies.token);
    res.render('index', { user });
});

// Serve iframe
app.get('/iframe', (req, res) => {
    res.render('iframe');
});

// Serve login form
app.get('/login', (req, res) => {
    const user = getUserForToken(req.cookies.token);
    if (user !== undefined) {
        return res.redirect('/');
    }

    res.render('login');
});

// Process login form submission
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.render('login', { error: 'Invalid credentials.' });
    }

    const token = attoid();
    tokens[token] = user.username;

    res.cookie('token', token, {
        maxAge: 600000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    });
    res.redirect('/');
});

// Process logout
app.get('/logout', (req, res) => {
    const { token } = req.cookies;

    if (token) {
        delete tokens[token];
        res.clearCookie('token');
    }

    res.redirect('/');
});

// Get own user info
app.get('/api/getUserInfo', (req, res) => {
    const user = getUserForToken(req.cookies.token);
    if (user === undefined) {
        return res.status(403).send();
    }

    res.send(user);
});

app.listen(port, () => {
    console.log(`App 1 listening on port ${port}`);
});
