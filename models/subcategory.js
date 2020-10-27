const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
  name: {
    type: String,
    default: '',
    required: true,
    minlength: 2,
    maxlength: 100
  },
  category: {
    type: mongoose.Schema.Types.ObjectId , ref: 'Category' 
  }
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;
