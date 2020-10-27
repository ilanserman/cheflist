const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Categories = require('../models/category');

const categoriesRouter = express.Router();

categoriesRouter.use(express.json());
categoriesRouter.use(express.urlencoded({ extended: false }));

categoriesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Categories.find({}, (err,docs) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(docs);
    }, (err) => next(err)).catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  if(req.body.name != null) {
    category = new Categories({name: req.body.name});
    category.save()
    .then((category) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(category);
    }, (err)=>next(err) )
    .catch((err) => next(err));
  }
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /categories/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /categories/');
});

categoriesRouter.route('/:categoryId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Categories.findByIdAndDelete( req.params.categoryId , (err, category) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(category);
        }, (err) => next(err))
        .catch((err) => next(err));
});

module.exports = categoriesRouter;
