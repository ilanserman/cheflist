const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

//Maybe add RUT empresa??

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
    supplier: {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
