const express = require('express');
const User = require('../models/user');
const Supplier = require('../models/supplier');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');
const emailValidator = require("email-validator");
const passwordValidator = require('password-validator');

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

var schemaPassword = new passwordValidator();
schemaPassword
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(1)                                // Must have at least 1 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Clave', 'clave', 'Passw0rd', 'Password123']); // Blacklist these values

//router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )
//cors.corsWithOptions,

router.route('/')
.get( cors.cors,  authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({}).then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-type','application/json');
    res.json(users);
  }, (err)=>next(err)).catch((err)=>next(err));
});

router.route('/signup/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post( cors.corsWithOptions, (req, res, next) => {
  if ( emailValidator.validate(req.body.username) && schemaPassword.validate(req.body.password) ){
    User.register(new User({username: req.body.username}),
    req.body.password, (err, user) => {
      if(err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      }
      else {
        if(req.body.firstname)
        user.firstname = req.body.firstname;
        if(req.body.lastname)
        user.lastname = req.body.lastname;
        if(req.body.company)
        user.company = req.body.company;
        if(req.body.rut)
        user.rut = req.body.rut;
        if(req.body.phonenumber)
        user.phonenumber = req.body.phonenumber;
        //If user is supplier then also create a supplier document for the user
        if(req.body.supplier === true) {
          user.supplier = true;
        }

        user.save((err,user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.json({success: true, status: 'Registration Successful!'});
            //console.log(user)
            supplier = new Supplier({user: user._id});
            supplier.save();

          });
        });
      }
    });

  } else {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send({ error: 'Something failed!' });
  }
});

router.route('/login')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post( cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err)
    return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
      }

      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Login Successful!', token: token});
    });
  }) (req, res, next);
})

.put( (req,res,next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported');
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(); //this is a method from session
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

router.get('/checkJWTtoken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, user: user});

    }
  }) (req, res);
});


module.exports = router;
