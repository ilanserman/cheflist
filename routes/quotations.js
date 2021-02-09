// Service for users to send quotations to suppliers
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


//Takes an array of individual product quotations
//returns an array of json objects with product quotations grouped by suppliers
//Refactor this function for efficiency later
function processQuotations(quotations) {
  var suppliers = []
  var quotationsBySupplier = [[],[]];

  quotations.forEach( q => {
    if(suppliers.includes(q.supplier)) suppliers.push(q.supplier);
  });

  var index = 0;
  for(supplier in suppliers) {
    quotationsBySupplier[index][0].push(supplier);
    index++;
  }

  for(qxs in quotationsBySupplier) {
    for(quotation in quotations) {
      if(quotation.supplier === quotationsBySupplier[0]) qxs[1].push(quotation);
    }
  }

  return quotationsBySupplier;
};


router.route('/placeQuotations/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  let quotations = {
    //THIS DEPENDS ON INPUT FROM FORM
  }
});







//Erase this route
// User sends a quotation to the supplier
router.route('/placeQuote/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  //req.user._id gets user id
  let quotation = {
    'user': req.body.name,
    'supplier': mongoose.Types.ObjectId(req.body.supplierId),
    'product': mongoose.Types.ObjectId(req.body.productId),
    'quantity': req.body.quantity
  };
  Quotation.create(quotation, (err,quotation) => {
    console.log("quotation: " + quotation);
    if(err)
      res.status(500).json(err);
    res.status(200).json(quotation);
  })
});

// Supplier replies with an amount for the quoted products
router.route('/replyQuote/:quotationId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifySupplier,(req,res,next) => {
  Quotations.findById(req.params.quotationId, (err, quotation) => {
    if(quotation != null) {
      if (req.body.amount)
        quotation.amount = req.body.amount;
      quotation.save((err,doc) => {
        if(err)
          res.status(500).json(err);
        res.status(200).json(quotation);
      })
    }
  })
});

module.exports = router;
