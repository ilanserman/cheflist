const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

//Maybe add RUT empresa??

const favSuppliersSchema = new Schema({
  suppliers: {
    type: mongoose.Schema.Types.ObjectId , ref: 'Supplier'
  }
});

const favProductsSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId , ref: 'Product'
  }
})

const User = new Schema({
  firstname:{
    type: String,
    default: '',
    maxlength: 30
  },
  lastname:{
    type: String,
    default: '',
  },
  company:{
    type: String,
    default: '',
    required: false,
    maxlength: 40
  },
  phoneNumber:{
    type: Number,
    default: ''
  },
  rut: {
    type: String,
    required: false
  },
  admin: {
    type: Boolean,
    default: false
  },
  isSupplier: {
    type: Boolean,
    default: false
  },
  supplierId:{
    type: mongoose.Schema.Types.ObjectId , ref: 'Supplier'
  },
  favSuppliers:[favSuppliersSchema], //check that they dont add a product in supplier
  favProducts:[favProductsSchema],

  resetPasswordToken: String,
  resetPasswordExpiration: Date
},{
  timestamps: true
});

//fechas de login y tiempo de sesion, contador de busquedas

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
