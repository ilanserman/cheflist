var authenticate = require('../authenticate');
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
  res.statusCode = 403;
  res.end('GET NOT IMPLEMENTED ON /products/');
})
.push(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifySupplier, (req,res,next) => {
  if (req.body.name)
  name = req.body.name;
  if (req.body.mus)
  name = req.body.mus;
  if (req.body.musDescription)
  name = req.body.musDescription;
  if (req.body.temperature)
  name = req.body.temperature;
  if (req.body.grossPrice)
  name = req.body.grossPrice;
  if (req.body.saleByUnit)
  name = req.body.saleByUnit;

  product = new Product()
})
.put(cors.corsWithOptions, (req,res,next) => {
  res.statusCode = 403;
  res.end('PUT NOT IMPLEMENTED ON /products/');
})
.delete(cors.corsWithOptions, (req,res,next) => {
  res.statusCode = 403;
  res.end('GET NOT IMPLEMENTED ON /products/');
})

products.route('/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get()
.push()
.put()
.delete()

module.exports = router;
