const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
  name: {
    type: String,
    default: '',
    required: true,
    minlength: 2,
    maxlength: 100
  }
});

const categorySchema = new Schema({
  name: {
    type: String,
    default: '',
    required: true,
    minlength: 2,
    maxlength: 100
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
