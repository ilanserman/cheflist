const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  phoneNumber: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },

});

var Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
