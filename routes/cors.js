const express = require('express');
const cors = require('cors');
const app = express();

var allowlist = ['http://localhost:8100','http://cheflist.cl:80', 'https://cheflist:443', 'http://www.cheflist.cl:80', 'https://www.cheflist.cl:443'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    //console.log( "req.header('Origin'): " + req.header('Origin')); //Newer browsers don't send an origin header anymore so this method  doesnt work
    if(allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: "cheflist.cl" };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
