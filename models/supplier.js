const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const supplierSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId , ref: 'User'
  },
  tradeName: {
    type: String,
    default: ""
  },
  logo: {
    type: String,
    default: ""
  },
  products: [productSchema]
},{
  timestamps: true
}
)

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
