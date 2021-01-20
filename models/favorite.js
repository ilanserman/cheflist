const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId , ref: 'User' },
  suppliers: [{ type: mongoose.Schema.Types.ObjectId , ref: 'Supplier' }],
  products: [{ type: mongoose.Schema.Types.ObjectId , ref: 'Product' }],
});

var Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;
