// mus is minimum unit sale, eg: 1 box
// temperature: dry, frozen, refrigerated, etc.
// mud description eg: 1 box of 12 units

const mongoose = require('mongoose');
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

var Product = mongoose.model('Product', productSchema);
module.exports = Product;
