const express = require('express');
const User = require('../models/user');
const Supplier = require('../models/supplier');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');
const emailValidator = require("email-validator");
const passwordValidator = require('password-validator');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

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

router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get( cors.cors,  authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({}).then((users) => {
    res.sendStatus(403);
    res.setHeader('Content-type','application/json');
    res.json(users);
  }, (err)=>next(err)).catch((err)=>next(err));
})
.post((req,res,next) => {
    res.status(405).send('405: Method not allowed!');
})
.put((req,res,next) => {
    res.status(405).send('405: Method not allowed!');
})
.delete((req,res,next) => {
    res.status(405).send('405: Method not allowed!');
});

router.route('/signup/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req,res,next) => {
    res.status(405).send('405: Method not allowed!');
})
.post(cors.corsWithOptions, (req, res, next) => {
  if( !emailValidator.validate(req.body.username) )
    return res.status(400).json({success: false, status: 'Invalid Email!'});
  if( !schemaPassword.validate(req.body.password) )
    return res.status(400).json({success: false, status: 'Invalid password!'});
  User.register(new User({username: req.body.username}), req.body.password,
  (err, user) => {
    if(err)
      next(err);
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
    if(req.body.isSupplier) {
      user.isSupplier = req.body.isSupplier
      Supplier.create({user:user._id, tradeName:req.body.tradeName}, (err,supplier) => {
        if(err) next(err);
      })
    }
    user.save((err, user) => {
      if(err)
        next(err);
      passport.authenticate('local')(req, res, () => {
        res.status(200).json({success: true, status: 'Registration Successful!'});
      })
    })
  })
});

router.route('/login')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get( (req,res,next) => {
  res.statusCode = 403;
  res.status(403).send('Method not supported');
})
.post( cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err)
    return next(err);
    if (!user) {
      res.status(401).json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.logIn(user, (err) => {
      if (err) {
        res.status(401).json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
      }
      var token = authenticate.getToken({_id: req.user._id});
      res.status(200).json({success: true, status: 'Login Successful!', token: token});
    });
  }) (req, res, next);
});


router.route('/forgotpassword.html')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get((req, res, next)=>{
  console.log('inside forgotpassword.html');
  res.render('forgot', { title: 'Reestablece tu contraseña' });
})
.post(cors.corsWithOptions, (req, res, next) => {
    crypto.randomBytes(32, (err, buff) => {
      var token = buff.toString('hex');
      if(err)
        return res.send(500).json({error:"Unknown error"});
      req.token = token;
      next();
    })
  },
  //With token generated, move on to the next function.
  (req, res, next) => {
    User.findOne({ username: req.body.email }, (err, user) => {
      if(!user) //Send email as if email existed for safety reasons
        return res.status(200).json({response:`Se ha enviado un email a ${req.body.email} con las instrucciones`});
      user.resetPasswordToken = req.token;
      user.resetPasswordExpiration = Date.now() + 3600000;
      user.save((err, user)=> {
        if(err)
          return res.status(200).json({response:`Se ha enviado un email a ${req.body.email} con las instrucciones`});
        //Create email with token
        var transportSettings = {
          host: "xxxx",
          port: 0,
          secure: false,
          requireTLS: false,
          auth: {
            user: "xxxx",
            pass: "xxxx"
          }
        };

        var resetMessage = {
          to: user.username,
          from: 'passwordreset@demo.com',
          subject: 'Reestablecer contraseña para ChefList.cl',
          text: 'You are receiving this because you (or someone else) has requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://cheflist.cl:443/api/users/resetpassword.html?t=' + req.token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        var transport = nodemailer.createTransport(transportSettings);
        transport.sendMail(resetMessage, (err, info) => {
        if(err)
          return res.status(500).send('Unknown error.');
        res.status(200).json({response:`Se ha enviado un email a ${req.body.username} con las instrucciones`});
        });
      })
    })
  }
  //end of post method
);

//Use query instead of params and .html in route so browsers don't run angular/ionic app.
router.route('/resetpassword.html')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req, res, next) => {
  User.findOne({ resetPasswordToken: req.query.t, resetPasswordExpiration: { $gt: Date.now()} },
  (err, user) => {
    if(err)
      return res.status(500).send('Unknown error.');
    if (!user)
      return res.status(403).send('This link has expired.');
    console.log("will render something now");
    res.render('reset', { title: 'Cambia tu Contraseña', firstname: user.firstname });
  })
})
.post(cors.corsWithOptions, (req, res, next) => {
  User.findOne({ resetPasswordToken: req.query.t, resetPasswordExpiration: { $gt: Date.now()} },
  (err, user) => {
    if(err)
      return res.status(500).send('Unknown error');
    if(!user)
      return res.status(401).send('User not found');
    var pw = req.body.password;
    if (!schemaPassword.validate(pw))
      return res.status(401).send('Invalid password');
    user.setPassword(pw , (err,user) => {
      if(err)
        res.status(401).send('Could not set password');
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiration = undefined;
      user.save((err,user)=>{
        if(err)
          return res.status(500).send('Unknown error');
        return res.status(200).send('Password changed');
      })
    })
  })
});

router.route('/changepassword')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  console.log("pw: " + req.body.password);
  console.log("npw: " + req.body.newpassword);
  if (!schemaPassword.validate(req.body.newpassword))
    return res.status(401).json({success: false, status: 'Contraseña inválida.'});
  User.findById(req.user._id, (err,user) => {
    if(err)
      return res.status(500).json({success: false, status: 'Ocurrió un error.'});
    if(!user)
      return res.status(401).json({success: false, status: 'Ocurrió un error.'});
    user.changePassword(req.body.password, req.body.newpassword, (err)=>{
      if(err)
        return res.status(401).json({success: false, status: 'Ocurrió un error.'});
      return res.status(200).json({success: true, status: 'Contraseña modificada exitósamente.'});
    })
  })
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

router.route('/edit')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id, (err,user) => {
    if(req.body.firstname)
      user.firstname = req.body.firstname;
    if(req.body.lastname)
      user.lastname = req.body.lastname;
    if(req.body.company)
        user.company = req.body.company;
    if(req.body.rut)
      user.rut = req.body.rut;
    if(req.body.phoneNumber)
      user.phoneNumber = req.body.phoneNumber;
    user.save((err, user) => {
      if(err)
        next(err);
      res.status(200).json({success: true, status: 'Edit Successful!'});
    })
  })
})


router.route('/checkJWTtoken')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req, res) => {
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
