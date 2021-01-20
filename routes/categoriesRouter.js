//Inside this route, you can find access to both categories and subcategories
const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Categories = require('../models/category');
const Subcategories = require('../models/subcategory');
const Products = require('../models/product');

const categoriesRouter = express.Router();

categoriesRouter.use(express.json());
categoriesRouter.use(express.urlencoded({ extended: false }));

categoriesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Categories.find({}, (err,categories) => {
      return res.status(200).json(categories);
    }, (err) => next(err)).catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  if(req.body.name != null)
  Categories.create({name: req.body.name} , (err,category) => {
    if(err)
      res.status(500).json(err);
    res.status(200).json(category);
  });
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req,res,next) => {
  res.status(403).send('PUT operation not supported on /categories/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,
 (req,res,next) => {
  res.status(403).send('DELETE operation not supported on /categories/');
});

categoriesRouter.route('/:categoryName')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req, res, next) => {
  Products.find({category:req.params.categoryName})
  .then( (products) => {
    return res.status(200).json(products);
  })
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Categories.findByIdAndDelete( req.params.categoryName , (err, category) => {
      return res.status(200).json(category);
        }, (err) => next(err))
        .catch((err) => next(err));
});

categoriesRouter.route('/subcategories')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Subcategories.find({}, (err,subcategories) => {
      res.status(200).json(subcategories);
    }, (err) => next(err)).catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,
  (req, res, next) => {
    if(req.body.name != null && req.body.category != null)
      Subcategories.create(
        {
          name: req.body.name,
          category: mongoose.Types.ObjectId(req.body.category)
        },
        (err, subcategory) => {
        if(err)
          return res.status(500).json(err);
        res.status(200).json(subcategory);
      })
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req,res,next) => {
    res.status(403).send('PUT operation not supported on /categories/subcategories/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  res.status(403).send('PUT operation not supported on /categories/subcategories/');
});



module.exports = categoriesRouter;
