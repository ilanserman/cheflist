const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');
const crypto = require('crypto');
const mime = require('mime');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/var/www/images/logos');
    },
    filename: (req, file, cb) => {
      crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
      })
    }
})

const imageLimits = { fieldSize: 500000 };

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter, limits: imageLimits});

const uploadRouter = express.Router();

uploadRouter.use(express.json());
uploadRouter.use(express.urlencoded({ extended: false }));

uploadRouter.route('/')
//.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
  res.status(405).send('405: Method not allowed!');
})
.post(upload.single('imageFile'), (req, res) => {
  console.log("post method");
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.status(405).send('405: Method not allowed!');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.status(405).send('405: Method not allowed!');
});

module.exports = uploadRouter;
