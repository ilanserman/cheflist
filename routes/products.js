const authenticate = require('../authenticate');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('./cors');
const Products = require('../models/product');

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req,res,next) => {
  Products.find({})
  .then( (products) =>{
    res.status(200).json(products);
  }, (err)=>next(err)).catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  let prod = {
    "name": req.body.name,
    "grossPrice": req.body.grossPrice,
    "supplier": mongoose.Types.ObjectId(req.body.supplierId),
  };
  Products.create(prod, (err,product) => {
    console.log("product: " + prod);
    if(err)
      res.status(500).json(err);
    res.status(200).json(product);
  })
})
.put(cors.corsWithOptions, (req,res,next) => {
  res.statusCode = 403;
  res.end('PUT NOT IMPLEMENTED ON /products/');
})
.delete(cors.corsWithOptions, (req,res,next) => {
  res.statusCode = 403;
  res.end('DELETE NOT IMPLEMENTED ON /products/');
})

router.route('/insertmany')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  res.status(400).send('GET NOT IMPLEMENTED ON /products/insertMany');
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  res.status(400).send('PUT NOT IMPLEMENTED ON /products/insertMany');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next) => {
  Products.insertMany(req.body, (err,products) => {
    if(err) next(err)
    return res.status(200).json(products);
  })
})


router.route('/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  Products.findById(req.params.productId)
  .then((product) => {
    res.status(200).json(product);
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.route('/supplier/:supplierId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  Products.find( { supplier: { $eq:mongoose.Types.ObjectId(req.params.supplierId) } }, (err,products) => {
    if(err) res.status(500).send('error');
    res.status(200).json(products);
  })
})

module.exports = router;
