const config = require('../config');
const authenticate = require('../authenticate');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('./cors');
const Products = require('../models/product');
const escapeStringRegexp = require('escape-string-regexp');
const Client = require('@elastic/elasticsearch');

const esclient = new Client({
  node: config.elasticsearchUrl,
  auth: {
    username: config.elasticsearch.username,
    password: config.elasticsearch.password
  }
});



const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req,res,next) => {
  //console.log('get search invoked with query: ' + req.query.q);
  let query = escapeStringRegexp(req.query.q);
  if(query === "")
    return res.status(200).send("");
  Products.find({name:new RegExp(query,'i')}, (err,docs) => {
    if(err)
      res.status(500).json(err);
    res.status(200).json(docs);
  })
})
.post(cors.corsWithOptions, (req,res,next) => {
  return res.status(403).send('POST operation not supported on /search/');
})
.put(cors.corsWithOptions, (req,res,next) => {
  return res.status(403).send('PUT operation not supported on /search/');
})
.delete(cors.corsWithOptions, (req,res,next) => {
  return res.status(403).send('DELETE operation not supported on /search/');
})

router.route('/es')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req,res,next) => {
  let query = escapeStringRegexp(req.query.q);
  if(query === "")
    return res.status(400).json({status: 'no empty queries allowed',success: false});

    esclient.search({
      index: 'my-index',
      from: 20,
      size: 10,
      body: { foo: 'bar' }
    }, {
      ignore: [404],
      maxRetries: 3
    }, (err, result) => {
      if (err) console.log(err)
      return result;
    })

});






//https://www.codegrepper.com/code-examples/javascript/express+get+query+params+from+url
//FOR USING QUERY!!!!
module.exports = router;

/*

const escapeStringRegexp = require('escape-string-regexp');
router.route('/:q')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  console.log("inside get");
  console.log("query: " + req.params.q);
  let query = escapeStringRegexp(req.params.q);
  console.log("past regex query");
  Products.find({ name: { query } }, (err,docs) => {
    if(err)
      res.status(500).json(err);
    res.status(200).json(docs);
  });
});
*/
