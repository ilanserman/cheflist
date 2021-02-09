const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const quotationSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId , ref: 'User'
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId , ref: 'Supplier'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId , ref: 'Product'
  },
  quantity: {
    type: Number
  },
  amount: {
    type:
  }
},{
  {timestamps: true}
});

var Quotation = mongoose.model('Quotation', quotationSchema);
module.exports = Quotation;
