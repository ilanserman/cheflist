var Users = require('../models/user');
var authenticate = require('../authenticate');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('./cors');
var emailValidator = require("email-validator");
var passwordValidator = require('password-validator');
const crypto = require('crypto');
const mime = require('mime');
const multer = require('multer');

const Suppliers = require('../models/supplier');
const Categories = require('../models/category');

const supplierRouter = express.Router();

supplierRouter.use(express.json());
supplierRouter.use(express.urlencoded({ extended: false }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/var/www/images/logos');
    },
    filename: (req, file, cb) => {
      crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
      })
    }
});

//Multer for image upload configuration
const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can only upload image files!'), false);
    }
    cb(null, true);
};
const imageLimits = { fieldSize: 500000 };
const upload = multer({ storage: storage, fileFilter: imageFileFilter, limits: imageLimits});
const uploadRouter = express.Router();

supplierRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  Suppliers.find(req.query)
  .then( (suppliers) =>{
    res.statusCode = 200;
    res.setHeader('Content-type','application/json');
    res.json(suppliers);
  }, (err)=>next(err)).catch((err)=>next(err));
})

supplierRouter.route('/:supplierId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  Suppliers.findById(req.params.supplierId)
  .populate('products')
  .then((products) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(products);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
.put(cors.corsWithOptions, upload.single('imageFile'), (req,res,next) => {
  Suppliers.findById(req.params.supplierId, (err, supplier) => {
    if(supplier != null) {
      if (req.body)
      supplier.tradeName = req.body.tradeName;
      if(req.file) {
        var imagePath = req.file.path.slice(8); //removes /var/www/
        supplier.logo = imagePath;
      }
      supplier.save()
      .then((supplier) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
      })
    }
  })
});

supplierRouter.route('/:supplierId/products')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  Suppliers.findById(req.params.supplierId, (err,supplier) => {
    if( supplier != null ) {

    }
  })
})
.put(cors.corsWithOptions, (req,res,next) => {
  res.statusCode = 403;
  res.end('NOT IMPLEMENTED ON /suppliers/'+ req.params.supplierId);
  //MUST IMPLEMENT THIS!
})
.post(cors.corsWithOptions, (req,res,next) => {
  Suppliers.findById(req.params.supplierId, (err,supplier) => {
    if( supplier != null ) {
      for(let i = 0 ; i < req.body.length ; i++) {
          supplier.products.push( req.body[i] );
      }
      supplier.save()
      .then((supplier) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(supplier);
      })
    }
  })
})
.delete(cors.corsWithOptions, (req,res,next) => {
  res.statusCode = 403;
  res.end('NOT IMPLEMENTED ON /dishes/'+ req.params.supplierId);
});

supplierRouter.route('/:supplierId/products/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  Suppliers.findById(req.params.supplierId, (err,supplier) => {
    if( supplier != null ) {
        product = supplier.products.id(req.params.productId); //.id method returns a value, not a promise
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(product);
      }
    })   .catch((err)=>next(err));
  })

.put(cors.corsWithOptions, (req, res, next) => {
  Suppliers.findByIdAndUpdate(req.params.supplierId , (err,supplier) => {
    if(supplier != null) {
      if (req.body.name)
      supplier.products.id(req.params.productId).name = req.body.name;
      if (req.body.mus)
      supplier.products.id(req.params.productId).mus = req.body.mus;
      if (req.body.mus)
      supplier.products.id(req.params.productId).musDescription = req.body.musDescription;
      if (req.body.mus)
      supplier.products.id(req.params.productId).temperature = req.body.temperature;
      if (req.body.mus)
      supplier.products.id(req.params.productId).grossPrice = req.body.grossPrice;
      if (req.body.mus)
      supplier.products.id(req.params.productId).saleByUnit = req.body.saleByUnit;
      if (req.body.mus)
      supplier.products.id(req.params.productId).category = req.body.category;
      supplier.save()
      .then((supplier) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(supplier);
      })
    }
  },(err)=>next(err)).catch((err)=>next(err));
})
.delete(cors.corsWithOptions, (req, res, next) => {
  Suppliers.findById(req.params.supplierId, (err,supplier) => {
    if( supplier.user.equals(req.user._id) && supplier != null && supplier.products.id(req.params.productId) != null) {
      supplier.products.id(req.params.commentId).remove();
      supplier.save()
      .then((supplier) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(supplier);
      }, (err) => next(err));
    }
    else if (supplier == null) {
      err = new Error('Product ' + req.params.productId + ' not found');
      err.status = 404;
      return next(err);
    }
    else {
      err = new Error('Product ' + req.params.productId + ' not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
    .catch((err) => next(err))
});

//Categories route
supplierRouter.route('/:supplierId/category/:categoryId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  Suppliers.findById(req.params.supplierId, (err,supplier) => {
    .populate('products')
    .then((products) => {

    })
  })
});





module.exports = supplierRouter;
