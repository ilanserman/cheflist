// mus is minimum unit sale, eg: 1 box
// temperature: dry, frozen, refrigerated, etc.
// mud description eg: 1 box of 12 units

const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const elasticsearch = require('elasticsearch');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const productSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: true
  },
  grossPrice: {
    type: Currency,
    min: 0,
    required: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId , ref: 'Supplier'
  },
  /*mus: {
    type: Number,
    default: '',
    required: true
  },
  musDescription: {
    type: String,
    default: '',
    required: true
  },
  temperature: {
    type: String,
    default: '',
  },

  saleByUnit: {
    type: Boolean,
    default: false
  },
  category: {
    type: mongoose.Schema.Types.ObjectId , ref: 'Category'
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory'
  }*/
},
{
  timestamps: true
});

var esClient = new elasticsearch.Client({
  host: 'https://search-products-pkabqjzopjvn5ndw2f5vpdpxsu.us-east-1.es.amazonaws.com:443',
  //auth: 'cheflist:Elastic$1',
  apiVersion: '7.7'
});
productSchema.plugin(mongoosastic, {
  esClient: esClient
})

var Product = mongoose.model('Product', productSchema);

module.exports = Product;
