const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const User = require('../models/user');
const Supplier = require('../models/supplier')
const Product = require('../models/product')

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  User.findById( req.user._id )
    .populate('favSuppliers')
    .populate('favProducts')
    .then((favorites) => {
        res.status(200).json(favorites);
    }, (err) => next(err)).catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    return res.status(403).send('POST operation not supported on /favorites/');
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    return res.status(403).send('PUT operation not supported on /favorites/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  return res.status(403).send('DELETE operation not supported on /favorites/');
});

router.route('/suppliers')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  User.findById(req.user._id, (err, user) => {
    user.populate('favSuppliers');
    if(err)
      return res.status(500).send('Unknown error.');
    res.status(200).json(user.favSuppliers);
  })
});

router.route('/suppliers/:supplierId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  User.findById( req.user._id, (err, user) => {
    user.populate('favSuppliers');
    let supplierId = mongoose.Types.ObjectId(req.params.supplierId);
    user.favSuppliers.some((supplier) => {
     if(supplier.equals(supplierId))
      return res.status(200).json({"exists": true})
     return res.status(200).json({"exists": false});
    });
  })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Supplier.findById(req.params.supplierId, (err,supplier) => {
    console.log("inside supplier findbyid");
    if(err)
      return res.status(500).send('Unknown error.');
    if(!supplier) return res.status(404).send('Supplier not found');
    User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: {favSuppliers: {_id:req.params.supplierId} } },
      (err, user) => {
        if(err) next(err);
        if(!user) return res.status(404).send('User not found');
        res.status(200).json(user.favSuppliers);
      }
    )
  })
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
    res.status(403).send('PUT operation not supported on /favorites/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id, (err,user)=>{
    if(err) next(err);
    if(!user) return res.status(401).send('User not found');
    user.favSuppliers.pull({_id:req.params.supplierId})
    user.save((err,user) => {
      if(err) next(err);
      res.status(200).json(user.favSuppliers);
    })
  })
});

router.route('/products')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  User.findById(req.user._id, (err, user) => {
    if(err) next(err);
    user.populate('favProducts', (err, favProducts) => {
      if(err) next(err);
      res.status(200).json({"favIds":user.favProducts});
    })
  })
})
.post(cors.cors, authenticate.verifyUser, (req,res,next) => {
  res.status(403).send('Post method not supported on /favorites/products');
});

router.route('/products/:productId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  User.findById( req.user._id, (err, user) => {
    user.populate('favProducts');
    let productId = mongoose.Types.ObjectId(req.params.productId);
    for(product of user.favProducts) {
      if(product._id.equals(req.params.productId))
        return res.status(200).json({"exists": true})
    }
    return res.status(200).json({"exists": false});
  })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Product.findById(req.params.productId, (err,product) => {
    console.log('inside post favorite product');
    if(err) next(err);
    if(!product) return res.status(404).send('Product not found');
    console.log("will add to favs...")
    User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: {favProducts: {_id:req.params.productId} } },
      (err, user) => {
        if(err) next(err);
        if(!user) return res.status(404).send('User not found');
        res.status(200).json({"status":"ok"});
      }
    )
  })
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
    res.status(403).send('PUT operation not supported on /favorites/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  console.log("delete method called");
  User.findById(req.user._id, (err,user)=>{
    if(err) next(err);
    if(!user) return res.status(404).send('User not found');
    user.favProducts.pull({_id:req.params.productId})
    user.save((err,user) => {
      if(err) next(err);
      res.status(200).json({"status":"deleted"});
    })
  })
});

module.exports = router;
