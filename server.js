const express = require('express');
const app = express();


// Require Body parser & JSON web token (JWT)
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

//set headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));


const PORT = 3000;
const secretKey = 'supersecretkey'; //ideally environment variable/file
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

//hardcoded users
let users = [
    {
        id: 1,
        username: 'tanvi',
        password: '123'
    },
    {
        id: 2,
        username: 'patil',
        password: '456'
    }

];



app.post('/api/login', (req, res) => {
    const {username, password } = req.body;
    for (let user of users){
        if (username == user.username && password == user.password){
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '7d'});
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        }
        else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
    }
    // console.log(username, password);
});

//Middleware to protect the dashboard (only logged in viewers)
app.get('/api/dashboard', jwtMW, (req, res) =>{
    //console.log (res);
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see'
    });
});
app.get('/api/prices', jwtMW, (req, res) =>{
    res.json({
        success: true,
        myContent: 'This is the price: $5.99'
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);

});