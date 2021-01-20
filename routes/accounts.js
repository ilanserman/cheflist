const express = require('express');
const User = require('../models/user');
const cors = require('./cors');
const emailValidator = require("email-validator");
const passwordValidator = require('password-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

router.route('/index.html')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req, res, next) => {
  console.log("accounts route");
  res.status(200).send('You are not supposed to be here!1');
});



/*router.route('/changepassword.html')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req, res, next) => {

});
*/

module.exports = router;
